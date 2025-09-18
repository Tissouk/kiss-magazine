import Link from 'next/link'
import { FeaturedProducts } from '@/components/homepage/featured-products'
import { KoreanBrandsShowcase } from '@/components/homepage/korean-brands-showcase'
import { CommunityHighlights } from '@/components/homepage/community-highlights'
import { LoyaltyProgram } from '@/components/homepage/loyalty-program'

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to Korean Culture Hub 🇰🇷
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-pink-100">
              Discover authentic K-fashion, K-beauty, and connect with Korean culture enthusiasts worldwide
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href="/shop" 
                className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                🛍️ Shop Korean Brands
              </Link>
              <Link 
                href="/community" 
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-purple-600 transition-colors"
              >
                👥 Join Community
              </Link>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                <div className="text-3xl mb-3">🇰🇷</div>
                <h3 className="text-xl font-bold mb-2">Authentic Korean Products</h3>
                <p className="text-pink-100">Direct from Seoul with verified Korean brands</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                <div className="text-3xl mb-3">🌍</div>
                <h3 className="text-xl font-bold mb-2">Global Community</h3>
                <p className="text-pink-100">Connect with Korean culture lovers worldwide</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                <div className="text-3xl mb-3">🏆</div>
                <h3 className="text-xl font-bold mb-2">Win Seoul Trip</h3>
                <p className="text-pink-100">Monthly raffle for verified members</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FeaturedProducts />
      </section>

      {/* Korean Brands Showcase */}
      <section className="bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <KoreanBrandsShowcase />
        </div>
      </section>

      {/* Community Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CommunityHighlights />
      </section>

      {/* Loyalty Program */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <LoyaltyProgram />
        </div>
      </section>

      {/* Korean Culture Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Join the Korean Culture Movement
          </h2>
          <p className="text-xl text-gray-600">
            Thousands of culture enthusiasts are already part of our community
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">10K+</div>
            <div className="text-gray-600">Community Members</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-pink-600 mb-2">500+</div>
            <div className="text-gray-600">Korean Products</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
            <div className="text-gray-600">Verified Korean Brands</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-pink-600 mb-2">100+</div>
            <div className="text-gray-600">Countries Shipping</div>
          </div>
        </div>
      </section>
    </div>
  )
}