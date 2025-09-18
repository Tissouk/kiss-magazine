import Link from 'next/link'

export function LoyaltyProgram() {
  const loyaltyTiers = [
    {
      name: 'Bronze',
      icon: '🥉',
      points: '0-999',
      benefits: [
        '5% discount on all products',
        'Birthday special offer',
        'Early access to sales',
        'Community forum access'
      ],
      color: 'from-amber-400 to-amber-600'
    },
    {
      name: 'Silver',
      icon: '🥈',
      points: '1000-2999',
      benefits: [
        '10% discount on all products',
        'Free shipping on orders $75+',
        'Exclusive K-beauty samples',
        'Monthly Korean snack box entry'
      ],
      color: 'from-gray-400 to-gray-600'
    },
    {
      name: 'Gold',
      icon: '🥇',
      points: '3000-4999',
      benefits: [
        '15% discount on all products',
        'Free shipping on all orders',
        'Exclusive Korean brand collaborations',
        'Virtual K-culture events access'
      ],
      color: 'from-yellow-400 to-yellow-600'
    },
    {
      name: 'Diamond',
      icon: '💎',
      points: '5000+',
      benefits: [
        '20% discount on all products',
        'Priority customer support',
        'Seoul trip raffle entry',
        'Exclusive Korean celebrity meet & greets'
      ],
      color: 'from-blue-400 to-purple-600'
    }
  ]

  const pointsActivities = [
    { activity: 'Purchase ($1 = 1 point)', points: '+1 per $1', icon: '🛍️' },
    { activity: 'Product review', points: '+50', icon: '⭐' },
    { activity: 'Social media share', points: '+25', icon: '📱' },
    { activity: 'Community post', points: '+30', icon: '💬' },
    { activity: 'Refer a friend', points: '+200', icon: '👥' },
    { activity: 'Korean culture quiz', points: '+75', icon: '🧠' }
  ]

  const currentRewards = [
    { name: 'Seoul 5-Day Trip', points: 10000, image: '✈️', status: 'Monthly Raffle' },
    { name: 'BTS Concert Tickets', points: 7500, image: '🎤', status: 'Limited' },
    { name: 'Korean Skincare Set', points: 2000, image: '🧴', status: 'Available' },
    { name: 'Hanbok Rental Voucher', points: 1500, image: '👘', status: 'Available' },
    { name: 'Korean Cooking Class', points: 1000, image: '🍜', status: 'Available' },
    { name: 'K-Drama Box Set', points: 800, image: '📺', status: 'Available' }
  ]

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">
          🏆 Seoul Dreams Loyalty Program
        </h2>
        <p className="text-xl text-pink-100">
          Earn points with every action and unlock amazing Korean culture rewards!
        </p>
      </div>

      {/* Loyalty Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {loyaltyTiers.map((tier, index) => (
          <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all">
            <div className="text-4xl mb-3">{tier.icon}</div>
            <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
            <div className="text-pink-100 font-medium mb-4">{tier.points} points</div>
            
            <ul className="text-sm text-pink-100 space-y-2">
              {tier.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-green-300 mr-2">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* How to Earn Points */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-16">
        <h3 className="text-2xl font-bold text-center mb-8">
          💰 How to Earn Points
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pointsActivities.map((activity, index) => (
            <div key={index} className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">{activity.icon}</div>
              <div className="font-semibold text-sm mb-1">{activity.activity}</div>
              <div className="text-green-300 font-bold">{activity.points}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Rewards */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-center mb-8">
          🎁 Available Rewards
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentRewards.map((reward, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-all">
              <div className="text-4xl mb-3">{reward.image}</div>
              <h4 className="font-bold text-lg mb-2">{reward.name}</h4>
              <div className="text-2xl font-bold text-yellow-300 mb-2">
                {reward.points.toLocaleString()} pts
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                reward.status === 'Monthly Raffle' ? 'bg-purple-500' :
                reward.status === 'Limited' ? 'bg-red-500' : 'bg-green-500'
              }`}>
                {reward.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Example */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-12">
        <h3 className="text-2xl font-bold text-center mb-6">
          📊 Your Progress Example
        </h3>
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold">Silver Member</span>
            <span className="text-sm">2,150 / 3,000 points to Gold</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-4 mb-4">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-4 rounded-full" style={{ width: '71.6%' }}></div>
          </div>
          <div className="text-center text-sm text-pink-100">
            850 more points to reach Gold level and unlock Seoul trip raffle!
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="text-center space-y-4">
        <div>
          <Link 
            href="/loyalty/signup" 
            className="inline-flex items-center px-8 py-3 bg-white text-purple-600 rounded-full font-semibold hover:bg-gray-100 transition-colors mr-4"
          >
            Join Loyalty Program
          </Link>
          <Link 
            href="/loyalty/rewards" 
            className="inline-flex items-center px-8 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-purple-600 transition-colors"
          >
            View All Rewards
          </Link>
        </div>
        <div className="text-sm text-pink-100">
          💡 Tip: Complete your profile to earn 500 bonus points!
        </div>
      </div>
    </div>
  )
}