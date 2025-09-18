-- Admin action logs table
CREATE TABLE IF NOT EXISTS admin_action_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    details JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to get order statistics
CREATE OR REPLACE FUNCTION get_order_statistics()
RETURNS TABLE (
    total_orders INTEGER,
    pending_orders INTEGER,
    processing_orders INTEGER,
    shipped_orders INTEGER,
    delivered_orders INTEGER,
    total_revenue DECIMAL(12,2),
    korean_product_revenue DECIMAL(12,2),
    average_order_value DECIMAL(8,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END)::INTEGER as pending_orders,
        COUNT(CASE WHEN status = 'processing' THEN 1 END)::INTEGER as processing_orders,
        COUNT(CASE WHEN status = 'shipped' THEN 1 END)::INTEGER as shipped_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END)::INTEGER as delivered_orders,
        COALESCE(SUM(total_amount), 0)::DECIMAL(12,2) as total_revenue,
        COALESCE(SUM(
            CASE WHEN EXISTS(
                SELECT 1 FROM order_line_items oli
                INNER JOIN products p ON oli.product_id = p.id
                WHERE oli.order_id = orders.id AND p.is_korean_brand = true
            ) THEN total_amount ELSE 0 END
        ), 0)::DECIMAL(12,2) as korean_product_revenue,
        CASE 
            WHEN COUNT(*) > 0 THEN (SUM(total_amount) / COUNT(*))::DECIMAL(8,2)
            ELSE 0
        END as average_order_value
    FROM orders
    WHERE status IN ('processing', 'shipped', 'delivered');
END;
$$ LANGUAGE plpgsql;

