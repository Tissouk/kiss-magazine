-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom types
CREATE TYPE user_level AS ENUM ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond');
CREATE TYPE transaction_type AS ENUM ('earn', 'redeem');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE content_status AS ENUM ('draft', 'pending', 'approved', 'rejected');
CREATE TYPE product_category AS ENUM ('clothing', 'beauty', 'accessories', 'shoes', 'bags');
CREATE TYPE article_category AS ENUM ('K-POP', 'K-DRAMA', 'K-FASHION', 'K-BEAUTY', 'K-PLACES', 'K-NEWS');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    points INTEGER DEFAULT 0 CHECK (points >= 0),
    level user_level DEFAULT 'Bronze',
    korean_language_learner BOOLEAN DEFAULT false,
    preferred_language VARCHAR(10) DEFAULT 'en',
    preferred_currency VARCHAR(3) DEFAULT 'USD',
    country_code VARCHAR(2),
    birth_date DATE,
    marketing_consent BOOLEAN DEFAULT false,
    community_notifications BOOLEAN DEFAULT true,
    product_notifications BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    banned_until TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges table
CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(10),
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Loyalty points transactions
CREATE TABLE loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    type transaction_type NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    reference_id UUID, -- Can reference orders, posts, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Korean brands table
CREATE TABLE korean_brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    instagram_handle VARCHAR(100),
    founded_year INTEGER,
    headquarters_city VARCHAR(100) DEFAULT 'Seoul',
    brand_story TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    compare_price DECIMAL(10,2) CHECK (compare_price >= price),
    currency VARCHAR(3) DEFAULT 'USD',
    category product_category NOT NULL,
    subcategory VARCHAR(100),
    korean_brand_id UUID REFERENCES korean_brands(id),
    is_korean_brand BOOLEAN DEFAULT false,
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(50),
    weight_grams INTEGER,
    requires_shipping BOOLEAN DEFAULT true,
    taxable BOOLEAN DEFAULT true,
    inventory_quantity INTEGER DEFAULT 0 CHECK (inventory_quantity >= 0),
    inventory_policy VARCHAR(20) DEFAULT 'deny', -- 'continue' or 'deny'
    seo_title VARCHAR(200),
    seo_description TEXT,
    published BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    korean_exclusive BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product images
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text TEXT,
    position INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product variants (sizes, colors, etc.)
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    option1 VARCHAR(100), -- Size
    option2 VARCHAR(100), -- Color
    option3 VARCHAR(100), -- Material, etc.
    sku VARCHAR(100) UNIQUE,
    price DECIMAL(10,2) CHECK (price >= 0),
    compare_price DECIMAL(10,2),
    inventory_quantity INTEGER DEFAULT 0 CHECK (inventory_quantity >= 0),
    weight_grams INTEGER,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product tags (for Korean culture themes)
CREATE TABLE product_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    korean_term VARCHAR(100), -- Korean translation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product-tag relationships
CREATE TABLE product_tag_relationships (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES product_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, tag_id)
);

-- K-Beauty specific attributes
CREATE TABLE kbeauty_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    skin_types TEXT[], -- ['dry', 'oily', 'combination', 'sensitive', 'normal']
    skin_concerns TEXT[], -- ['acne', 'aging', 'pigmentation', 'dryness', 'sensitivity']
    key_ingredients TEXT[],
    korean_routine_step INTEGER, -- 1-10 for the Korean skincare routine
    ph_level DECIMAL(3,1),
    cruelty_free BOOLEAN DEFAULT true,
    vegan BOOLEAN DEFAULT false,
    fragrance_free BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Articles/Editorial content
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    excerpt TEXT,
    content JSONB, -- Rich content with blocks
    featured_image_url TEXT,
    category article_category NOT NULL,
    author_id UUID REFERENCES users(id),
    status content_status DEFAULT 'draft',
    featured BOOLEAN DEFAULT false,
    trending BOOLEAN DEFAULT false,
    read_time_minutes INTEGER,
    views_count INTEGER DEFAULT 0,
    seo_title VARCHAR(200),
    seo_description TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Article tags
CREATE TABLE article_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    korean_term VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Article-tag relationships
CREATE TABLE article_tag_relationships (
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES article_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

-- Influencers
CREATE TABLE influencers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    handle VARCHAR(100) UNIQUE NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    platform VARCHAR(50) NOT NULL, -- 'instagram', 'tiktok', 'youtube'
    follower_count INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2),
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    discount_code VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    contact_email VARCHAR(255),
    instagram_url TEXT,
    tiktok_url TEXT,
    youtube_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Influencer-product relationships
CREATE TABLE influencer_products (
    influencer_id UUID REFERENCES influencers(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    featured BOOLEAN DEFAULT false,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (influencer_id, product_id)
);

-- Community posts
CREATE TABLE community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_urls TEXT[],
    location VARCHAR(200),
    status content_status DEFAULT 'pending',
    points_awarded INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    korea_trip_verified BOOLEAN DEFAULT false,
    flagged_count INTEGER DEFAULT 0,
    moderated_by UUID REFERENCES users(id),
    moderated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community post tags
CREATE TABLE community_post_tags (
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    tag_name VARCHAR(100) NOT NULL,
    PRIMARY KEY (post_id, tag_name)
);

-- Community post likes
CREATE TABLE community_post_likes (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, post_id)
);

-- Community post comments
CREATE TABLE community_post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES community_post_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    flagged_count INTEGER DEFAULT 0,
    status content_status DEFAULT 'approved',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seoul trip raffle entries
CREATE TABLE raffle_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    raffle_month VARCHAR(7) NOT NULL, -- YYYY-MM format
    tickets_count INTEGER DEFAULT 1 CHECK (tickets_count > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, raffle_month)
);

