'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  HeartIcon as HeartOutline,
  StarIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { Product } from '@/types';

interface ProductGridProps {
  products: Product[];
  title?: string;
  showFilters?: boolean;
  itemsPerPage?: number;
}

interface FilterState {
  category: string[];
  priceRange: [number, number];
  sizes: string[];
  colors: string[];
  koreanBrand: boolean | null;
  rating: number;
  sortBy: string;
}

const initialFilters: FilterState = {
  category: [],
  priceRange: [0, 500],
  sizes: [],
  colors: [],
  koreanBrand: null,
  rating: 0,
  sortBy: 'newest'
};

export function ProductGrid({ products, title, showFilters = true, itemsPerPage = 12 }: ProductGridProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    // Search query
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Category filter
    if (filters.category.length > 0 && !filters.category.includes(product.category)) {
      return false;
    }

    // Price range
    if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
      return false;
    }

    // Sizes
    if (filters.sizes.length > 0 && !filters.sizes.some(size => product.sizes.includes(size))) {
      return false;
    }

    // Colors
    if (filters.colors.length > 0 && !filters.colors.some(color => 
      product.colors.some(c => c.name.toLowerCase() === color.toLowerCase())
    )) {
      return false;
    }

    // Korean brand
    if (filters.koreanBrand !== null && product.koreanBrand !== filters.koreanBrand) {
      return false;
    }

    // Rating
    if (product.rating < filters.rating) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'popular':
        return b.reviewCount - a.reviewCount;
      default: // newest
        return 0;
    }
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

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

  const clearFilters = () => {
    setFilters(initialFilters);
    setCurrentPage(1);
  };

  const activeFilterCount = () => {
    let count = 0;
    if (filters.category.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 500) count++;
    if (filters.sizes.length > 0) count++;
    if (filters.colors.length > 0) count++;
    if (filters.koreanBrand !== null) count++;
    if (filters.rating > 0) count++;
    return count;
  };

  const FilterSection = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Search Products
        </label>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Korean fashion, K-beauty..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-korean-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Category</h3>
        <div className="space-y-2">
          {['clothing', 'beauty', 'accessories', 'shoes', 'bags'].map((category) => (
            <label key={category} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.category.includes(category)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFilters(prev => ({ ...prev, category: [...prev.category, category] }));
                  } else {
                    setFilters(prev => ({ ...prev, category: prev.category.filter(c => c !== category) }));
                  }
                }}
                className="rounded border-gray-300 text-korean-500 focus:ring-korean-500"
              />
              <span className="ml-2 text-sm text-gray-700 capitalize">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Korean Brand */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Origin</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="koreanBrand"
              checked={filters.koreanBrand === true}
              onChange={() => setFilters(prev => ({ ...prev, koreanBrand: true }))}
              className="border-gray-300 text-korean-500 focus:ring-korean-500"
            />
            <span className="ml-2 text-sm text-gray-700">🇰🇷 Korean Brands</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="koreanBrand"
              checked={filters.koreanBrand === false}
              onChange={() => setFilters(prev => ({ ...prev, koreanBrand: false }))}
              className="border-gray-300 text-korean-500 focus:ring-korean-500"
            />
            <span className="ml-2 text-sm text-gray-700">🌍 International Brands</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="koreanBrand"
              checked={filters.koreanBrand === null}
              onChange={() => setFilters(prev => ({ ...prev, koreanBrand: null }))}
              className="border-gray-300 text-korean-500 focus:ring-korean-500"
            />
            <span className="ml-2 text-sm text-gray-700">All Brands</span>
          </label>
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Price Range</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <input
              type="number"
              value={filters.priceRange[0]}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                priceRange: [Number(e.target.value), prev.priceRange[1]] 
              }))}
              placeholder="Min"
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
            />
            <span className="text-gray-500">-</span>
            <input
              type="number"
              value={filters.priceRange[1]}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                priceRange: [prev.priceRange[0], Number(e.target.value)] 
              }))}
              placeholder="Max"
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <input
            type="range"
            min="0"
            max="500"
            step="10"
            value={filters.priceRange[1]}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              priceRange: [prev.priceRange[0], Number(e.target.value)] 
            }))}
            className="w-full accent-korean-500"
          />
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Sizes</h3>
        <div className="grid grid-cols-3 gap-2">
          {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
            <button
              key={size}
              onClick={() => {
                if (filters.sizes.includes(size)) {
                  setFilters(prev => ({ ...prev, sizes: prev.sizes.filter(s => s !== size) }));
                } else {
                  setFilters(prev => ({ ...prev, sizes: [...prev.sizes, size] }));
                }
              }}
              className={`py-2 px-3 text-sm border rounded-lg transition-colors ${
                filters.sizes.includes(size)
                  ? 'bg-korean-500 text-white border-korean-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-korean-500'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Minimum Rating</h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => setFilters(prev => ({ ...prev, rating }))}
              className={`flex items-center space-x-2 w-full text-left p-2 rounded ${
                filters.rating === rating ? 'bg-korean-50 text-korean-700' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-4 w-4 ${
                      i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm">& up</span>
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {activeFilterCount() > 0 && (
        <button
          onClick={clearFilters}
          className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Clear All Filters ({activeFilterCount()})
        </button>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {title && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600">
            Discover authentic Korean fashion and beauty products curated for international K-culture fans
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        {showFilters && (
          <>
            {/* Desktop Filters */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                  {activeFilterCount() > 0 && (
                    <span className="bg-korean-500 text-white text-xs px-2 py-1 rounded-full">
                      {activeFilterCount()}
                    </span>
                  )}
                </div>
                <FilterSection />
              </div>
            </div>

            {/* Mobile Filters */}
            {showMobileFilters && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)} />
                <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                      <button
                        onClick={() => setShowMobileFilters(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                    <FilterSection />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Products Section */}
        <div className={showFilters ? 'lg:col-span-3' : 'col-span-1'}>
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {showFilters && (
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:border-korean-500 transition-colors"
                >
                  <AdjustmentsHorizontalIcon className="h-5 w-5" />
                  <span>Filters</span>
                  {activeFilterCount() > 0 && (
                    <span className="bg-korean-500 text-white text-xs px-2 py-1 rounded-full">
                      {activeFilterCount()}
                    </span>
                  )}
                </button>
              )}
              <span className="text-gray-600">
                {filteredProducts.length} products
              </span>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="appearance-none bg-white border border-gray-300 px-4 py-2 pr-8 rounded-lg focus:ring-2 focus:ring-korean-500 focus:border-transparent"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
              </select>
              <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Products Grid */}
          {displayedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {displayedProducts.map((product) => (
                <div key={product.id} className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden card-hover">
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
                    <div className="absolute top-3 left-3 space-y-2">
                      {product.koreanBrand && (
                        <span className="bg-korean-500 text-white px-2 py-1 rounded-full text-xs font-medium">
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
                      className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100"
                    >
                      {wishlist.has(product.id) ? (
                        <HeartSolid className="h-5 w-5 text-red-500" />
                      ) : (
                        <HeartOutline className="h-5 w-5 text-gray-600" />
                      )}
                    </button>
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-4">
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
                    
                    {/* Price & Colors */}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(product.price, product.currency)}
                      </span>
                      
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
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MagnifyingGlassIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters or search terms</p>
              <button
                onClick={clearFilters}
                className="bg-korean-500 text-white px-6 py-2 rounded-lg hover:bg-korean-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:border-korean-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === i + 1
                      ? 'bg-korean-500 text-white'
                      : 'border border-gray-300 hover:border-korean-500'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:border-korean-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}