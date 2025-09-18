import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Get available rewards catalog
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const userLevel = searchParams.get('user_level');

    // Korean culture-focused rewards catalog
    const rewards = [
      {
        id: 'discount-5',
        name: '$5 Off Your Order',
        description: 'Apply $5 discount to any Korean product purchase',
        pointsCost: 500,
        category: 'discount',
        icon: '💰',
        availability: 'unlimited',
        levelRequired: 'Bronze',
        koreanCulture: false
      },
      {
        id: 'korean-snack-box',
        name: 'Korean Snack Discovery Box',
        description: 'Curated box of popular Korean snacks and treats from Seoul',
        pointsCost: 2000,
        category: 'physical',
        icon: '🍿',
        availability: 'limited',
        stock: 50,
        levelRequired: 'Silver',
        koreanCulture: true,
        estimatedValue: 25
      },
      {
        id: 'kbeauty-starter-kit',
        name: 'K-Beauty Starter Kit',
        description: '5-piece Korean skincare set with glass skin essentials',
        pointsCost: 3500,
        category: 'beauty',
        icon: '💄',
        availability: 'limited',
        stock: 30,
        levelRequired: 'Gold',
        koreanCulture: true,
        estimatedValue: 45
      },
      {
        id: 'korean-language-course',
        name: '3-Month Korean Language Course',
        description: 'Online Korean language course with K-drama context',
        pointsCost: 5000,
        category: 'education',
        icon: '📚',
        availability: 'limited',
        stock: 20,
        levelRequired: 'Gold',
        koreanCulture: true,
        estimatedValue: 99
      },
      {
        id: 'seoul-fashion-week-merchandise',
        name: 'Seoul Fashion Week Exclusive Merch',
        description: 'Limited edition tote bag and accessories from Seoul Fashion Week',
        pointsCost: 7500,
        category: 'fashion',
        icon: '👜',
        availability: 'limited',
        stock: 15,
        levelRequired: 'Platinum',
        koreanCulture: true,
        estimatedValue: 85
      },
      {
        id: 'virtual-seoul-tour',
        name: 'Virtual Seoul Culture Tour',
        description: 'Live-guided virtual tour of Seoul with Korean culture expert',
        pointsCost: 10000,
        category: 'experience',
        icon: '🏛️',
        availability: 'scheduled',
        nextAvailable: '2024-02-15',
        levelRequired: 'Platinum',
        koreanCulture: true,
        estimatedValue: 120
      },
      {
        id: 'seoul-trip-5day',
        name: '5-Day Seoul Adventure Trip',
        description: 'Complete Seoul experience: flights, hotel, cultural tours, and $1000 shopping budget',
        pointsCost: 50000,
        category: 'travel',
        icon: '✈️',
        availability: 'raffle',
        levelRequired: 'Diamond',
        koreanCulture: true,
        estimatedValue: 3500,
        special: true
      }
    ];

    // Filter rewards based on query parameters
    let filteredRewards = rewards;

    if (category) {
      filteredRewards = filteredRewards.filter(r => r.category === category);
    }

    if (userLevel) {
      const levelHierarchy = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
      const userLevelIndex = levelHierarchy.indexOf(userLevel);
      filteredRewards = filteredRewards.filter(r => {
        const requiredLevelIndex = levelHierarchy.indexOf(r.levelRequired);
        return userLevelIndex >= requiredLevelIndex;
      });
    }

    // Get user's current points if authenticated
    let userPoints = 0;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('points')
          .eq('id', user.id)
          .single();
        userPoints = userProfile?.points || 0;
      }
    } catch (authError) {
      // Continue without user points if not authenticated
    }

    // Add affordability info
    const enrichedRewards = filteredRewards.map(reward => ({
      ...reward,
      affordable: userPoints >= reward.pointsCost,
      pointsNeeded: Math.max(0, reward.pointsCost - userPoints)
    }));

    // Separate by category for better UX
    const categorizedRewards = {
      featured: enrichedRewards.filter(r => r.koreanCulture && r.affordable).slice(0, 3),
      discounts: enrichedRewards.filter(r => r.category === 'discount'),
      physical: enrichedRewards.filter(r => r.category === 'physical' || r.category === 'beauty' || r.category === 'fashion'),
      experiences: enrichedRewards.filter(r => r.category === 'experience' || r.category === 'education'),
      premium: enrichedRewards.filter(r => r.category === 'travel' || r.special),
      all: enrichedRewards
    };

    return NextResponse.json({
      success: true,
      data: category ? enrichedRewards : categorizedRewards,
      userPoints,
      filters: { category, userLevel }
    });

  } catch (error) {
    console.error('Rewards Catalog API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rewards' },
      { status: 500 }
    );
  }
}