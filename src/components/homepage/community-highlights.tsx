import Link from 'next/link'

export function CommunityHighlights() {
  const communityPosts = [
    {
      id: '1',
      user: 'KpopLover_Seoul',
      avatar: '👩',
      content: 'Just got my new hanbok-inspired dress from Kiss Magazine! The quality is amazing 😍',
      image: '🛍️',
      likes: 245,
      comments: 32,
      tag: 'K-Fashion'
    },
    {
      id: '2',
      user: 'BeautyGuru_KR',
      avatar: '👨',
      content: 'This Korean glass skin routine changed my life! Thanks Kiss Magazine community 💫',
      image: '✨',
      likes: 189,
      comments: 67,
      tag: 'K-Beauty'
    },
    {
      id: '3',
      user: 'SeoulDreamer',
      avatar: '👧',
      content: 'Can\'t wait for the Seoul trip raffle! Already at Gold level 🏆',
      image: '🇰🇷',
      likes: 156,
      comments: 28,
      tag: 'Loyalty'
    }
  ]

  const featuredMembers = [
    { name: 'MinJee_Style', level: 'Diamond', posts: 127, followers: '2.1k' },
    { name: 'KoreanVibes', level: 'Gold', posts: 89, followers: '1.8k' },
    { name: 'SeoulChic', level: 'Gold', posts: 76, followers: '1.3k' },
    { name: 'KpopFashion', level: 'Silver', posts: 45, followers: '892' }
  ]

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🌟 Community Highlights
        </h2>
        <p className="text-xl text-gray-600">
          See what our Korean culture enthusiasts are sharing
        </p>
      </div>

      {/* Recent Community Posts */}
      <div className="mb-16">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          📱 Recent Posts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {communityPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              {/* User Header */}
              <div className="flex items-center mb-4">
                <div className="text-2xl mr-3">{post.avatar}</div>
                <div>
                  <div className="font-semibold text-gray-900">{post.user}</div>
                  <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                    {post.tag}
                  </span>
                </div>
              </div>

              {/* Post Content */}
              <p className="text-gray-700 mb-4">{post.content}</p>
              
              {/* Post Image/Icon */}
              <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg p-8 text-center mb-4">
                <div className="text-4xl">{post.image}</div>
              </div>

              {/* Engagement */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>❤️ {post.likes} likes</span>
                <span>💬 {post.comments} comments</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Community Members */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          🏆 Top Community Members
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredMembers.map((member, index) => (
            <div key={index} className="bg-white rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-shadow">
              <div className="text-2xl mb-2">
                {member.level === 'Diamond' ? '💎' : member.level === 'Gold' ? '🥇' : '🥈'}
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">{member.name}</h4>
              <p className="text-sm text-purple-600 font-medium mb-2">{member.level} Member</p>
              <div className="text-xs text-gray-500 space-y-1">
                <div>{member.posts} posts</div>
                <div>{member.followers} followers</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community Stats */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div>
          <div className="text-2xl font-bold text-purple-600 mb-2">2.5K+</div>
          <div className="text-gray-600">Daily Posts</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-pink-600 mb-2">15K+</div>
          <div className="text-gray-600">Photos Shared</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-600 mb-2">89%</div>
          <div className="text-gray-600">Satisfaction Rate</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-pink-600 mb-2">24/7</div>
          <div className="text-gray-600">Community Support</div>
        </div>
      </div>

      {/* Join Community CTA */}
      <div className="text-center mt-12">
        <Link 
          href="/community" 
          className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          Join Our Community →
        </Link>
      </div>
    </div>
  )
}