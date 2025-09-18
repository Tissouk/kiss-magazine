export function KoreanBrandsShowcase() {
  const brands = [
    { name: 'BLACKPINK Beauty', logo: '💄', verified: true },
    { name: 'Seoul Fashion Co', logo: '👕', verified: true },
    { name: 'K-Beauty Lab', logo: '🧴', verified: false },
    { name: 'Modern Hanbok', logo: '👘', verified: true },
  ]

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🇰🇷 Featured Korean Brands
        </h2>
        <p className="text-xl text-gray-600">
          Authentic brands shipped directly from Seoul
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {brands.map((brand, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">{brand.logo}</div>
            <h3 className="font-semibold text-gray-900 mb-2">{brand.name}</h3>
            {brand.verified && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ Verified
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}