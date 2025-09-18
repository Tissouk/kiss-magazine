import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: postId } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get comments for the post
    const offset = (page - 1) * limit;
    
    const { data: comments, error } = await supabase
      .from('community_post_comments')
      .select(`
        *,
        users!inner (
          id,
          username,
          avatar_url,
          level,
          points
        ),
        parent_comment:parent_comment_id (
          id,
          users!inner (
            username
          )
        )
      `)
      .eq('post_id', postId)
      .eq('status', 'approved')
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Transform comments data
    const transformedComments = comments?.map(comment => ({
      id: comment.id,
      content: comment.content,
      likesCount: comment.likes_count,
      createdAt: comment.created_at,
      user: {
        id: comment.users.id,
        username: comment.users.username,
        avatar: comment.users.avatar_url,
        level: comment.users.level,
        points: comment.users.points
      },
      parentComment: comment.parent_comment ? {
        id: comment.parent_comment.id,
        username: comment.parent_comment.users.username
      } : null
    })) || [];

    return NextResponse.json({
      success: true,
      data: transformedComments,
      pagination: {
        page,
        limit,
        hasMore: comments?.length === limit
      }
    });

  } catch (error) {
    console.error('Get Comments API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: postId } = params;
    const body = await request.json();
    const { content, parentCommentId } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Comment content is required'
      }, { status: 400 });
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify post exists
    const { data: post, error: postError } = await supabase
      .from('community_posts')
      .select('id, user_id')
      .eq('id', postId)
      .eq('status', 'approved')
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Create comment
    const { data: comment, error: commentError } = await supabase
      .from('community_post_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        parent_comment_id: parentCommentId,
        content: content.trim(),
        status: 'approved' // Auto-approve comments for now
      })
      .select(`
        *,
        users!inner (
          username,
          avatar_url,
          level
        )
      `)
      .single();

    if (commentError) throw commentError;

    // Award points for commenting
    await supabase.rpc('award_points', {
      user_uuid: user.id,
      points_amount: 5,
      transaction_action: 'comment_created',
      transaction_description: 'Created comment on community post',
      reference_uuid: comment.id
    });

    // Award points to post owner if different user
    if (post.user_id !== user.id) {
      await supabase.rpc('award_points', {
        user_uuid: post.user_id,
        points_amount: 2,
        transaction_action: 'post_commented',
        transaction_description: 'Received comment on post',
        reference_uuid: postId
      });
    }

    // Transform response
    const transformedComment = {
      id: comment.id,
      content: comment.content,
      likesCount: comment.likes_count,
      createdAt: comment.created_at,
      user: {
        id: user.id,
        username: comment.users.username,
        avatar: comment.users.avatar_url,
        level: comment.users.level
      },
      parentComment: null
    };

    return NextResponse.json({
      success: true,
      message: 'Comment created successfully',
      data: transformedComment
    });

  } catch (error) {
    console.error('Create Comment API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}