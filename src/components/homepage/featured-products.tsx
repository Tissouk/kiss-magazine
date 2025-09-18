import Link from 'next/link'

interface Product {
  id: string
  name: string
  price: number
  image: string
  brand: string
  badge?: string
}

export function FeaturedProducts() {
  // Sample featured products - replace with real data from Supabase
  const featuredProducts: Product[] = [
    {
      id: '1',
      name: 'Korean Glass Skin Serum',
      price: 45.99,
      image: '/api/placeholder/300/300',
      brand: 'K-Beauty Lab',
      badge: 'Best Seller'
    },
    {
      id: '2',
      name: 'Seoul Streetwear Hoodie',
      price: 89.99,
      image: '/api/placeholder/300/300',
      brand: 'Seoul Fashion Co',
      badge: 'New Arrival'
    },
    {
      id: '3',
      name: 'BLACKPINK Lip Tint Set',
      price: 29.99,
      image: '/api/placeholder/300/300',
      brand: 'BLACKPINK Beauty',
      badge: 'Limited Edition'
    },
    {
      id: '4',
      name: 'Hanbok-Inspired Dress',
      price: 129.99,
      image: '/api/placeholder/300/300',
      brand: 'Modern Hanbok',
      badge: 'Trending'
    }
  ]

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🌟 Featured Korean Products
        </h2>
        <p className="text-xl text-gray-600">
          Handpicked authentic products from our favorite Korean brands
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
            <div className="relative">
              <div className="aspect-square bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Product Image</span>
              </div>
              {product.badge && (
                <span className="absolute top-3 left-3 bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  {product.badge}
                </span>
              )}
            </div>
            
            <div className="p-4">
              <div className="text-sm text-purple-600 font-medium mb-1">
                {product.brand}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                {product.name}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-900">
                  ${product.price}
                </span>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <Link 
          href="/shop" 
          className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          View All Products →
        </Link>
      </div>
    </div>
  )
}