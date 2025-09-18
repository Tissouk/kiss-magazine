import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: postId } = params;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('community_post_likes')
      .select('*')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .single();

    if (existingLike) {
      return NextResponse.json(
        { success: false, error: 'Post already liked' },
        { status: 400 }
      );
    }

    // Add like
    const { error: likeError } = await supabase
      .from('community_post_likes')
      .insert({
        user_id: user.id,
        post_id: postId
      });

    if (likeError) throw likeError;

    // Get post owner for points
    const { data: post } = await supabase
      .from('community_posts')
      .select('user_id, likes_count')
      .eq('id', postId)
      .single();

    if (post && post.user_id !== user.id) {
      // Award points to post owner for receiving likes
      await supabase.rpc('award_points', {
        user_uuid: post.user_id,
        points_amount: 1,
        transaction_action: 'post_liked',
        transaction_description: 'Received like on community post',
        reference_uuid: postId
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Post liked successfully',
      data: { liked: true }
    });

  } catch (error) {
    console.error('Like Post API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to like post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: postId } = params;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Remove like
    const { error } = await supabase
      .from('community_post_likes')
      .delete()
      .eq('user_id', user.id)
      .eq('post_id', postId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Like removed successfully',
      data: { liked: false }
    });

  } catch (error) {
    console.error('Unlike Post API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unlike post' },
      { status: 500 }
    );
  }
}