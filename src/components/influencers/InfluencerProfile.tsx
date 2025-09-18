// components/influencer/InfluencerProfile.tsx
export function InfluencerProfile({ influencer }: { influencer: Influencer }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-4 mb-6">
        <img 
          src={influencer.avatar} 
          alt={influencer.name}
          className="w-16 h-16 rounded-full"
        />
        <div>
          <h2 className="text-xl font-bold">{influencer.name}</h2>
          <p className="text-gray-600">@{influencer.handle}</p>
        </div>
      </div>
      
      <ShopCollection 
        title={`Shop ${influencer.name}'s Picks`}
        products={influencer.featuredProducts}
        discountCode={influencer.discountCode}
      />
    </div>
  );
}