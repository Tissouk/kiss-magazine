-- Function to get user community stats
CREATE OR REPLACE FUNCTION get_user_community_stats(user_uuid UUID)
RETURNS TABLE (
    total_posts INTEGER,
    total_likes INTEGER,
    total_comments INTEGER,
    korea_verified_posts INTEGER,
    followers_count INTEGER,
    following_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM community_posts WHERE user_id = user_uuid AND status = 'approved'),
        (SELECT COALESCE(SUM(likes_count), 0)::INTEGER FROM community_posts WHERE user_id = user_uuid AND status = 'approved'),
        (SELECT COUNT(*)::INTEGER FROM community_post_comments WHERE user_id = user_uuid AND status = 'approved'),
        (SELECT COUNT(*)::INTEGER FROM community_posts WHERE user_id = user_uuid AND status = 'approved' AND korea_trip_verified = true),
        (SELECT COUNT(*)::INTEGER FROM user_follows WHERE following_id = user_uuid),
        (SELECT COUNT(*)::INTEGER FROM user_follows WHERE follower_id = user_uuid);
END;
$$ LANGUAGE plpgsql;

-- Function to get Korean brands with stats
CREATE OR REPLACE FUNCTION get_korean_brands_with_stats()
RETURNS TABLE (
    id UUID,
    name VARCHAR(200),
    slug VARCHAR(200),
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    instagram_handle VARCHAR(100),
    founded_year INTEGER,
    headquarters_city VARCHAR(100),
    brand_story TEXT,
    verified BOOLEAN,
    product_count INTEGER,
    avg_rating DECIMAL(3,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        kb.id,
        kb.name,
        kb.slug,
        kb.description,
        kb.logo_url,
        kb.website_url,
        kb.instagram_handle,
        kb.founded_year,
        kb.headquarters_city,
        kb.brand_story,
        kb.verified,
        COUNT(p.id)::INTEGER as product_count,
        COALESCE(AVG(p.rating), 0)::DECIMAL(3,2) as avg_rating
    FROM korean_brands kb
    LEFT JOIN products p ON kb.id = p.korean_brand_id AND p.published = true
    GROUP BY kb.id, kb.name, kb.slug, kb.description, kb.logo_url, kb.website_url, 
             kb.instagram_handle, kb.founded_year, kb.headquarters_city, kb.brand_story, kb.verified
    ORDER BY product_count DESC, avg_rating DESC;
END;
$$ LANGUAGE plpgsql;

-- Add user_follows table for social features
CREATE TABLE IF NOT EXISTS user_follows (
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Add indexes for performance
CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_id);
CREATE INDEX idx_community_posts_user_status ON community_posts(user_id, status);
CREATE INDEX idx_community_post_tags_tag_name ON community_post_tags(tag_name);
CREATE INDEX idx_moderation_queue_status_priority ON moderation_queue(status, priority);