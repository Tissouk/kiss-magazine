import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Get user points and transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type'); // 'earn' | 'redeem'

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's current points and level
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('points, level')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    // Get level progress
    const { data: levelProgress } = await supabase.rpc('get_user_level_progress', {
      user_uuid: user.id
    });

    // Get transactions with pagination
    let transactionQuery = supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (type) {
      transactionQuery = transactionQuery.eq('type', type);
    }

    const offset = (page - 1) * limit;
    transactionQuery = transactionQuery.range(offset, offset + limit - 1);

    const { data: transactions, error: transactionError } = await transactionQuery;
    if (transactionError) throw transactionError;

    // Get points summary for current month
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const { data: monthlyStats } = await supabase
      .from('loyalty_transactions')
      .select('points, type')
      .eq('user_id', user.id)
      .gte('created_at', `${currentMonth}-01`)
      .lt('created_at', `${currentMonth}-32`);

    const monthlyEarned = monthlyStats?.filter(t => t.type === 'earn').reduce((sum, t) => sum + t.points, 0) || 0;
    const monthlySpent = monthlyStats?.filter(t => t.type === 'redeem').reduce((sum, t) => sum + t.points, 0) || 0;

    return NextResponse.json({
      success: true,
      data: {
        currentPoints: userProfile.points,
        currentLevel: userProfile.level,
        levelProgress: levelProgress?.[0] || null,
        monthlyStats: {
          earned: monthlyEarned,
          spent: monthlySpent,
          net: monthlyEarned - monthlySpent
        },
        transactions: transactions?.map(t => ({
          id: t.id,
          points: t.points,
          type: t.type,
          action: t.action,
          description: t.description,
          createdAt: t.created_at
        })) || []
      },
      pagination: {
        page,
        limit,
        hasMore: transactions?.length === limit
      }
    });

  } catch (error) {
    console.error('Loyalty Points API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch loyalty data' },
      { status: 500 }
    );
  }
}

// Manual points award (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, points, action, description, referenceId } = body;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // TODO: Add proper admin role check
    // For now, check if user is awarding points to themselves (not allowed)
    if (userId === user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot award points to yourself' },
        { status: 400 }
      );
    }

    if (!userId || !points || !action) {
      return NextResponse.json({
        success: false,
        error: 'User ID, points, and action are required'
      }, { status: 400 });
    }

    // Award points
    const { data: success, error: awardError } = await supabase.rpc('award_points', {
      user_uuid: userId,
      points_amount: points,
      transaction_action: action,
      transaction_description: description || `Manual points award by admin`,
      reference_uuid: referenceId
    });

    if (awardError || !success) {
      throw awardError || new Error('Failed to award points');
    }

    return NextResponse.json({
      success: true,
      message: `Successfully awarded ${points} points`,
      data: { points, action, userId }
    });

  } catch (error) {
    console.error('Award Points API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to award points' },
      { status: 500 }
    );
  }
}