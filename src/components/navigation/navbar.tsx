'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Bars3Icon, XMarkIcon, ShoppingBagIcon, UserIcon } from '@heroicons/react/24/outline'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Kiss Magazine
              </div>
              <span className="text-sm bg-pink-100 text-pink-800 px-2 py-1 rounded-full">🇰🇷</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/shop" className="text-gray-700 hover:text-pink-600 transition-colors">
              K-Fashion
            </Link>
            <Link href="/beauty" className="text-gray-700 hover:text-pink-600 transition-colors">
              K-Beauty
            </Link>
            <Link href="/brands" className="text-gray-700 hover:text-pink-600 transition-colors">
              Korean Brands
            </Link>
            <Link href="/community" className="text-gray-700 hover:text-pink-600 transition-colors">
              Community
            </Link>
            <Link href="/articles" className="text-gray-700 hover:text-pink-600 transition-colors">
              K-Culture
            </Link>
            <Link href="/loyalty" className="text-gray-700 hover:text-pink-600 transition-colors">
              Rewards
            </Link>
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-700 hover:text-pink-600 transition-colors">
              <ShoppingBagIcon className="h-6 w-6" />
            </button>
            <button className="text-gray-700 hover:text-pink-600 transition-colors">
              <UserIcon className="h-6 w-6" />
            </button>
            
            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/shop" className="block px-3 py-2 text-gray-700 hover:text-pink-600">
                K-Fashion
              </Link>
              <Link href="/beauty" className="block px-3 py-2 text-gray-700 hover:text-pink-600">
                K-Beauty
              </Link>
              <Link href="/brands" className="block px-3 py-2 text-gray-700 hover:text-pink-600">
                Korean Brands
              </Link>
              <Link href="/community" className="block px-3 py-2 text-gray-700 hover:text-pink-600">
                Community
              </Link>
              <Link href="/articles" className="block px-3 py-2 text-gray-700 hover:text-pink-600">
                K-Culture
              </Link>
              <Link href="/loyalty" className="block px-3 py-2 text-gray-700 hover:text-pink-600">
                Rewards
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}