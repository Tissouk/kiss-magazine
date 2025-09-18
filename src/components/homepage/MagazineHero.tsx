'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ClockIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Article } from '@/types';

interface MagazineHeroProps {
  articles: Article[];
}

export function MagazineHero({ articles }: MagazineHeroProps) {
  const [featuredArticle] = articles;
  const trendingArticles = articles.slice(1, 4);

  const getCategoryColor = (category: string) => {
    const colors = {
      'K-POP': 'bg-kpop-pink',
      'K-DRAMA': 'bg-kpop-blue', 
      'K-FASHION': 'bg-kpop-purple',
      'K-BEAUTY': 'bg-kpop-mint',
      'K-PLACES': 'bg-korean-500',
      'K-NEWS': 'bg-gray-600'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  const formatReadTime = (minutes: number) => {
    return `${minutes} min read`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <section className="container mx-auto px-4 py-8 lg:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Featured Article - Left 2/3 */}
        <div className="lg:col-span-2">
          <article className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 card-hover">
            <div className="aspect-[16/9] relative overflow-hidden">
              <Image
                src={featuredArticle.featuredImage}
                alt={featuredArticle.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Category badge */}
              <div className="absolute top-4 left-4">
                <span className={`category-badge ${getCategoryColor(featuredArticle.category)} text-white`}>
                  {featuredArticle.category}
                </span>
              </div>
              
              {/* Featured badge */}
              {featuredArticle.featured && (
                <div className="absolute top-4 right-4">
                  <span className="bg-korean-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    ✨ Featured
                  </span>
                </div>
              )}
            </div>
            
            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="mb-3 flex items-center space-x-4 text-sm opacity-90">
                <div className="flex items-center space-x-1">
                  <ClockIcon className="h-4 w-4" />
                  <span>{formatReadTime(featuredArticle.readTime)}</span>
                </div>
                <span>•</span>
                <span>{formatDate(featuredArticle.publishedAt)}</span>
              </div>
              
              <h1 className="text-2xl lg:text-4xl font-bold mb-3 leading-tight">
                {featuredArticle.title}
              </h1>
              
              <p className="text-lg opacity-90 mb-4 line-clamp-2">
                {featuredArticle.excerpt}
              </p>
              
              <Link 
                href={`/${featuredArticle.category.toLowerCase()}/${featuredArticle.slug}`}
                className="inline-flex items-center space-x-2 bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors group"
              >
                <span>Read More</span>
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </article>
        </div>
        
        {/* Trending Headlines - Right 1/3 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Trending Now
            </h2>
            <div className="w-12 h-0.5 bg-korean-500"></div>
          </div>
          
          <div className="space-y-4">
            {trendingArticles.map((article, index) => (
              <article key={article.id} className="group">
                <Link 
                  href={`/${article.category.toLowerCase()}/${article.slug}`}
                  className="block"
                >
                  <div className="flex space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                        <Image
                          src={article.featuredImage}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-block w-2 h-2 rounded-full ${getCategoryColor(article.category)}`}></span>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          {article.category}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400">
                          {formatDate(article.publishedAt)}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-korean-500 transition-colors">
                        {article.title}
                      </h3>
                      
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        <span>{formatReadTime(article.readTime)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
          
          <Link 
            href="/trending"
            className="block text-center py-3 text-korean-500 font-medium hover:text-korean-600 transition-colors border-t border-gray-100"
          >
            View All Trending →
          </Link>
        </div>
      </div>
    </section>
  );
}