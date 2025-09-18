// lib/analytics.ts
export function trackKoreanCultureEngagement(category: string, action: string) {
  gtag('event', action, {
    event_category: category,
    event_label: 'Korean Culture Content',
    custom_map: {
      korean_content_type: category,
    },
  });
}

export function trackInfluencerConversion(influencerId: string, productId: string) {
  gtag('event', 'influencer_conversion', {
    influencer_id: influencerId,
    product_id: productId,
    value: product.price,
    currency: 'USD',
  });
}