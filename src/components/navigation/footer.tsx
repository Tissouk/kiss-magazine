import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Kiss Magazine
            </div>
            <p className="text-gray-300 mb-4">
              Your gateway to authentic Korean culture, fashion, and beauty. 
              Connecting Korean culture enthusiasts worldwide.
            </p>
            <div className="flex space-x-4">
              <span className="text-2xl">🇰🇷</span>
              <span className="text-sm text-gray-400">Shipping from Seoul, South Korea</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><Link href="/shop/fashion" className="text-gray-300 hover:text-pink-400">K-Fashion</Link></li>
              <li><Link href="/shop/beauty" className="text-gray-300 hover:text-pink-400">K-Beauty</Link></li>
              <li><Link href="/shop/accessories" className="text-gray-300 hover:text-pink-400">Accessories</Link></li>
              <li><Link href="/brands" className="text-gray-300 hover:text-pink-400">Korean Brands</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Community</h3>
            <ul className="space-y-2">
              <li><Link href="/community" className="text-gray-300 hover:text-pink-400">Community Hub</Link></li>
              <li><Link href="/loyalty" className="text-gray-300 hover:text-pink-400">Loyalty Program</Link></li>
              <li><Link href="/articles" className="text-gray-300 hover:text-pink-400">K-Culture Articles</Link></li>
              <li><Link href="/about" className="text-gray-300 hover:text-pink-400">About Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Kiss Magazine. Bringing Korean culture to the world. 🌏💜</p>
        </div>
      </div>
    </footer>
  )
}