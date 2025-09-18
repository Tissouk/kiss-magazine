import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get post with detailed information
    const { data: post, error } = await supabase
      .from('community_posts')
      .select(`
        *,
        users!inner (
          id,
          username,
          avatar_url,
          level,
          points,
          user_badges (
            name,
            icon,
            earned_at
          )
        ),
        community_post_tags (
          tag_name
        ),
        community_post_comments (
          id,
          content,
          likes_count,
          created_at,
          users!inner (
            username,
            avatar_url,
            level
          )
        )
      `)
      .eq('id', id)
      .eq('status', 'approved')
      .single();

    if (error || !post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Transform post data
    const transformedPost = {
      id: post.id,
      content: post.content,
      images: post.image_urls || [],
      location: post.location,
      likesCount: post.likes_count,
      commentsCount: post.comments_count,
      pointsAwarded: post.points_awarded,
      koreaVerified: post.korea_trip_verified,
      createdAt: post.created_at,
      user: {
        id: post.users.id,
        username: post.users.username,
        avatar: post.users.avatar_url,
        level: post.users.level,
        points: post.users.points,
        badges: post.users.user_badges || []
      },
      tags: post.community_post_tags?.map((t: any) => t.tag_name) || [],
      comments: post.community_post_comments?.map((comment: any) => ({
        id: comment.id,
        content: comment.content,
        likesCount: comment.likes_count,
        createdAt: comment.created_at,
        user: {
          username: comment.users.username,
          avatar: comment.users.avatar_url,
          level: comment.users.level
        }
      })) || []
    };

    return NextResponse.json({
      success: true,
      data: transformedPost
    });

  } catch (error) {
    console.error('Get Post API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user owns the post
    const { data: post, error: postError } = await supabase
      .from('community_posts')
      .select('user_id')
      .eq('id', id)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    if (post.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Not authorized to delete this post' },
        { status: 403 }
      );
    }

    // Delete post (cascade will handle related data)
    const { error: deleteError } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Delete Post API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}