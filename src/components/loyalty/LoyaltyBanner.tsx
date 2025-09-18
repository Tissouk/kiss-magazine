'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  GiftIcon,
  TrophyIcon,
  StarIcon,
  MapPinIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export function LoyaltyBanner() {
  const [timeLeft, setTimeLeft] = useState({
    days: 15,
    hours: 8,
    minutes: 42
  });

  // Mock user data - replace with real auth
  const [userPoints] = useState(3450);
  const [userLevel] = useState('Gold');
  const [raffleTickets] = useState(34);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59 };
        }
        return prev;
      });
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const rewards = [
    {
      points: 500,
      reward: '$5 Discount',
      icon: GiftIcon,
      available: userPoints >= 500
    },
    {
      points: 2000,
      reward: 'Korean Snack Box',
      icon: GiftIcon,
      available: userPoints >= 2000
    },
    {
      points: 5000,
      reward: 'K-Beauty Kit',
      icon: SparklesIcon,
      available: userPoints >= 5000
    },
    {
      points: 50000,
      reward: 'Seoul Trip',
      icon: MapPinIcon,
      available: userPoints >= 50000
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-korean-500 via-kpop-pink to-kpop-purple relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Main Content */}
          <div className="lg:col-span-2 text-white">
            <div className="flex items-center space-x-2 mb-4">
              <TrophyIcon className="h-8 w-8 text-yellow-300" />
              <span className="text-yellow-300 font-semibold text-sm uppercase tracking-wide">
                Loyalty Program
              </span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              Earn Points,
              <br />
              <span className="text-yellow-300">Win Korea Trip!</span>
            </h2>
            
            <p className="text-xl text-white/90 mb-8 max-w-lg">
              Shop Korean products, share your style, and earn points for amazing rewards. 
              Grand prize: 5-day Seoul shopping trip!
            </p>

            {/* User Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300 mb-1">
                  {userPoints.toLocaleString()}
                </div>
                <div className="text-sm text-white/80">Your Points</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300 mb-1">
                  {userLevel}
                </div>
                <div className="text-sm text-white/80">Current Level</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-300 mb-1">
                  {raffleTickets}
                </div>
                <div className="text-sm text-white/80">Raffle Tickets</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link 
                href="/loyalty"
                className="bg-white text-korean-500 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center space-x-2"
              >
                <span>View Rewards</span>
                <GiftIcon className="h-5 w-5" />
              </Link>
              <Link 
                href="/community"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-korean-500 transition-colors inline-flex items-center justify-center space-x-2"
              >
                <span>Join Community</span>
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Seoul Trip Countdown */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPinIcon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Monthly Seoul Trip Raffle
              </h3>
              <p className="text-white/80 text-sm">
                Next drawing in:
              </p>
            </div>

            {/* Countdown Timer */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="bg-white/20 rounded-lg p-3 mb-2">
                  <div className="text-2xl font-bold text-white">
                    {timeLeft.days}
                  </div>
                </div>
                <div className="text-xs text-white/80">Days</div>
              </div>
              <div className="text-center">
                <div className="bg-white/20 rounded-lg p-3 mb-2">
                  <div className="text-2xl font-bold text-white">
                    {timeLeft.hours}
                  </div>
                </div>
                <div className="text-xs text-white/80">Hours</div>
              </div>
              <div className="text-center">
                <div className="bg-white/20 rounded-lg p-3 mb-2">
                  <div className="text-2xl font-bold text-white">
                    {timeLeft.minutes}
                  </div>
                </div>
                <div className="text-xs text-white/80">Minutes</div>
              </div>
            </div>

            {/* Trip Details */}
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Trip Includes:</h4>
              <ul className="text-sm text-white/90 space-y-1">
                <li>✈️ Round-trip flights</li>
                <li>🏨 4-night Seoul hotel</li>
                <li>💳 $1,000 shopping budget</li>
                <li>🎭 Cultural experiences</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Rewards Preview */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {rewards.map((reward, index) => (
            <div 
              key={index}
              className={`bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center transition-all duration-300 ${
                reward.available ? 'hover:bg-white/20 cursor-pointer' : 'opacity-60'
              }`}
            >
              <reward.icon className="h-8 w-8 text-white mx-auto mb-2" />
              <div className="text-sm font-semibold text-white mb-1">
                {reward.points.toLocaleString()} pts
              </div>
              <div className="text-xs text-white/80">
                {reward.reward}
              </div>
              {reward.available && (
                <div className="mt-2">
                  <span className="bg-yellow-300 text-gray-900 px-2 py-1 rounded-full text-xs font-medium">
                    Available
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}