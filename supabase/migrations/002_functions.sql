-- Function to update user level based on points
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user level based on points
    NEW.level = CASE
        WHEN NEW.points >= 10000 THEN 'Diamond'
        WHEN NEW.points >= 5000 THEN 'Platinum'
        WHEN NEW.points >= 2000 THEN 'Gold'
        WHEN NEW.points >= 500 THEN 'Silver'
        ELSE 'Bronze'
    END;
    
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user level
CREATE TRIGGER trigger_update_user_level
    BEFORE UPDATE OF points ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_user_level();

-- Function to award points and create transaction
CREATE OR REPLACE FUNCTION award_points(
    user_uuid UUID,
    points_amount INTEGER,
    transaction_action VARCHAR(100),
    transaction_description TEXT DEFAULT NULL,
    reference_uuid UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_points INTEGER;
BEGIN
    -- Get current points
    SELECT points INTO current_points FROM users WHERE id = user_uuid;
    
    IF current_points IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Update user points
    UPDATE users 
    SET points = points + points_amount
    WHERE id = user_uuid;
    
    -- Create transaction record
    INSERT INTO loyalty_transactions (
        user_id, 
        points, 
        type, 
        action, 
        description, 
        reference_id
    ) VALUES (
        user_uuid,
        points_amount,
        'earn',
        transaction_action,
        transaction_description,
        reference_uuid
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to redeem points
CREATE OR REPLACE FUNCTION redeem_points(
    user_uuid UUID,
    points_amount INTEGER,
    transaction_action VARCHAR(100),
    transaction_description TEXT DEFAULT NULL,
    reference_uuid UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_points INTEGER;
BEGIN
    -- Get current points
    SELECT points INTO current_points FROM users WHERE id = user_uuid;
    
    IF current_points IS NULL OR current_points < points_amount THEN
        RETURN FALSE;
    END IF;
    
    -- Update user points
    UPDATE users 
    SET points = points - points_amount
    WHERE id = user_uuid;
    
    -- Create transaction record
    INSERT INTO loyalty_transactions (
        user_id, 
        points, 
        type, 
        action, 
        description, 
        reference_id
    ) VALUES (
        user_uuid,
        points_amount,
        'redeem',
        transaction_action,
        transaction_description,
        reference_uuid
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate product rating
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating DECIMAL(3,2);
    review_count INTEGER;
BEGIN
    -- Calculate average rating and count
    SELECT 
        COALESCE(AVG(rating), 0)::DECIMAL(3,2),
        COUNT(*)
    INTO avg_rating, review_count
    FROM product_reviews 
    WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    AND status = 'approved';
    
    -- Update product
    UPDATE products
    SET 
        rating = avg_rating,
        review_count = review_count,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for product rating updates
CREATE TRIGGER trigger_update_product_rating_insert
    AFTER INSERT ON product_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_product_rating();

CREATE TRIGGER trigger_update_product_rating_update
    AFTER UPDATE ON product_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_product_rating();

CREATE TRIGGER trigger_update_product_rating_delete
    AFTER DELETE ON product_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_product_rating();

-- Function to update community post counts
CREATE OR REPLACE FUNCTION update_post_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'community_post_likes' THEN
        UPDATE community_posts
        SET likes_count = (
            SELECT COUNT(*) 
            FROM community_post_likes 
            WHERE post_id = COALESCE(NEW.post_id, OLD.post_id)
        )
        WHERE id = COALESCE(NEW.post_id, OLD.post_id);
    END IF;
    
    IF TG_TABLE_NAME = 'community_post_comments' THEN
        UPDATE community_posts
        SET comments_count = (
            SELECT COUNT(*) 
            FROM community_post_comments 
            WHERE post_id = COALESCE(NEW.post_id, OLD.post_id)
            AND status = 'approved'
        )
        WHERE id = COALESCE(NEW.post_id, OLD.post_id);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for post counts
CREATE TRIGGER trigger_update_likes_count
    AFTER INSERT OR DELETE ON community_post_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_post_counts();

CREATE TRIGGER trigger_update_comments_count
    AFTER INSERT OR UPDATE OR DELETE ON community_post_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_post_counts();

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'KM' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(nextval('order_number_seq')::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Trigger for order number generation
CREATE TRIGGER trigger_generate_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- Function to create raffle tickets when points are earned
CREATE OR REPLACE FUNCTION create_raffle_tickets()
RETURNS TRIGGER AS $$
DECLARE
    tickets_to_add INTEGER;
    current_month VARCHAR(7);
BEGIN
    -- Only create tickets for earning points
    IF NEW.type = 'earn' THEN
        -- Calculate tickets (100 points = 1 ticket)
        tickets_to_add = NEW.points / 100;
        
        IF tickets_to_add > 0 THEN
            current_month = TO_CHAR(NOW(), 'YYYY-MM');
            
            -- Insert or update raffle entry
            INSERT INTO raffle_entries (user_id, raffle_month, tickets_count)
            VALUES (NEW.user_id, current_month, tickets_to_add)
            ON CONFLICT (user_id, raffle_month)
            DO UPDATE SET tickets_count = raffle_entries.tickets_count + tickets_to_add;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for raffle tickets
CREATE TRIGGER trigger_create_raffle_tickets
    AFTER INSERT ON loyalty_transactions
    FOR EACH ROW
    EXECUTE FUNCTION create_raffle_tickets();

-- Function to get trending products
CREATE OR REPLACE FUNCTION get_trending_products(limit_count INTEGER DEFAULT 8)
RETURNS TABLE (
    id UUID,
    name VARCHAR(500),
    slug VARCHAR(500),
    price DECIMAL(10,2),
    currency VARCHAR(3),
    rating DECIMAL(3,2),
    review_count INTEGER,
    is_korean_brand BOOLEAN,
    image_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.slug,
        p.price,
        p.currency,
        p.rating,
        p.review_count,
        p.is_korean_brand,
        pi.url as image_url
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
    WHERE p.published = true
    ORDER BY 
        p.review_count DESC,
        p.rating DESC,
        p.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get user level progress
CREATE OR REPLACE FUNCTION get_user_level_progress(user_uuid UUID)
RETURNS TABLE (
    current_level user_level,
    current_points INTEGER,
    next_level user_level,
    points_needed INTEGER,
    progress_percentage INTEGER
) AS $$
DECLARE
    user_points INTEGER;
    user_level_val user_level;
    level_thresholds INTEGER[] = ARRAY[0, 500, 2000, 5000, 10000]; -- Bronze, Silver, Gold, Platinum, Diamond
    level_names user_level[] = ARRAY['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
    current_index INTEGER;
    next_threshold INTEGER;
    current_threshold INTEGER;
BEGIN
    -- Get user data
    SELECT points, level INTO user_points, user_level_val
    FROM users WHERE id = user_uuid;
    
    -- Find current level index
    current_index = CASE user_level_val
        WHEN 'Bronze' THEN 1
        WHEN 'Silver' THEN 2
        WHEN 'Gold' THEN 3
        WHEN 'Platinum' THEN 4
        WHEN 'Diamond' THEN 5
    END;
    
    current_threshold = level_thresholds[current_index];
    
    -- Calculate next level info
    IF current_index < 5 THEN
        next_threshold = level_thresholds[current_index + 1];
        
        RETURN QUERY SELECT 
            user_level_val,
            user_points,
            level_names[current_index + 1],
            next_threshold - user_points,
            ((user_points - current_threshold)::FLOAT / (next_threshold - current_threshold)::FLOAT * 100)::INTEGER;
    ELSE
        -- Max level reached
        RETURN QUERY SELECT 
            user_level_val,
            user_points,
            NULL::user_level,
            0,
            100;
    END IF;
END;
$$ LANGUAGE plpgsql;