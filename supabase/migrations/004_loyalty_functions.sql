-- Add reward redemptions table
CREATE TABLE IF NOT EXISTS reward_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reward_id VARCHAR(100) NOT NULL,
    reward_name VARCHAR(200) NOT NULL,
    reward_type VARCHAR(50) NOT NULL, -- 'discount', 'physical', 'digital', 'experience'
    points_cost INTEGER NOT NULL,
    shipping_address JSONB,
    fulfillment_data JSONB,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'shipped', 'delivered', 'completed'
    tracking_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to get monthly raffle statistics
CREATE OR REPLACE FUNCTION get_monthly_raffle_stats(target_month VARCHAR(7))
RETURNS TABLE (
    total_participants INTEGER,
    total_tickets INTEGER,
    average_tickets_per_user DECIMAL(5,2),
    top_participant_tickets INTEGER,
    winner_selected BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT re.user_id)::INTEGER as total_participants,
        COALESCE(SUM(re.tickets_count), 0)::INTEGER as total_tickets,
        CASE 
            WHEN COUNT(DISTINCT re.user_id) > 0 THEN 
                (COALESCE(SUM(re.tickets_count), 0)::DECIMAL / COUNT(DISTINCT re.user_id)::DECIMAL)
            ELSE 0
        END as average_tickets_per_user,
        COALESCE(MAX(re.tickets_count), 0)::INTEGER as top_participant_tickets,
        EXISTS(SELECT 1 FROM raffle_winners rw WHERE rw.raffle_month = target_month) as winner_selected
    FROM raffle_entries re
    WHERE re.raffle_month = target_month;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate user engagement score
CREATE OR REPLACE FUNCTION calculate_engagement_score(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    days_since_join INTEGER;
    recent_activity INTEGER;
BEGIN
    -- Get days since joining
    SELECT EXTRACT(DAY FROM NOW() - created_at)::INTEGER 
    INTO days_since_join 
    FROM users 
    WHERE id = user_uuid;
    
    -- Base score from points (1 point = 1 engagement point)
    SELECT COALESCE(points, 0) INTO score FROM users WHERE id = user_uuid;
    
    -- Bonus for recent activity (last 30 days)
    SELECT COUNT(*)::INTEGER * 10 
    INTO recent_activity
    FROM loyalty_transactions 
    WHERE user_id = user_uuid 
    AND type = 'earn'
    AND created_at >= NOW() - INTERVAL '30 days';
    
    score := score + recent_activity;
    
    -- Bonus for Korean culture engagement
    SELECT COALESCE(COUNT(*) * 50, 0)::INTEGER
    INTO recent_activity
    FROM community_posts 
    WHERE user_id = user_uuid 
    AND korea_trip_verified = true
    AND created_at >= NOW() - INTERVAL '90 days';
    
    score := score + recent_activity;
    
    -- Longevity bonus (more engaged over time)
    IF days_since_join > 30 THEN
        score := score + (days_since_join / 30) * 10;
    END IF;
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-award level-up badges
CREATE OR REPLACE FUNCTION award_level_up_badge()
RETURNS TRIGGER AS $$
BEGIN
    -- Award badge when user levels up
    IF OLD.level != NEW.level THEN
        INSERT INTO user_badges (user_id, name, description, icon)
        VALUES (
            NEW.id,
            CONCAT(NEW.level, ' Level Achieved'),
            CONCAT('Reached ', NEW.level, ' level in Korean culture community'),
            CASE NEW.level
                WHEN 'Silver' THEN '🥈'
                WHEN 'Gold' THEN '🥇'
                WHEN 'Platinum' THEN '💎'
                WHEN 'Diamond' THEN '💠'
                ELSE '🏆'
            END
        )
        ON CONFLICT (user_id, name) DO NOTHING;
        
        -- Award bonus points for level up
        INSERT INTO loyalty_transactions (user_id, points, type, action, description)
        VALUES (
            NEW.id,
            CASE NEW.level
                WHEN 'Silver' THEN 100
                WHEN 'Gold' THEN 250
                WHEN 'Platinum' THEN 500
                WHEN 'Diamond' THEN 1000
                ELSE 50
            END,
            'earn',
            'level_up_bonus',
            CONCAT('Level up bonus for reaching ', NEW.level, ' level')
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for level up badges
CREATE TRIGGER trigger_award_level_up_badge
    AFTER UPDATE OF level ON users
    FOR EACH ROW
    EXECUTE FUNCTION award_level_up_badge();

-- Function to cleanup expired discount codes
CREATE OR REPLACE FUNCTION cleanup_expired_discount_codes()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM discount_codes 
    WHERE ends_at < NOW() 
    AND active = true;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get Korean culture activity summary
CREATE OR REPLACE FUNCTION get_korean_culture_summary(user_uuid UUID)
RETURNS TABLE (
    korean_posts INTEGER,
    korea_verified_posts INTEGER,
    korean_product_purchases INTEGER,
    korean_brand_reviews INTEGER,
    cultural_engagement_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM community_posts cp 
         INNER JOIN community_post_tags cpt ON cp.id = cpt.post_id 
         WHERE cp.user_id = user_uuid AND cp.status = 'approved' 
         AND (cpt.tag_name LIKE '%korea%' OR cpt.tag_name LIKE '%k-%' OR cpt.tag_name LIKE '%korean%')),
        
        (SELECT COUNT(*)::INTEGER FROM community_posts 
         WHERE user_id = user_uuid AND korea_trip_verified = true),
        
        (SELECT COUNT(*)::INTEGER FROM order_line_items oli
         INNER JOIN orders o ON oli.order_id = o.id
         INNER JOIN products p ON oli.product_id = p.id
         WHERE o.user_id = user_uuid AND p.is_korean_brand = true),
        
        (SELECT COUNT(*)::INTEGER FROM product_reviews pr
         INNER JOIN products p ON pr.product_id = p.id
         WHERE pr.user_id = user_uuid AND p.is_korean_brand = true AND pr.status = 'approved'),
        
        calculate_engagement_score(user_uuid);
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX idx_reward_redemptions_user_id ON reward_redemptions(user_id);
CREATE INDEX idx_reward_redemptions_status ON reward_redemptions(status);
CREATE INDEX idx_reward_redemptions_created_at ON reward_redemptions(created_at DESC);
CREATE INDEX idx_raffle_entries_month ON raffle_entries(raffle_month);
CREATE INDEX idx_raffle_winners_month ON raffle_winners(raffle_month);
CREATE INDEX idx_loyalty_transactions_user_created ON loyalty_transactions(user_id, created_at DESC);