-- Function to get content moderation queue stats
CREATE OR REPLACE FUNCTION get_moderation_queue_stats()
RETURNS TABLE (
    pending_posts INTEGER,
    pending_comments INTEGER,
    pending_reviews INTEGER,
    high_priority_items INTEGER,
    average_resolution_time_hours DECIMAL(8,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(CASE WHEN content_type = 'post' AND status = 'pending' THEN 1 END)::INTEGER as pending_posts,
        COUNT(CASE WHEN content_type = 'comment' AND status = 'pending' THEN 1 END)::INTEGER as pending_comments,
        COUNT(CASE WHEN content_type = 'review' AND status = 'pending' THEN 1 END)::INTEGER as pending_reviews,
        COUNT(CASE WHEN priority >= 3 AND status = 'pending' THEN 1 END)::INTEGER as high_priority_items,
        COALESCE(AVG(
            CASE WHEN resolved_at IS NOT NULL THEN 
                EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600
            END
        ), 0)::DECIMAL(8,2) as average_resolution_time_hours
    FROM moderation_queue;
END;
$$ LANGUAGE plpgsql;

-- Function to get Korean culture engagement metrics
CREATE OR REPLACE FUNCTION get_korean_culture_engagement()
RETURNS TABLE (
    total_korean_posts INTEGER,
    korea_verified_posts INTEGER,
    korean_product_orders INTEGER,
    korean_brand_reviews INTEGER,
    average_korean_post_engagement DECIMAL(8,2),
    top_korean_tags TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM community_posts cp
         INNER JOIN community_post_tags cpt ON cp.id = cpt.post_id
         WHERE cp.status = 'approved' 
         AND (cpt.tag_name ILIKE '%korea%' OR cpt.tag_name ILIKE '%k-%' OR cpt.tag_name ILIKE '%korean%')),
        
        (SELECT COUNT(*)::INTEGER FROM community_posts 
         WHERE status = 'approved' AND korea_trip_verified = true),
        
        (SELECT COUNT(*)::INTEGER FROM order_line_items oli
         INNER JOIN products p ON oli.product_id = p.id
         WHERE p.is_korean_brand = true),
        
        (SELECT COUNT(*)::INTEGER FROM product_reviews pr
         INNER JOIN products p ON pr.product_id = p.id
         WHERE p.is_korean_brand = true AND pr.status = 'approved'),
        
        (SELECT COALESCE(AVG(likes_count + comments_count), 0)::DECIMAL(8,2)
         FROM community_posts cp
         INNER JOIN community_post_tags cpt ON cp.id = cpt.post_id
         WHERE cp.status = 'approved' 
         AND (cpt.tag_name ILIKE '%korea%' OR cpt.tag_name ILIKE '%k-%')),
        
        (SELECT ARRAY_AGG(tag_name ORDER BY tag_count DESC)
         FROM (
             SELECT cpt.tag_name, COUNT(*) as tag_count
             FROM community_post_tags cpt
             INNER JOIN community_posts cp ON cpt.post_id = cp.id
             WHERE cp.status = 'approved'
             AND (cpt.tag_name ILIKE '%korea%' OR cpt.tag_name ILIKE '%k-%')
             GROUP BY cpt.tag_name
             ORDER BY tag_count DESC
             LIMIT 10
         ) top_tags);
END;
$$ LANGUAGE plpgsql;

-- Function to get user activity summary for admin
CREATE OR REPLACE FUNCTION get_user_activity_summary(user_uuid UUID, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    posts_created INTEGER,
    comments_made INTEGER,
    points_earned INTEGER,
    points_spent INTEGER,
    orders_placed INTEGER,
    reviews_written INTEGER,
    last_activity TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    since_date TIMESTAMP WITH TIME ZONE;
BEGIN
    since_date := NOW() - (days_back || ' days')::INTERVAL;
    
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM community_posts 
         WHERE user_id = user_uuid AND created_at >= since_date),
        
        (SELECT COUNT(*)::INTEGER FROM community_post_comments 
         WHERE user_id = user_uuid AND created_at >= since_date),
        
        (SELECT COALESCE(SUM(points), 0)::INTEGER FROM loyalty_transactions 
         WHERE user_id = user_uuid AND type = 'earn' AND created_at >= since_date),
        
        (SELECT COALESCE(SUM(points), 0)::INTEGER FROM loyalty_transactions 
         WHERE user_id = user_uuid AND type = 'redeem' AND created_at >= since_date),
        
        (SELECT COUNT(*)::INTEGER FROM orders 
         WHERE user_id = user_uuid AND created_at >= since_date),
        
        (SELECT COUNT(*)::INTEGER FROM product_reviews 
         WHERE user_id = user_uuid AND created_at >= since_date),
        
        (SELECT MAX(created_at) FROM (
            SELECT created_at FROM community_posts WHERE user_id = user_uuid
            UNION ALL
            SELECT created_at FROM loyalty_transactions WHERE user_id = user_uuid
            UNION ALL
            SELECT created_at FROM orders WHERE user_id = user_uuid
            UNION ALL
            SELECT updated_at FROM users WHERE id = user_uuid
        ) all_activity);
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old data
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS INTEGER AS $$
DECLARE
    cleaned_count INTEGER := 0;
BEGIN
    -- Clean up old search analytics (older than 1 year)
    DELETE FROM search_analytics 
    WHERE created_at < NOW() - INTERVAL '1 year';
    GET DIAGNOSTICS cleaned_count = ROW_COUNT;
    
    -- Clean up old loyalty transactions for deleted users
    DELETE FROM loyalty_transactions 
    WHERE user_id NOT IN (SELECT id FROM users);
    
    -- Clean up expired discount codes
    UPDATE discount_codes 
    SET active = false 
    WHERE ends_at < NOW() AND active = true;
    
    -- Clean up old moderation queue items (resolved more than 6 months ago)
    DELETE FROM moderation_queue 
    WHERE status IN ('approved', 'rejected') 
    AND resolved_at < NOW() - INTERVAL '6 months';
    
    RETURN cleaned_count;
END;
$$ LANGUAGE plpgsql;

-- Indexes for admin performance
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_admin_id ON admin_action_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_target_user ON admin_action_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_created_at ON admin_action_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_level_created ON users(level, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_banned_until ON users(banned_until) WHERE banned_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user_type ON loyalty_transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_community_posts_status_created ON community_posts(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status_priority ON moderation_queue(status, priority DESC);

-- RLS policies for admin tables
ALTER TABLE admin_action_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin action logs
CREATE POLICY "Admins can view action logs" ON admin_action_logs FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    -- Add admin role check here when roles are implemented
));

-- Add a function to schedule cleanup
CREATE OR REPLACE FUNCTION schedule_cleanup()
RETURNS void AS $$
BEGIN
    -- This would typically be called by a cron job
    PERFORM cleanup_old_data();
    
    -- Log the cleanup
    INSERT INTO admin_action_logs (admin_id, action, details, notes)
    VALUES (
        NULL, 
        'system_cleanup', 
        '{"automated": true}'::jsonb,
        'Automated system cleanup executed'
    );
END;
$$ LANGUAGE plpgsql;