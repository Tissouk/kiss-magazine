export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Kiss Magazine
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your gateway to authentic Korean culture, fashion, and beauty
        </p>
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">🇰🇷 Korean Culture Hub</h2>
          <p className="mb-4">
            Discover K-fashion, K-beauty, and connect with Korean culture enthusiasts worldwide
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-bold mb-2">🛍️ Shop Korean Brands</h3>
              <p className="text-sm">Authentic products from Seoul</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-bold mb-2">👥 Join Community</h3>
              <p className="text-sm">Share your Korean culture journey</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-bold mb-2">🏆 Earn Rewards</h3>
              <p className="text-sm">Win Seoul trip in monthly raffle</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}