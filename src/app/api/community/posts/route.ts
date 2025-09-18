import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

// Get community posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category'); // 'k-fashion', 'k-beauty', etc.
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const userId = searchParams.get('user_id');
    const tag = searchParams.get('tag');
    const verified = searchParams.get('verified') === 'true';

    // Build query for approved posts
    let query = supabase
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
        community_post_likes!left (
          user_id
        )
      `)
      .eq('status', 'approved')
      .order(sortBy, { ascending: false });

    // Apply filters
    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (verified) {
      query = query.eq('korea_trip_verified', true);
    }

    if (tag) {
      query = query.contains('community_post_tags.tag_name', [tag]);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: posts, error } = await query;

    if (error) throw error;

    // Get current user to check if they liked posts
    const cookieStore = cookies();
    const authToken = cookieStore.get('sb-access-token')?.value;
    let currentUserId = null;
    
    if (authToken) {
      const { data: { user } } = await supabase.auth.getUser(authToken);
      currentUserId = user?.id;
    }

    // Transform posts data
    const transformedPosts = posts?.map(post => ({
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
        badges: post.users.user_badges?.slice(0, 3) || []
      },
      tags: post.community_post_tags?.map((t: any) => t.tag_name) || [],
      isLiked: currentUserId ? 
        post.community_post_likes?.some((like: any) => like.user_id === currentUserId) : 
        false
    })) || [];

    // Get total count for pagination
    let countQuery = supabase
      .from('community_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    if (userId) countQuery = countQuery.eq('user_id', userId);
    if (verified) countQuery = countQuery.eq('korea_trip_verified', true);

    const { count } = await countQuery;

    return NextResponse.json({
      success: true,
      data: transformedPosts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Community Posts API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// Create new community post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, images = [], location, tags = [] } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Content is required'
      }, { status: 400 });
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    // Calculate points for this post
    let pointsToAward = 25; // Base points for post
    if (images.length === 1) pointsToAward = 50;
    if (images.length > 1) pointsToAward = 75;
    if (location && location.toLowerCase().includes('korea')) pointsToAward += 25;

    // Create post
    const { data: post, error: postError } = await supabase
      .from('community_posts')
      .insert({
        user_id: user.id,
        content: content.trim(),
        image_urls: images,
        location,
        points_awarded: pointsToAward,
        status: 'pending' // Requires moderation
      })
      .select()
      .single();

    if (postError) throw postError;

    // Add tags
    if (tags.length > 0) {
      const tagInserts = tags.map((tag: string) => ({
        post_id: post.id,
        tag_name: tag.toLowerCase().replace(/[^a-z0-9-]/g, '')
      }));

      await supabase
        .from('community_post_tags')
        .insert(tagInserts);
    }

    // Award points to user (will be processed after approval)
    await supabase.rpc('award_points', {
      user_uuid: user.id,
      points_amount: pointsToAward,
      transaction_action: 'community_post',
      transaction_description: 'Created community post',
      reference_uuid: post.id
    });

    // Add to moderation queue
    await supabase
      .from('moderation_queue')
      .insert({
        content_type: 'post',
        content_id: post.id,
        priority: images.length > 0 ? 2 : 1, // Higher priority for image posts
        flagged_reason: 'new_content'
      });

    return NextResponse.json({
      success: true,
      message: 'Post created and submitted for review',
      data: {
        id: post.id,
        pointsAwarded: pointsToAward,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('Create Post API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create post' },
      { status: 500 }
    );
  }
}