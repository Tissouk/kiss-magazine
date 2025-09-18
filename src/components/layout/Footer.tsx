'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  HeartIcon as HeartSolid,
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon
} from '@heroicons/react/24/solid';
import {
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  YouTubeIcon,
  TikTokIcon
} from '@/components/ui/SocialIcons';

export function Footer() {
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('en');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Newsletter signup logic
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  const footerLinks = {
    'Korean Culture': [
      { name: 'K-POP News', href: '/k-pop' },
      { name: 'K-Drama Reviews', href: '/k-drama' },
      { name: 'K-Fashion Trends', href: '/k-fashion' },
      { name: 'K-Beauty Guide', href: '/k-beauty' },
      { name: 'Seoul Places', href: '/k-places' },
    ],
    'Shop': [
      { name: 'Korean Fashion', href: '/shop/fashion' },
      { name: 'K-Beauty Products', href: '/shop/beauty' },
      { name: 'Accessories', href: '/shop/accessories' },
      { name: 'Limited Editions', href: '/shop/limited' },
      { name: 'Best Sellers', href: '/shop/bestsellers' },
    ],
    'Community': [
      { name: 'Join Community', href: '/community' },
      { name: 'Style Sharing', href: '/community/style' },
      { name: 'Korea Trip Contest', href: '/community/contest' },
      { name: 'Loyalty Program', href: '/loyalty' },
      { name: 'Influencers', href: '/influencers' },
    ],
    'Support': [
      { name: 'Shipping Info', href: '/shipping' },
      { name: 'Returns & Exchanges', href: '/returns' },
      { name: 'Size Guide', href: '/size-guide' },
      { name: 'Customer Service', href: '/support' },
      { name: 'Track Order', href: '/track' },
    ],
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-korean-500">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-2">
                Stay Updated with Korean Culture
              </h3>
              <p className="text-korean-100">
                Get the latest K-fashion trends, beauty tips, and exclusive offers delivered to your inbox.
              </p>
            </div>
            
            <form onSubmit={handleNewsletterSubmit} className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-white text-korean-500 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <HeartSolid className="h-8 w-8 text-korean-500" />
              <span className="text-2xl font-bold">KISS</span>
              <span className="text-lg text-gray-300">MAGAZINE</span>
            </Link>
            
            <p className="text-gray-300 mb-6 max-w-sm">
              Your gateway to Korean culture. Discover the latest in K-POP, K-Drama, 
              K-Fashion, and K-Beauty while connecting with a global community of Korean culture enthusiasts.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center space-x-3">
                <MapPinIcon className="h-4 w-4 text-korean-500" />
                <span>Seoul, South Korea & Global</span>
              </div>
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-4 w-4 text-korean-500" />
                <span>hello@kiss-magazine.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <PhoneIcon className="h-4 w-4 text-korean-500" />
                <span>+82-2-1234-5678</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-white mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-300 hover:text-korean-500 transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Media & Language */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
            {/* Social Media */}
            <div className="flex items-center space-x-6">
              <span className="text-gray-300 text-sm">Follow us:</span>
              <div className="flex items-center space-x-4">
                <Link href="https://instagram.com/kiss.mag_korea" className="text-gray-300 hover:text-korean-500 transition-colors">
                  <InstagramIcon className="h-5 w-5" />
                </Link>
                <Link href="https://youtube.com/@kissmag" className="text-gray-300 hover:text-korean-500 transition-colors">
                  <YouTubeIcon className="h-5 w-5" />
                </Link>
                <Link href="https://tiktok.com/@kiss.magazine" className="text-gray-300 hover:text-korean-500 transition-colors">
                  <TikTokIcon className="h-5 w-5" />
                </Link>
                <Link href="https://twitter.com/kiss_magazine" className="text-gray-300 hover:text-korean-500 transition-colors">
                  <TwitterIcon className="h-5 w-5" />
                </Link>
                <Link href="https://facebook.com/kissmagazine" className="text-gray-300 hover:text-korean-500 transition-colors">
                  <FacebookIcon className="h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 text-sm">Language:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:ring-2 focus:ring-korean-500 focus:outline-none text-sm"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 text-sm text-gray-400">
            <div className="flex items-center space-x-6">
              <span>© 2024 Kiss Magazine. All rights reserved.</span>
              <Link href="/privacy" className="hover:text-korean-500 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-korean-500 transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-korean-500 transition-colors">
                Cookie Policy
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <span>Ships from Seoul 🇰🇷 to the world 🌍</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}