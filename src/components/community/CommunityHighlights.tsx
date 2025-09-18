'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  HeartIcon as HeartOutline,
  ChatBubbleLeftIcon,
  StarIcon,
  CheckBadgeIcon,
  MapPinIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { CommunityPost } from '@/types';

interface CommunityHighlightsProps {
  posts: CommunityPost[];
}

export function CommunityHighlights({ posts }: CommunityHighlightsProps) {
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const toggleLike = (postId: string) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(postId)) {
      newLiked.delete(postId);
    } else {
      newLiked.add(postId);
    }
    setLikedPosts(newLiked);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getUserLevelColor = (level: string) => {
    const colors = {
      'Bronze': 'text-orange-600',
      'Silver': 'text-gray-500',
      'Gold': 'text-yellow-500',
      'Platinum': 'text-purple-500',
      'Diamond': 'text-blue-500'
    };
    return colors[level as keyof typeof colors] || 'text-gray-500';
  };

  return (
    <section className="py-16 bg-gradient-to-br from-korean-50 to-kpop-pink/10">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Community Highlights
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See what our K-culture community is sharing! From Seoul street style to K-beauty routines, 
            discover authentic content from fellow Korean culture enthusiasts worldwide.
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {posts.map((post) => (
            <article 
              key={post.id} 
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group card-hover"
            >
              {/* Post Images */}
              {post.images.length > 0 && (
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={post.images[0]}
                    alt="Community post"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Image Count Badge */}
                  {post.images.length > 1 && (
                    <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                      +{post.images.length - 1}
                    </div>
                  )}
                  
                  {/* Verified Badge */}
                  {post.verified && (
                    <div className="absolute top-3 left-3 bg-korean-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                      <CheckBadgeIcon className="h-3 w-3" />
                      <span>Korea Trip</span>
                    </div>
                  )}
                </div>
              )}

              {/* Post Content */}
              <div className="p-6">
                {/* User Info */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-korean-400 to-kpop-pink flex items-center justify-center text-white font-semibold">
                        {post.user.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      {/* Level indicator */}
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center border-2 ${getUserLevelColor(post.user.level)}`}>
                        <StarIcon className="h-2 w-2 fill-current" />
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        @{post.user.username}
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span className={getUserLevelColor(post.user.level)}>
                          {post.user.level}
                        </span>
                        <span>•</span>
                        <span>{post.user.points.toLocaleString()} pts</span>
                        <span>•</span>
                        <span>{formatTimeAgo(post.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Points Earned Badge */}
                  {post.pointsEarned > 0 && (
                    <div className="bg-korean-100 text-korean-700 px-2 py-1 rounded-full text-xs font-medium">
                      +{post.pointsEarned} pts
                    </div>
                  )}
                </div>

                {/* Post Content */}
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {post.content}
                </p>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 3).map((tag, index) => (
                      <span 
                        key={index}
                        className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Interaction Bar */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      {likedPosts.has(post.id) ? (
                        <HeartSolid className="h-5 w-5 text-red-500" />
                      ) : (
                        <HeartOutline className="h-5 w-5" />
                      )}
                      <span className="text-sm">{post.likes}</span>
                    </button>
                    
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-korean-500 transition-colors">
                      <ChatBubbleLeftIcon className="h-5 w-5" />
                      <span className="text-sm">{post.comments.length}</span>
                    </button>
                  </div>
                  
                  <Link 
                    href={`/community/post/${post.id}`}
                    className="text-korean-500 hover:text-korean-600 text-sm font-medium transition-colors"
                  >
                    View Post
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-to-r from-korean-500 to-kpop-pink rounded-full flex items-center justify-center mx-auto mb-4">
              <StarIcon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Join Our K-Culture Community
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Share your Korean style, earn points, and connect with K-culture fans worldwide
            </p>
            <Link 
              href="/community/join"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <span>Join Community</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}