-- Seoul trip winners
CREATE TABLE raffle_winners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    raffle_month VARCHAR(7) NOT NULL,
    prize_type VARCHAR(50) DEFAULT 'seoul_trip',
    prize_description TEXT,
    claimed BOOLEAN DEFAULT false,
    claimed_at TIMESTAMP WITH TIME ZONE,
    trip_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    email VARCHAR(255) NOT NULL,
    status order_status DEFAULT 'pending',
    currency VARCHAR(3) DEFAULT 'USD',
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    points_earned INTEGER DEFAULT 0,
    points_used INTEGER DEFAULT 0,
    
    -- Shipping details
    shipping_first_name VARCHAR(100),
    shipping_last_name VARCHAR(100),
    shipping_company VARCHAR(200),
    shipping_address1 VARCHAR(500),
    shipping_address2 VARCHAR(500),
    shipping_city VARCHAR(100),
    shipping_province VARCHAR(100),
    shipping_postal_code VARCHAR(20),
    shipping_country VARCHAR(100),
    shipping_phone VARCHAR(50),
    
    -- Billing details
    billing_first_name VARCHAR(100),
    billing_last_name VARCHAR(100),
    billing_company VARCHAR(200),
    billing_address1 VARCHAR(500),
    billing_address2 VARCHAR(500),
    billing_city VARCHAR(100),
    billing_province VARCHAR(100),
    billing_postal_code VARCHAR(20),
    billing_country VARCHAR(100),
    billing_phone VARCHAR(50),
    
    -- Fulfillment
    tracking_number VARCHAR(100),
    tracking_url TEXT,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    
    -- Payment
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    stripe_payment_intent_id VARCHAR(200),
    
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order line items
CREATE TABLE order_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    product_title VARCHAR(500),
    variant_title VARCHAR(200),
    sku VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shopping cart (for persistent cart)
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255), -- For guest users
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id, variant_id),
    UNIQUE(session_id, product_id, variant_id)
);

-- Product reviews
CREATE TABLE product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id), -- Verified purchase
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    content TEXT,
    images TEXT[],
    helpful_count INTEGER DEFAULT 0,
    verified_purchase BOOLEAN DEFAULT false,
    status content_status DEFAULT 'pending',
    moderated_by UUID REFERENCES users(id),
    moderated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review helpfulness votes
CREATE TABLE review_votes (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    review_id UUID REFERENCES product_reviews(id) ON DELETE CASCADE,
    helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, review_id)
);

-- Wishlists
CREATE TABLE wishlists (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, product_id)
);

-- Content moderation queue
CREATE TABLE moderation_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_type VARCHAR(50) NOT NULL, -- 'post', 'comment', 'review'
    content_id UUID NOT NULL,
    priority INTEGER DEFAULT 1, -- 1=low, 2=medium, 3=high
    flagged_reason VARCHAR(100),
    flagged_by UUID REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_review', 'approved', 'rejected'
    moderator_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discount codes
CREATE TABLE discount_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed_amount'
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_order_amount DECIMAL(10,2),
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    per_customer_limit INTEGER DEFAULT 1,
    starts_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discount code usage tracking
CREATE TABLE discount_code_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discount_code_id UUID REFERENCES discount_codes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    order_id UUID REFERENCES orders(id),
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter subscriptions
CREATE TABLE newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    subscribed BOOLEAN DEFAULT true,
    language VARCHAR(10) DEFAULT 'en',
    interests TEXT[], -- ['k-pop', 'k-beauty', 'k-fashion', etc.]
    subscribe_source VARCHAR(100), -- 'website', 'checkout', 'popup'
    confirmed BOOLEAN DEFAULT false,
    confirmation_token VARCHAR(100),
    unsubscribe_token VARCHAR(100) UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Search analytics
CREATE TABLE search_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(255),
    query TEXT NOT NULL,
    results_count INTEGER DEFAULT 0,
    clicked_product_id UUID REFERENCES products(id),
    clicked_position INTEGER,
    no_results BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_points ON users(points DESC);
CREATE INDEX idx_users_level ON users(level);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_korean_brand ON products(is_korean_brand);
CREATE INDEX idx_products_published ON products(published);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_rating ON products(rating DESC);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_slug ON products(slug);

CREATE INDEX idx_loyalty_transactions_user_id ON loyalty_transactions(user_id);
CREATE INDEX idx_loyalty_transactions_created_at ON loyalty_transactions(created_at DESC);
CREATE INDEX idx_loyalty_transactions_type ON loyalty_transactions(type);

CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_community_posts_status ON community_posts(status);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX idx_community_posts_likes_count ON community_posts(likes_count DESC);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON orders(order_number);

CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_featured ON articles(featured);
CREATE INDEX idx_articles_trending ON articles(trending);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_slug ON articles(slug);

-- RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions" ON loyalty_transactions FOR SELECT USING (auth.uid() = user_id);

-- Community posts policies
CREATE POLICY "Anyone can view approved posts" ON community_posts FOR SELECT USING (status = 'approved');
CREATE POLICY "Users can create posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON community_posts FOR UPDATE USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Cart policies
CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL USING (auth.uid() = user_id);

-- Wishlist policies
CREATE POLICY "Users can manage own wishlist" ON wishlists FOR ALL USING (auth.uid() = user_id);

-- Public read access for products, articles, etc.
CREATE POLICY "Anyone can view published products" ON products FOR SELECT USING (published = true);
CREATE POLICY "Anyone can view published articles" ON articles FOR SELECT USING (status = 'approved' AND published_at IS NOT NULL);