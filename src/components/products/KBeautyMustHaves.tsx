'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  StarIcon,
  HeartIcon as HeartOutline,
  SparklesIcon,
  BeakerIcon,
  CheckBadgeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { Product } from '@/types';

interface KBeautyMustHavesProps {
  products?: Product[];
}

export function KBeautyMustHaves({ products = [] }: KBeautyMustHavesProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSkinType, setActiveSkinType] = useState('all');
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  // Mock K-Beauty products with Korean-specific properties
  const mockKBeautyProducts: Product[] = [
    {
      id: '1',
      name: 'Glow Recipe Watermelon Glow Niacinamide Dew Drops',
      slug: 'watermelon-glow-niacinamide-dew-drops',
      description: '10-step Korean glass skin routine essential serum',
      price: 34.99,
      currency: 'USD',
      category: 'skincare',
      subcategory: 'serum',
      images: [
        { id: '1', url: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400', alt: 'K-beauty serum', isPrimary: true }
      ],
      sizes: ['30ml', '50ml'],
      colors: [{ name: 'Clear', value: 'transparent', images: [''] }],
      koreanBrand: true,
      stockQuantity: 234,
      badges: [
        { type: 'bestseller', text: 'K-Beauty Bestseller', color: 'bg-pink-500' },
        { type: 'korea-exclusive', text: 'Glass Skin Essential', color: 'bg-purple-500' }
      ],
      rating: 4.8,
      reviewCount: 2341,
      shipping: { freeShippingThreshold: 50, estimatedDays: 10, countries: ['US', 'CA', 'UK'] }
    },
    {
      id: '2',
      name: 'COSRX Snail 96 Mucin Power Essence',
      slug: 'cosrx-snail-96-mucin-power-essence',
      description: 'Intensive hydrating essence for damaged skin repair',
      price: 25.99,
      currency: 'USD',
      category: 'skincare',
      subcategory: 'essence',
      images: [
        { id: '2', url: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400', alt: 'COSRX essence', isPrimary: true }
      ],
      sizes: ['100ml'],
      colors: [{ name: 'Clear', value: 'transparent', images: [''] }],
      koreanBrand: true,
      stockQuantity: 189,
      badges: [
        { type: 'bestseller', text: '#1 Essence', color: 'bg-green-500' }
      ],
      rating: 4.7,
      reviewCount: 1892,
      shipping: { freeShippingThreshold: 50, estimatedDays: 12, countries: ['US', 'CA', 'UK'] }
    },
    // Add more mock products...
  ];

  const displayProducts = products.length > 0 ? products : mockKBeautyProducts;

  const beautyCategories = [
    { id: 'all', name: 'All Products', icon: '✨', color: 'bg-purple-500' },
    { id: 'skincare', name: 'Skincare', icon: '🧴', color: 'bg-pink-500' },
    { id: 'makeup', name: 'Makeup', icon: '💄', color: 'bg-red-500' },
    { id: 'masks', name: 'Sheet Masks', icon: '🎭', color: 'bg-blue-500' },
    { id: 'tools', name: 'Beauty Tools', icon: '🔧', color: 'bg-green-500' }
  ];

  const skinTypes = [
    { id: 'all', name: 'All Skin Types' },
    { id: 'dry', name: 'Dry Skin' },
    { id: 'oily', name: 'Oily Skin' },
    { id: 'combination', name: 'Combination' },
    { id: 'sensitive', name: 'Sensitive' },
    { id: 'acne', name: 'Acne-Prone' }
  ];

  const kBeautySteps = [
    { step: 1, name: 'Oil Cleanser', icon: '🫧' },
    { step: 2, name: 'Water Cleanser', icon: '💧' },
    { step: 3, name: 'Exfoliant', icon: '✨' },
    { step: 4, name: 'Toner', icon: '🌸' },
    { step: 5, name: 'Essence', icon: '🧴' },
    { step: 6, name: 'Treatments', icon: '💊' },
    { step: 7, name: 'Sheet Mask', icon: '🎭' },
    { step: 8, name: 'Eye Cream', icon: '👁️' },
    { step: 9, name: 'Moisturizer', icon: '🧴' },
    { step: 10, name: 'Sunscreen', icon: '☀️' }
  ];

  const filteredProducts = displayProducts.filter(product => {
    if (activeCategory !== 'all' && product.subcategory !== activeCategory) return false;
    // Add skin type filtering logic here
    return true;
  });

  const toggleWishlist = (productId: string) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
    } else {
      newWishlist.add(productId);
    }
    setWishlist(newWishlist);
  };

  const formatPrice = (price: number, currency: string) => {
    const symbols = { USD: '$', EUR: '€', CNY: '¥', JPY: '¥' };
    return `${symbols[currency as keyof typeof symbols] || '$'}${price}`;
  };

  return (
    <section className="py-16 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <SparklesIcon className="h-8 w-8 text-pink-500" />
            <h2 className="text-3xl font-bold text-gray-900">
              K-Beauty Must-Haves
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Authentic Korean skincare and makeup essentials. Build your perfect K-beauty routine 
            with products trusted by Korean beauty experts and loved globally.
          </p>
        </div>

        {/* 10-Step Routine Guide */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            🇰🇷 The Famous Korean 10-Step Skincare Routine
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
            {kBeautySteps.map((step) => (
              <div key={step.step} className="text-center group cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center mb-2 mx-auto text-2xl group-hover:scale-105 transition-transform">
                  {step.icon}
                </div>
                <div className="text-xs font-medium text-gray-600 mb-1">
                  Step {step.step}
                </div>
                <div className="text-xs text-gray-500">
                  {step.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category & Skin Type Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-12">
          {/* Category Filter */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Shop by Category</h3>
            <div className="flex flex-wrap gap-3">
              {beautyCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                    activeCategory === category.id
                      ? `${category.color} text-white shadow-md`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Skin Type Filter */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Skin Type</h3>
            <div className="flex flex-wrap gap-3">
              {skinTypes.map((skinType) => (
                <button
                  key={skinType.id}
                  onClick={() => setActiveSkinType(skinType.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeSkinType === skinType.id
                      ? 'bg-pink-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {skinType.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured K-Beauty Products */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredProducts.slice(0, 6).map((product) => (
            <div 
              key={product.id} 
              className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden">
                <Link href={`/shop/${product.slug}`}>
                  <Image
                    src={product.images[0]?.url}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
                
                {/* Badges */}
                <div className="absolute top-4 left-4 space-y-2">
                  <span className="bg-korean-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                    <span>🇰🇷</span>
                    <span>K-Beauty</span>
                  </span>
                  {product.badges.map((badge) => (
                    <span 
                      key={badge.type}
                      className={`block px-3 py-1 text-xs font-medium rounded-full text-white ${badge.color}`}
                    >
                      {badge.text}
                    </span>
                  ))}
                </div>
                
                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-4 right-4 p-3 bg-white/90 rounded-full shadow-md hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  {wishlist.has(product.id) ? (
                    <HeartSolid className="h-5 w-5 text-red-500" />
                  ) : (
                    <HeartOutline className="h-5 w-5 text-gray-600" />
                  )}
                </button>
              </div>
              
              {/* Product Info */}
              <div className="p-6">
                <Link href={`/shop/${product.slug}`}>
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 hover:text-pink-500 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                
                {/* Rating */}
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {product.rating} ({product.reviewCount.toLocaleString()})
                  </span>
                </div>
                
                {/* Price & Size Options */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-bold text-gray-900">
                    {formatPrice(product.price, product.currency)}
                  </span>
                  <div className="text-sm text-gray-500">
                    {product.sizes.join(' / ')}
                  </div>
                </div>
                
                {/* Skin Benefits */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {['Hydrating', 'Anti-aging', 'Brightening'].map((benefit, index) => (
                    <span 
                      key={index}
                      className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
                
                {/* Add to Cart Button */}
                <Link 
                  href={`/shop/${product.slug}`}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-6 rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 transition-all duration-200 text-center block"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* K-Beauty Education Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Glass Skin Guide */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Achieve Glass Skin
                </h3>
                <p className="text-gray-600">Korean beauty secret</p>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3">
                <CheckBadgeIcon className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">Double cleansing method</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckBadgeIcon className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">Essence for deep hydration</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckBadgeIcon className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">Weekly sheet mask ritual</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckBadgeIcon className="h-5 w-5 text-green-500" />
                <span className="text-gray-700">SPF protection daily</span>
              </div>
            </div>
            
            <Link 
              href="/beauty-guide/glass-skin"
              className="inline-flex items-center space-x-2 text-pink-500 font-medium hover:text-pink-600 transition-colors"
            >
              <span>Learn the full routine</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          {/* Ingredient Focus */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <BeakerIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  K-Beauty Ingredients
                </h3>
                <p className="text-gray-600">Science-backed formulas</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { name: 'Snail Secretion', benefit: 'Healing & Repair' },
                { name: 'Ginseng', benefit: 'Anti-aging' },
                { name: 'Centella Asiatica', benefit: 'Soothing' },
                { name: 'Hyaluronic Acid', benefit: 'Hydration' }
              ].map((ingredient, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">
                    {ingredient.name}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {ingredient.benefit}
                  </p>
                </div>
              ))}
            </div>
            
            <Link 
              href="/beauty-guide/ingredients"
              className="inline-flex items-center space-x-2 text-green-500 font-medium hover:text-green-600 transition-colors"
            >
              <span>Explore ingredients</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Start Your K-Beauty Journey Today
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Get personalized product recommendations based on your skin type and goals
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/beauty-quiz"
                className="bg-white text-purple-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Take Skin Quiz
              </Link>
              <Link 
                href="/shop/k-beauty"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-purple-600 transition-colors"
              >
                Shop All K-Beauty
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}