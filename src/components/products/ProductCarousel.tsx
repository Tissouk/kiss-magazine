'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  HeartIcon as HeartOutline,
  ShoppingBagIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { Product } from '@/types';

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: Product[];
  theme?: 'trending' | 'new' | 'bestseller';
}

export function ProductCarousel({ title, subtitle, products, theme = 'new' }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const itemsToShow = 4;
  const maxIndex = Math.max(0, products.length - itemsToShow);

  const scroll = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setCurrentIndex(Math.max(0, currentIndex - 1));
    } else {
      setCurrentIndex(Math.min(maxIndex, currentIndex + 1));
    }
  };

  const toggleWishlist = (productId: string) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
    } else {
      newWishlist.add(productId);
    }
    setWishlist(newWishlist);
  };

  const addToCart = (product: Product) => {
    // Add to cart logic
    console.log('Adding to cart:', product);
  };

  const formatPrice = (price: number, currency: string) => {
    const symbols = { USD: '$', EUR: '€', CNY: '¥', JPY: '¥' };
    return `${symbols[currency as keyof typeof symbols] || '$'}${price}`;
  };

  const getThemeGradient = () => {
    const gradients = {
      trending: 'from-pink-500 to-purple-600',
      new: 'from-blue-500 to-teal-600',
      bestseller: 'from-orange-500 to-red-600'
    };
    return gradients[theme];
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-gray-600">
                {subtitle}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => scroll('left')}
              disabled={currentIndex === 0}
              className="p-2 rounded-full border border-gray-300 hover:border-korean-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={currentIndex >= maxIndex}
              className="p-2 rounded-full border border-gray-300 hover:border-korean-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Products Carousel */}
        <div className="relative overflow-hidden">
          <div 
            ref={scrollRef}
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)` }}
          >
            {products.map((product) => (
              <div 
                key={product.id} 
                className="w-1/4 flex-shrink-0 px-3"
              >
                <div className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 card-hover">
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden rounded-t-xl">
                    <Image
                      src={product.images[0]?.url}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 space-y-2">
                      {product.badges.map((badge) => (
                        <span 
                          key={badge.type}
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full text-white bg-gradient-to-r ${getThemeGradient()}`}
                        >
                          {badge.text}
                        </span>
                      ))}
                    </div>
                    
                    {/* Wishlist Button */}
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100"
                    >
                      {wishlist.has(product.id) ? (
                        <HeartSolid className="h-5 w-5 text-red-500" />
                      ) : (
                        <HeartOutline className="h-5 w-5 text-gray-600" />
                      )}
                    </button>
                    
                    {/* Quick Add Button */}
                    <button
                      onClick={() => addToCart(product)}
                      className="absolute bottom-3 left-3 right-3 bg-korean-500 text-white py-2 px-4 rounded-lg font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-korean-600"
                    >
                      Quick Add
                    </button>
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-4">
                    {/* Korean Brand Badge */}
                    {product.koreanBrand && (
                      <div className="mb-2">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-korean-50 text-korean-700 rounded-full">
                          🇰🇷 Korean Brand
                        </span>
                      </div>
                    )}
                    
                    {/* Product Name */}
                    <Link href={`/shop/${product.slug}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-korean-500 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    
                    {/* Rating */}
                    <div className="flex items-center space-x-2 mb-2">
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
                        ({product.reviewCount})
                      </span>
                    </div>
                    
                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(product.price, product.currency)}
                      </span>
                      
                      {/* Colors */}
                      <div className="flex items-center space-x-1">
                        {product.colors.slice(0, 3).map((color, index) => (
                          <div
                            key={index}
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: color.value }}
                          />
                        ))}
                        {product.colors.length > 3 && (
                          <span className="text-xs text-gray-500 ml-1">
                            +{product.colors.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Sizes */}
                    <div className="mt-2 text-xs text-gray-500">
                      Sizes: {product.sizes.slice(0, 4).join(', ')}
                      {product.sizes.length > 4 && '...'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex items-center justify-center space-x-2 mt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-korean-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-8">
          <Link 
            href="/shop"
            className="inline-flex items-center space-x-2 text-korean-500 font-medium hover:text-korean-600 transition-colors group"
          >
            <span>View All Products</span>
            <ShoppingBagIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}