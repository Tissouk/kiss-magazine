'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  StarIcon,
  TrophyIcon,
  GiftIcon,
  CalendarIcon,
  MapPinIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { User, LoyaltyTransaction, CommunityPost } from '@/types';

interface UserProfileProps {
  user: User;
  posts: CommunityPost[];
  transactions: LoyaltyTransaction[];
}

export function UserProfile({ user, posts, transactions }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'activity' | 'badges'>('posts');

  const getLevelProgress = () => {
    const levelThresholds = {
      Bronze: 0,
      Silver: 500,
      Gold: 2000,
      Platinum: 5000,
      Diamond: 10000
    };
    
    const currentThreshold = levelThresholds[user.level as keyof typeof levelThresholds];
    const nextLevelKey = Object.keys(levelThresholds)[Object.keys(levelThresholds).indexOf(user.level) + 1];
    const nextThreshold = nextLevelKey ? levelThresholds[nextLevelKey as keyof typeof levelThresholds] : currentThreshold;
    
    const progress = nextLevelKey ? ((user.points - currentThreshold) / (nextThreshold - currentThreshold)) * 100 : 100;
    
    return {
      current: currentThreshold,
      next: nextThreshold,
      nextLevel: nextLevelKey,
      progress: Math.min(progress, 100)
    };
  };

  const levelProgress = getLevelProgress();

  const stats = {
    totalPosts: posts.length,
    totalLikes: posts.reduce((sum, post) => sum + post.likes, 0),
    totalComments: posts.reduce((sum, post) => sum + post.comments.length, 0),
    monthlyPoints: transactions
      .filter(t => t.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .reduce((sum, t) => sum + (t.type === 'earn' ? t.points : 0), 0)
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long'
    }).format(new Date(date));
  };

  const getLevelColor = (level: string) => {
    const colors = {
      Bronze: 'from-orange-400 to-orange-600',
      Silver: 'from-gray-400 to-gray-600',
      Gold: 'from-yellow-400 to-yellow-600',
      Platinum: 'from-purple-400 to-purple-600',
      Diamond: 'from-blue-400 to-blue-600'
    };
    return colors[level as keyof typeof colors] || 'from-gray-400 to-gray-600';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
          {/* Avatar & Basic Info */}
          <div className="flex-shrink-0 text-center md:text-left">
            <div className="relative inline-block">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.username || 'User'}
                  width={120}
                  height={120}
                  className="rounded-full"
                />
              ) : (
                <div className="w-30 h-30 rounded-full bg-gradient-to-r from-korean-400 to-kpop-pink flex items-center justify-center text-white text-3xl font-bold">
                  {user.username?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              
              {/* Level Badge */}
              <div className={`absolute -bottom-2 -right-2 bg-gradient-to-r ${getLevelColor(user.level)} text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1`}>
                <StarSolid className="h-4 w-4" />
                <span>{user.level}</span>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
              @{user.username}
            </h1>
            <p className="text-gray-600 flex items-center justify-center md:justify-start space-x-1">
              <CalendarIcon className="h-4 w-4" />
              <span>Joined {formatDate(user.createdAt)}</span>
            </p>
          </div>

          {/* Stats & Progress */}
          <div className="flex-1">
            {/* Points & Level Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-gray-900">
                  {user.points.toLocaleString()} Points
                </span>
                {levelProgress.nextLevel && (
                  <span className="text-sm text-gray-500">
                    {(levelProgress.next - user.points).toLocaleString()} to {levelProgress.nextLevel}
                  </span>
                )}
              </div>
              
              {levelProgress.nextLevel && (
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`bg-gradient-to-r ${getLevelColor(user.level)} h-3 rounded-full transition-all duration-300`}
                    style={{ width: `${levelProgress.progress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Activity Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-korean-500 mb-1">
                  {stats.totalPosts}
                </div>
                <div className="text-sm text-gray-600">Posts</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-red-500 mb-1">
                  {stats.totalLikes}
                </div>
                <div className="text-sm text-gray-600">Likes</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-500 mb-1">
                  {stats.totalComments}
                </div>
                <div className="text-sm text-gray-600">Comments</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-500 mb-1">
                  +{stats.monthlyPoints}
                </div>
                <div className="text-sm text-gray-600">This Month</div>
              </div>
            </div>
          </div>
        </div>

        {/* Badges */}
        {user.badges.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <TrophyIcon className="h-5 w-5 text-yellow-500" />
              <span>Badges</span>
            </h3>
            <div className="flex flex-wrap gap-3">
              {user.badges.map((badge) => (
                <div 
                  key={badge.id}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2"
                  title={badge.description}
                >
                  <span>{badge.icon}</span>
                  <span>{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content Tabs */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-8">
            {[
              { key: 'posts', label: 'Posts', count: stats.totalPosts },
              { key: 'activity', label: 'Points Activity', count: transactions.length },
              { key: 'badges', label: 'Achievements', count: user.badges.length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-korean-500 text-korean-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'posts' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((post) => (
                <article key={post.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  {post.images.length > 0 && (
                    <div className="aspect-video relative">
                      <Image
                        src={post.images[0]}
                        alt="Post image"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-gray-900 mb-3 line-clamp-3">{post.content}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <HeartIcon className="h-4 w-4" />
                          <span>{post.likes}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <ChatBubbleLeftIcon className="h-4 w-4" />
                          <span>{post.comments.length}</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <GiftIcon className="h-4 w-4 text-korean-500" />
                        <span className="text-korean-600 font-medium">+{post.pointsEarned}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              {transactions.slice(0, 20).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.type === 'earn' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'earn' ? '+' : '-'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{transaction.description}</div>
                      <div className="text-sm text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className={`font-semibold ${
                    transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'earn' ? '+' : '-'}{transaction.points} pts
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.badges.map((badge) => (
                <div key={badge.id} className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 text-center">
                  <div className="text-4xl mb-3">{badge.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{badge.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                  <div className="text-xs text-gray-500">
                    Earned {formatDate(badge.earnedAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}