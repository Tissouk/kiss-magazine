'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  MagnifyingGlassIcon, 
  UserIcon, 
  ShoppingBagIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const navigation = [
  { name: 'Home', href: '/' },
  { 
    name: 'K-POP', 
    href: '/k-pop',
    subcategories: [
      { name: 'Latest News', href: '/k-pop/news' },
      { name: 'Fashion', href: '/k-pop/fashion' },
      { name: 'Albums', href: '/k-pop/albums' },
      { name: 'Concerts', href: '/k-pop/concerts' },
    ]
  },
  { 
    name: 'K-DRAMA', 
    href: '/k-drama',
    subcategories: [
      { name: 'Latest Reviews', href: '/k-drama/reviews' },
      { name: 'Fashion & Style', href: '/k-drama/fashion' },
      { name: 'Behind Scenes', href: '/k-drama/behind-scenes' },
      { name: 'Recommendations', href: '/k-drama/recommendations' },
    ]
  },
  { 
    name: 'K-FASHION', 
    href: '/k-fashion',
    subcategories: [
      { name: 'Street Style', href: '/k-fashion/street-style' },
      { name: 'Brands', href: '/k-fashion/brands' },
      { name: 'Trends', href: '/k-fashion/trends' },
      { name: 'Styling Tips', href: '/k-fashion/styling' },
    ]
  },
  { 
    name: 'K-BEAUTY', 
    href: '/k-beauty',
    subcategories: [
      { name: 'Skincare', href: '/k-beauty/skincare' },
      { name: 'Makeup', href: '/k-beauty/makeup' },
      { name: 'Reviews', href: '/k-beauty/reviews' },
      { name: 'Routines', href: '/k-beauty/routines' },
    ]
  },
  { name: 'K-PLACES', href: '/k-places' },
  { name: 'Shop', href: '/shop' },
  { name: 'Community', href: '/community' },
  { name: 'Influencers', href: '/influencers' },
];

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState(languages[0]);
  const [cartItemCount, setCartItemCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleDropdownToggle = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg' 
            : 'bg-white'
        }`}
      >
        <div className="container mx-auto px-4">
          {/* Top bar - Mobile hidden */}
          <div className="hidden lg:flex items-center justify-between py-2 text-sm border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Free shipping over $50 worldwide</span>
              <span className="text-korean-500">•</span>
              <span className="text-gray-600">New K-Beauty arrivals weekly</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/customer-service" className="text-gray-600 hover:text-korean-500 transition-colors">
                Customer Service
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/shipping" className="text-gray-600 hover:text-korean-500 transition-colors">
                Shipping Info
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/returns" className="text-gray-600 hover:text-korean-500 transition-colors">
                Returns
              </Link>
            </div>
          </div>

          {/* Main header */}
          <div className="flex items-center justify-between py-4">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-korean-500"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="relative">
                <HeartIconSolid className="h-8 w-8 text-korean-500" />
                <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                  K
                </span>
              </div>
              <span className="text-2xl font-bold text-gradient">
                KISS
              </span>
              <span className="hidden sm:block text-sm font-medium text-gray-600">
                MAGAZINE
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => (
                <div key={item.name} className="relative group">
                  {item.subcategories ? (
                    <button
                      className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                        pathname.startsWith(item.href)
                          ? 'text-korean-500'
                          : 'text-gray-700 hover:text-korean-500'
                      }`}
                      onClick={() => handleDropdownToggle(item.name)}
                    >
                      <span>{item.name}</span>
                      <ChevronDownIcon className="h-4 w-4" />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                        pathname === item.href
                          ? 'text-korean-500'
                          : 'text-gray-700 hover:text-korean-500'
                      }`}
                    >
                      {item.name}
                    </Link>
                  )}

                  {/* Dropdown Menu */}
                  {item.subcategories && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2">
                        {item.subcategories.map((subitem) => (
                          <Link
                            key={subitem.name}
                            href={subitem.href}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-korean-50 hover:text-korean-500 transition-colors"
                          >
                            {subitem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Language selector */}
              <div className="relative group">
                <button className="flex items-center space-x-1 p-2 text-gray-600 hover:text-korean-500 transition-colors">
                  <GlobeAltIcon className="h-5 w-5" />
                  <span className="hidden sm:block text-sm">
                    {currentLanguage.flag} {currentLanguage.code.toUpperCase()}
                  </span>
                  <ChevronDownIcon className="h-4 w-4" />
                </button>
                
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setCurrentLanguage(lang)}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-korean-50 hover:text-korean-500 transition-colors"
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Search */}
              <button
                className="p-2 text-gray-600 hover:text-korean-500 transition-colors"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>

              {/* Account */}
              <Link 
                href="/account"
                className="p-2 text-gray-600 hover:text-korean-500 transition-colors"
              >
                <UserIcon className="h-5 w-5" />
              </Link>

              {/* Cart */}
              <Link 
                href="/cart"
                className="relative p-2 text-gray-600 hover:text-korean-500 transition-colors"
              >
                <ShoppingBagIcon className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-korean-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="container mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for Korean fashion, beauty, culture..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-korean-500 focus:border-transparent"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={toggleMobileMenu}
          />
          <div className="fixed top-0 left-0 h-full w-80 bg-white shadow-xl">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                  <HeartIconSolid className="h-6 w-6 text-korean-500" />
                  <span className="text-xl font-bold text-gradient">KISS</span>
                </Link>
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 text-gray-600 hover:text-korean-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <nav className="p-4">
              {navigation.map((item) => (
                <div key={item.name} className="mb-2">
                  <Link
                    href={item.href}
                    className="flex items-center justify-between py-3 text-gray-700 hover:text-korean-500 transition-colors"
                    onClick={toggleMobileMenu}
                  >
                    <span>{item.name}</span>
                    {item.subcategories && (
                      <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </Link>
                  {item.subcategories && (
                    <div className="ml-4 space-y-2">
                      {item.subcategories.map((subitem) => (
                        <Link
                          key={subitem.name}
                          href={subitem.href}
                          className="block py-2 text-sm text-gray-600 hover:text-korean-500 transition-colors"
                          onClick={toggleMobileMenu}
                        >
                          {subitem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Spacer for fixed header */}
      <div className="h-20 lg:h-24" />
    </>
  );
}