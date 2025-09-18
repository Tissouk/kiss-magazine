import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Get detailed user information
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await checkAdminAuth(request);
    if (!isAdmin.success) {
      return NextResponse.json(isAdmin.error, { status: 401 });
    }

    const { id } = params;

    // Get user with comprehensive data
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        user_badges (
          name,
          description,
          icon,
          earned_at
        )
      `)
      .eq('id', id)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user activity
    const [
      transactions,
      posts,
      orders,
      reviews,
      redemptions
    ] = await Promise.all([
      supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(20),
      
      supabase
        .from('community_posts')
        .select('id, content, status, likes_count, comments_count, korea_trip_verified, created_at')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(10),
      
      supabase
        .from('orders')
        .select('id, order_number, total_amount, status, created_at')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(10),
      
      supabase
        .from('product_reviews')
        .select('id, rating, title, status, created_at')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(10),
      
      supabase
        .from('reward_redemptions')
        .select('id, reward_name, points_cost, status, created_at')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(10)
    ]);

    // Calculate engagement score
    const { data: engagementScore } = await supabase.rpc('calculate_engagement_score', {
      user_uuid: id
    });

    const userData = {
      ...user,
      engagementScore: engagementScore || 0,
      activity: {
        transactions: transactions.data || [],
        posts: posts.data || [],
        orders: orders.data || [],
        reviews: reviews.data || [],
        redemptions: redemptions.data || []
      }
    };

    return NextResponse.json({
      success: true,
      data: userData
    });

  } catch (error) {
    console.error('Get User Details API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}

// Update user (admin actions)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await checkAdminAuth(request);
    if (!isAdmin.success) {
      return NextResponse.json(isAdmin.error, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const {
      action,
      banReason,
      banDuration, // in days
      points,
      level,
      notes
    } = body;

    const currentTime = new Date();

    switch (action) {
      case 'ban_user':
        const banUntil = new Date(currentTime.getTime() + (banDuration * 24 * 60 * 60 * 1000));
        
        const { error: banError } = await supabase
          .from('users')
          .update({
            banned_until: banUntil.toISOString(),
            updated_at: currentTime.toISOString()
          })
          .eq('id', id);

        if (banError) throw banError;

        // Log admin action
        await logAdminAction({
          adminId: isAdmin.user.id,
          action: 'ban_user',
          targetUserId: id,
          details: { reason: banReason, duration: banDuration },
          notes
        });

        return NextResponse.json({
          success: true,
          message: `User banned until ${banUntil.toISOString()}`
        });

      case 'unban_user':
        const { error: unbanError } = await supabase
          .from('users')
          .update({
            banned_until: null,
            updated_at: currentTime.toISOString()
          })
          .eq('id', id);

        if (unbanError) throw unbanError;

        await logAdminAction({
          adminId: isAdmin.user.id,
          action: 'unban_user',
          targetUserId: id,
          notes
        });

        return NextResponse.json({
          success: true,
          message: 'User unbanned successfully'
        });

      case 'adjust_points':
        const pointsAmount = parseInt(points);
        if (pointsAmount === 0) {
          return NextResponse.json({
            success: false,
            error: 'Points adjustment cannot be zero'
          }, { status: 400 });
        }

        const { data: success, error: pointsError } = await supabase.rpc(
          pointsAmount > 0 ? 'award_points' : 'redeem_points',
          {
            user_uuid: id,
            points_amount: Math.abs(pointsAmount),
            transaction_action: 'admin_adjustment',
            transaction_description: `Admin ${pointsAmount > 0 ? 'awarded' : 'deducted'} points: ${notes || 'No reason provided'}`,
            reference_uuid: null
          }
        );

        if (pointsError || !success) {
          throw pointsError || new Error('Points adjustment failed');
        }

        await logAdminAction({
          adminId: isAdmin.user.id,
          action: 'adjust_points',
          targetUserId: id,
          details: { pointsAdjustment: pointsAmount },
          notes
        });

        return NextResponse.json({
          success: true,
          message: `Points ${pointsAmount > 0 ? 'awarded' : 'deducted'} successfully`
        });

      case 'change_level':
        const { error: levelError } = await supabase
          .from('users')
          .update({
            level,
            updated_at: currentTime.toISOString()
          })
          .eq('id', id);

        if (levelError) throw levelError;

        await logAdminAction({
          adminId: isAdmin.user.id,
          action: 'change_level',
          targetUserId: id,
          details: { newLevel: level },
          notes
        });

        return NextResponse.json({
          success: true,
          message: `User level changed to ${level}`
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Update User API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

async function logAdminAction(actionData: {
  adminId: string;
  action: string;
  targetUserId: string;
  details?: any;
  notes?: string;
}) {
  // Log admin actions for audit trail
  await supabase
    .from('admin_action_logs')
    .insert({
      admin_id: actionData.adminId,
      action: actionData.action,
      target_user_id: actionData.targetUserId,
      details: actionData.details,
      notes: actionData.notes,
      created_at: new Date().toISOString()
    });
}