'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  StarIcon,
  HeartIcon as HeartOutline,
  TrophyIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { Product } from '@/types';

interface BestSellersProps {
  products?: Product[];
}

export function BestSellers({ products = [] }: BestSellersProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  // Mock best sellers data
  const mockBestSellers: Product[] = [
    {
      id: '1',
      name: 'Korean Glass Skin Serum Set',
      slug: 'korean-glass-skin-serum-set',
      description: 'Complete 3-step glass skin routine',
      price: 79.99,
      currency: 'USD',
      category: 'beauty',
      images: [
        { id: '1', url: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400', alt: 'Serum set', isPrimary: true }
      ],
      sizes: ['30ml', '50ml'],
      colors: [{ name: 'Clear', value: '#ffffff', images: [''] }],
      koreanBrand: true,
      stockQuantity: 87,
      badges: [
        { type: 'bestseller', text: '#1 Best Seller', color: 'bg-yellow-500' },
        { type: 'korea-exclusive', text: 'Korea Exclusive', color: 'bg-red-500' }
      ],
      rating: 4.9,
      reviewCount: 1247,
      shipping: { freeShippingThreshold: 50, estimatedDays: 10, countries: ['US', 'CA', 'UK'] }
    },
    {
      id: '2',
      name: 'Oversized Korean Streetwear Hoodie',
      slug: 'oversized-korean-streetwear-hoodie',
      description: 'Seoul street style essential hoodie',
      price: 89.99,
      currency: 'USD',
      category: 'clothing',
      images: [
        { id: '2', url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', alt: 'Korean hoodie', isPrimary: true }
      ],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: [
        { name: 'Black', value: '#000000', images: [''] },
        { name: 'Cream', value: '#F5F5DC', images: [''] },
        { name: 'Pink', value: '#FFB6C1', images: [''] }
      ],
      koreanBrand: true,
      stockQuantity: 156,
      badges: [
        { type: 'bestseller', text: '#2 Best Seller', color: 'bg-yellow-500' }
      ],
      rating: 4.7,
      reviewCount: 892,
      shipping: { freeShippingThreshold: 50, estimatedDays: 12, countries: ['US', 'CA', 'UK'] }
    },
    // Add more mock products...
  ];

  const displayProducts = products.length > 0 ? products : mockBestSellers;

  const categories = [
    { id: 'all', name: 'All Categories', icon: '🏆' },
    { id: 'beauty', name: 'K-Beauty', icon: '💄' },
    { id: 'clothing', name: 'Fashion', icon: '👗' },
    { id: 'accessories', name: 'Accessories', icon: '👜' }
  ];

  const filteredProducts = activeCategory === 'all' 
    ? displayProducts 
    : displayProducts.filter(product => product.category === activeCategory);

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

  const getBestSellerRank = (index: number) => {
    const ranks = ['🥇', '🥈', '🥉'];
    return ranks[index] || `#${index + 1}`;
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <TrophyIcon className="h-8 w-8 text-yellow-500" />
            <h2 className="text-3xl font-bold text-gray-900">
              Best Sellers
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Top-rated Korean products loved by our international community. 
            These customer favorites ship worldwide with authentic Korean quality.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-100 rounded-xl p-2 inline-flex space-x-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  activeCategory === category.id
                    ? 'bg-korean-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Top 3 Best Sellers - Featured */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {filteredProducts.slice(0, 3).map((product, index) => (
            <div 
              key={product.id} 
              className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden ${
                index === 0 ? 'md:scale-105 md:-mt-4' : ''
              }`}
            >
              {/* Rank Badge */}
              <div className="absolute top-4 left-4 z-10">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${
                  index === 0 ? 'bg-yellow-500 text-white' :
                  index === 1 ? 'bg-gray-400 text-white' :
                  'bg-orange-500 text-white'
                }`}>
                  {getBestSellerRank(index)}
                </div>
              </div>

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
                <div className="absolute top-4 right-4 space-y-2">
                  {product.koreanBrand && (
                    <span className="bg-korean-500 text-white px-2 py-1 rounded-full text-xs font-medium block">
                      🇰🇷 Korean
                    </span>
                  )}
                  {product.badges.map((badge) => (
                    <span 
                      key={badge.type}
                      className={`block px-2 py-1 text-xs font-medium rounded-full text-white ${badge.color}`}
                    >
                      {badge.text}
                    </span>
                  ))}
                </div>
                
                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute bottom-4 right-4 p-3 bg-white/90 rounded-full shadow-md hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100"
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
                                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 hover:text-korean-500 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                
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
                
                {/* Price & Stock */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatPrice(product.price, product.currency)}
                  </span>
                  <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    {product.stockQuantity} in stock
                  </span>
                </div>
                
                {/* Colors Preview */}
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-sm text-gray-600">Colors:</span>
                  {product.colors.slice(0, 4).map((color, colorIndex) => (
                    <div
                      key={colorIndex}
                      className="w-6 h-6 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                  {product.colors.length > 4 && (
                    <span className="text-xs text-gray-500">
                      +{product.colors.length - 4} more
                    </span>
                  )}
                </div>
                
                {/* Add to Cart Button */}
                <Link 
                  href={`/shop/${product.slug}`}
                  className="w-full bg-korean-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-korean-600 transition-colors text-center block"
                >
                  View Product
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Best Sellers Grid */}
        {filteredProducts.length > 3 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12">
              {filteredProducts.slice(3, 9).map((product, index) => (
                <div key={product.id} className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
                  {/* Rank */}
                  <div className="absolute top-2 left-2 z-10 bg-gray-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    #{index + 4}
                  </div>
                  
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <Link href={`/shop/${product.slug}`}>
                      <Image
                        src={product.images[0]?.url}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </Link>
                    
                    {product.koreanBrand && (
                      <span className="absolute top-2 right-2 bg-korean-500 text-white px-1 py-0.5 rounded text-xs">
                        🇰🇷
                      </span>
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-3">
                    <Link href={`/shop/${product.slug}`}>
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2 hover:text-korean-500 transition-colors">
                        {product.name}
                      </h4>
                    </Link>
                    
                    <div className="flex items-center space-x-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(product.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-xs text-gray-500">
                        ({product.reviewCount})
                      </span>
                    </div>
                    
                    <p className="font-bold text-korean-500">
                      {formatPrice(product.price, product.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Link */}
            <div className="text-center">
              <Link 
                href="/shop/bestsellers"
                className="inline-flex items-center space-x-2 bg-korean-500 text-white px-8 py-4 rounded-lg font-medium hover:bg-korean-600 transition-colors group"
              >
                <TrophyIcon className="h-5 w-5" />
                <span>View All Best Sellers</span>
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}