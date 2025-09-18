import { NextRequest, NextResponse } from 'next/server';

interface ShippingCalculationRequest {
  items: Array<{
    weight_grams: number;
    quantity: number;
  }>;
  destination_country: string;
  destination_province?: string;
  cart_total: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: ShippingCalculationRequest = await request.json();
    const { items, destination_country, cart_total } = body;

    // Calculate total weight
    const totalWeight = items.reduce((sum, item) => 
      sum + (item.weight_grams * item.quantity), 0
    );

    // Free shipping threshold
    if (cart_total >= 50) {
      return NextResponse.json({
        success: true,
        data: {
          shipping_cost: 0,
          shipping_method: 'Free International Shipping',
          estimated_days: getEstimatedDays(destination_country),
          free_shipping: true,
          carrier: 'Korea Post'
        }
      });
    }

    // Calculate shipping based on destination and weight
    const shippingRates = calculateSeoulShipping(destination_country, totalWeight);

    return NextResponse.json({
      success: true,
      data: {
        ...shippingRates,
        free_shipping: false,
        free_shipping_remaining: 50 - cart_total
      }
    });

  } catch (error) {
    console.error('Shipping Calculation Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate shipping' },
      { status: 500 }
    );
  }
}

function calculateSeoulShipping(country: string, weightGrams: number) {
  const weightKg = weightGrams / 1000;
  
  // Seoul to international shipping rates
  const rates = {
    // Asia Pacific
    'JP': { base: 8.99, perKg: 2.50, days: '7-10', carrier: 'Korea Post' },
    'CN': { base: 9.99, perKg: 3.00, days: '10-14', carrier: 'Korea Post' },
    'SG': { base: 12.99, perKg: 4.00, days: '10-14', carrier: 'Korea Post' },
    'AU': { base: 15.99, perKg: 5.00, days: '12-16', carrier: 'Korea Post' },
    
    // North America
    'US': { base: 12.99, perKg: 4.50, days: '10-14', carrier: 'K-Packet' },
    'CA': { base: 14.99, perKg: 5.00, days: '12-16', carrier: 'K-Packet' },
    
    // Europe
    'GB': { base: 16.99, perKg: 6.00, days: '12-18', carrier: 'Korea Post' },
    'DE': { base: 16.99, perKg: 6.00, days: '12-18', carrier: 'Korea Post' },
    'FR': { base: 16.99, perKg: 6.00, days: '12-18', carrier: 'Korea Post' },
    'IT': { base: 18.99, perKg: 6.50, days: '14-20', carrier: 'Korea Post' },
    'ES': { base: 18.99, perKg: 6.50, days: '14-20', carrier: 'Korea Post' },
    
    // Default for other countries
    'DEFAULT': { base: 19.99, perKg: 7.00, days: '14-21', carrier: 'Korea Post' }
  };

  const rate = rates[country as keyof typeof rates] || rates.DEFAULT;
  const shippingCost = rate.base + (Math.max(0, weightKg - 1) * rate.perKg);

  return {
    shipping_cost: parseFloat(shippingCost.toFixed(2)),
    shipping_method: `Standard Shipping from Seoul`,
    estimated_days: rate.days,
    carrier: rate.carrier,
    origin: 'Seoul, South Korea'
  };
}

function getEstimatedDays(country: string): string {
  const estimatedDays = {
    'JP': '7-10',
    'CN': '10-14',
    'SG': '10-14',
    'AU': '12-16',
    'US': '10-14',
    'CA': '12-16',
    'GB': '12-18',
    'DE': '12-18',
    'FR': '12-18',
    'IT': '14-20',
    'ES': '14-20'
  };

  return estimatedDays[country as keyof typeof estimatedDays] || '14-21';
}