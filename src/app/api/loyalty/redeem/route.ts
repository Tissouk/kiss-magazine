import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rewardId, shippingAddress } = body;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get reward details (in a real app, this would be from database)
    const rewardCatalog = {
      'discount-5': { pointsCost: 500, name: '$5 Off Discount', type: 'discount' },
      'korean-snack-box': { pointsCost: 2000, name: 'Korean Snack Box', type: 'physical' },
      'kbeauty-starter-kit': { pointsCost: 3500, name: 'K-Beauty Starter Kit', type: 'physical' },
      'korean-language-course': { pointsCost: 5000, name: 'Korean Language Course', type: 'digital' },
      'seoul-fashion-week-merchandise': { pointsCost: 7500, name: 'Seoul Fashion Week Merch', type: 'physical' },
      'virtual-seoul-tour': { pointsCost: 10000, name: 'Virtual Seoul Tour', type: 'experience' }
    };

    const reward = rewardCatalog[rewardId as keyof typeof rewardCatalog];
    if (!reward) {
      return NextResponse.json(
        { success: false, error: 'Invalid reward ID' },
        { status: 400 }
      );
    }

    // Check if user has enough points
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('points, level')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    if (userProfile.points < reward.pointsCost) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient points',
        data: {
          required: reward.pointsCost,
          current: userProfile.points,
          needed: reward.pointsCost - userProfile.points
        }
      }, { status: 400 });
    }

    // Validate shipping address for physical rewards
    if (reward.type === 'physical' && !shippingAddress) {
      return NextResponse.json(
        { success: false, error: 'Shipping address required for physical rewards' },
        { status: 400 }
      );
    }

    // Start transaction
    const { data: success, error: redeemError } = await supabase.rpc('redeem_points', {
      user_uuid: user.id,
      points_amount: reward.pointsCost,
      transaction_action: 'reward_redemption',
      transaction_description: `Redeemed: ${reward.name}`,
      reference_uuid: null
    });

    if (redeemError || !success) {
      throw redeemError || new Error('Failed to redeem points');
    }

    // Create redemption record
    const redemptionData = {
      user_id: user.id,
      reward_id: rewardId,
      reward_name: reward.name,
      points_cost: reward.pointsCost,
      reward_type: reward.type,
      shipping_address: shippingAddress,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const { data: redemption, error: redemptionError } = await supabase
      .from('reward_redemptions')
      .insert(redemptionData)
      .select()
      .single();

    if (redemptionError) throw redemptionError;

    // Handle different reward types
    let fulfillmentInfo = {};
    
    if (reward.type === 'discount') {
      // Generate discount code
      const discountCode = `KISS${Date.now().toString().slice(-6)}`;
      fulfillmentInfo = {
        discountCode,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        instructions: 'Use this code at checkout for $5 off your next Korean product purchase'
      };

      // Create discount code in system
      await supabase
        .from('discount_codes')
        .insert({
          code: discountCode,
          description: 'Loyalty reward discount',
          discount_type: 'fixed_amount',
          discount_value: 5.00,
          usage_limit: 1,
          per_customer_limit: 1,
          starts_at: new Date().toISOString(),
          ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          active: true
        });

    } else if (reward.type === 'physical') {
      fulfillmentInfo = {
        trackingNumber: null, // Will be updated when shipped
        estimatedDelivery: '10-14 business days from Seoul',
        instructions: 'Your Korean culture reward will be shipped from Seoul within 3 business days'
      };

    } else if (reward.type === 'digital' || reward.type === 'experience') {
      fulfillmentInfo = {
        accessCode: `KC${Date.now().toString().slice(-8)}`,
        instructions: reward.type === 'digital' ? 
          'Check your email for access instructions to your Korean language course' :
          'You will receive an email with virtual tour session details within 24 hours'
      };
    }

    // Update redemption with fulfillment info
    await supabase
      .from('reward_redemptions')
      .update({ fulfillment_data: fulfillmentInfo })
      .eq('id', redemption.id);

    // Send confirmation email (mock implementation)
    // TODO: Implement actual email service
    console.log(`Redemption confirmation email sent to ${user.email}`);

    return NextResponse.json({
      success: true,
      message: 'Reward redeemed successfully!',
      data: {
        redemptionId: redemption.id,
        pointsSpent: reward.pointsCost,
        remainingPoints: userProfile.points - reward.pointsCost,
        reward: {
          id: rewardId,
          name: reward.name,
          type: reward.type
        },
        fulfillment: fulfillmentInfo
      }
    });

  } catch (error) {
    console.error('Redeem Reward API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to redeem reward' },
      { status: 500 }
    );
  }
}