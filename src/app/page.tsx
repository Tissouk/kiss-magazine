import { MagazineHero } from '@/components/homepage/MagazineHero';
import { ThemeSections } from '@/components/homepage/ThemeSections';
import { InfluencerSpotlight } from '@/components/homepage/InfluencerSpotlight';
import { YouTubeFeed } from '@/components/homepage/YouTubeFeed';
import { ProductCarousel } from '@/components/products/ProductCarousel';
import { ShopByLook } from '@/components/homepage/ShopByLook';
import { SeoulStreetStyle } from '@/components/homepage/SeoulStreetStyle';
import { BestSellers } from '@/components/products/BestSellers';
import { KBeautyMustHaves } from '@/components/products/KBeautyMustHaves';
import { InstagramFeed } from '@/components/homepage/InstagramFeed';
import { CommunityHighlights } from '@/components/community/CommunityHighlights';
import { LoyaltyBanner } from '@/components/homepage/LoyaltyBanner';
import { getLatestArticles, getTrendingProducts, getCommunityPosts } from '@/lib/api';

export default async function HomePage() {
  // Fetch initial data
  const [articles, trendingProducts, communityPosts] = await Promise.all([
    getLatestArticles(),
    getTrendingProducts(),
    getCommunityPosts({ limit: 6 })
  ]);

  return (
    <div className="min-h-screen">
      {/* Magazine Hero Section */}
      <MagazineHero articles={articles.slice(0, 4)} />
      
      {/* Theme Sections */}
      <ThemeSections articles={articles} />
      
      {/* Influencer Spotlight */}
      <InfluencerSpotlight />
      
      {/* YouTube Feed */}
      <YouTubeFeed />
      
      {/* New Arrivals - Korea Trending */}
      <ProductCarousel 
        title="New Arrivals — Korea Trending"
        subtitle="Fresh from Seoul streets"
        products={trendingProducts}
        theme="trending"
      />
      
      {/* Shop by Look */}
      <ShopByLook />
      
      {/* Seoul Street Style */}
      <SeoulStreetStyle />
      
      {/* Best Sellers */}
      <BestSellers />
      
      {/* K-Beauty Must-Haves */}
      <KBeautyMustHaves />
      
      {/* Instagram Feed */}
      <InstagramFeed />
      
      {/* Community Highlights */}
      <CommunityHighlights posts={communityPosts} />
      
      {/* Loyalty Banner */}
      <LoyaltyBanner />
    </div>
  );
}