'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CameraIcon,
  PhotoIcon,
  SparklesIcon,
  ArrowRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Product } from '@/types';

export function ShopByLook() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [matchingProducts, setMatchingProducts] = useState<Product[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock matching products for demo
  const mockMatchingProducts: Product[] = [
    {
      id: '1',
      name: 'Korean Oversized Blazer',
      slug: 'korean-oversized-blazer',
      description: 'Seoul street style blazer',
      price: 89.99,
      currency: 'USD',
      category: 'clothing',
      images: [
        { id: '1', url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400', alt: 'Blazer', isPrimary: true }
      ],
      sizes: ['S', 'M', 'L'],
      colors: [{ name: 'Black', value: '#000000', images: [''] }],
      koreanBrand: true,
      stockQuantity: 15,
      badges: [{ type: 'trending', text: 'Seoul Trending', color: 'bg-pink-500' }],
      rating: 4.8,
      reviewCount: 124,
      shipping: { freeShippingThreshold: 50, estimatedDays: 12, countries: ['US'] }
    },
    // Add more mock products...
  ];

  const handleImageUpload = async (file: File) => {
    setUploadedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setIsAnalyzing(true);

    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMatchingProducts(mockMatchingProducts);
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  const clearImage = () => {
    setUploadedImage(null);
    setImagePreview('');
    setMatchingProducts([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const trendingLooks = [
    {
      id: '1',
      title: 'Seoul Street Chic',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300',
      description: 'Oversized blazer + wide-leg pants',
      products: 4
    },
    {
      id: '2',
      title: 'K-Pop Inspired',
      image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300',
      description: 'Cropped top + high-waisted shorts',
      products: 6
    },
    {
      id: '3',
      title: 'Minimalist Korean',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300',
      description: 'Clean lines + neutral tones',
      products: 5
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Shop by Look
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload a style photo and our AI will find matching Korean fashion pieces. 
            Build your perfect K-style look instantly!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Image Upload Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                <SparklesIcon className="h-6 w-6 text-purple-500" />
                <span>AI Style Matcher</span>
              </h3>

              {!imagePreview ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-500 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                      <PhotoIcon className="h-8 w-8 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Drop your style photo here
                      </p>
                      <p className="text-gray-500 mb-4">
                        or click to browse your files
                      </p>
                      <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                        <span>JPG, PNG up to 10MB</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <Image
                      src={imagePreview}
                      alt="Uploaded style"
                      width={400}
                      height={400}
                      className="w-full h-64 object-cover rounded-xl"
                    />
                    <button
                      onClick={clearImage}
                      className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {isAnalyzing && (
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                        <span className="text-purple-700 font-medium">
                          Analyzing your style...
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Upload Button */}
              <div className="mt-6 flex space-x-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 bg-purple-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <CameraIcon className="h-5 w-5" />
                  <span>Upload Photo</span>
                </button>
              </div>
            </div>

            {/* Style Tips */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">📸 Pro Tips for Best Results</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Use clear, well-lit photos</li>
                <li>• Full outfit photos work best</li>
                <li>• Include accessories for complete looks</li>
                <li>• Korean street style photos get best matches</li>
              </ul>
            </div>
          </div>

          {/* Results/Trending Section */}
          <div className="space-y-6">
            {matchingProducts.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Matching Korean Products
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {matchingProducts.slice(0, 4).map((product) => (
                    <Link
                      key={product.id}
                      href={`/shop/${product.slug}`}
                      className="group"
                    >
                      <div className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="aspect-square relative">
                          <Image
                            src={product.images[0]?.url}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-3">
                          <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                            {product.name}
                          </h4>
                          <p className="text-purple-600 font-semibold text-sm">
                            ${product.price}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  href="/shop?style-match=true"
                  className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>View All Matches</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Trending Korean Looks
                </h3>
                <div className="space-y-4">
                  {trendingLooks.map((look) => (
                    <div
                      key={look.id}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                    >
                      <div className="w-16 h-16 relative rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={look.image}
                          alt={look.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {look.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-1">
                          {look.description}
                        </p>
                        <p className="text-xs text-purple-600">
                          {look.products} products
                        </p>
                      </div>
                      <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* How It Works */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">How it works</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <span className="text-sm text-gray-600">Upload your style inspiration photo</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <span className="text-sm text-gray-600">AI analyzes colors, patterns, and style</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <span className="text-sm text-gray-600">Get matching Korean fashion products</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}