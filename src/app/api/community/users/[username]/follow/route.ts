import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Note: This requires a user_follows table that we'd add to our schema
export async function POST(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;

    // Get authenticated user
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !currentUser) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get target user
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (targetUser.id === currentUser.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot follow yourself' },
        { status: 400 }
      );
    }

    // Check if already following
    const { data: existingFollow } = await supabase
      .from('user_follows')
      .select('*')
      .eq('follower_id', currentUser.id)
      .eq('following_id', targetUser.id)
      .single();

    if (existingFollow) {
      return NextResponse.json(
        { success: false, error: 'Already following this user' },
        { status: 400 }
      );
    }

    // Create follow relationship
    const { error: followError } = await supabase
      .from('user_follows')
      .insert({
        follower_id: currentUser.id,
        following_id: targetUser.id
      });

    if (followError) throw followError;

    // Award points to both users
    await supabase.rpc('award_points', {
      user_uuid: currentUser.id,
      points_amount: 5,
      transaction_action: 'followed_user',
      transaction_description: `Started following @${username}`,
      reference_uuid: targetUser.id
    });

    await supabase.rpc('award_points', {
      user_uuid: targetUser.id,
      points_amount: 10,
      transaction_action: 'gained_follower',
      transaction_description: 'Gained a new follower',
      reference_uuid: currentUser.id
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully followed user',
      data: { following: true }
    });

  } catch (error) {
    console.error('Follow User API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to follow user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;

    // Get authenticated user
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !currentUser) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get target user
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove follow relationship
    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', currentUser.id)
      .eq('following_id', targetUser.id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Successfully unfollowed user',
      data: { following: false }
    });

  } catch (error) {
    console.error('Unfollow User API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unfollow user' },
      { status: 500 }
    );
  }
}