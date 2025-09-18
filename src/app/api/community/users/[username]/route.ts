import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;

    // Get user profile with stats
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        user_badges (
          name,
          icon,
          description,
          earned_at
        )
      `)
      .eq('username', username)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's community stats
    const { data: stats } = await supabase.rpc('get_user_community_stats', {
      user_uuid: user.id
    });

    // Get recent posts
    const { data: recentPosts } = await supabase
      .from('community_posts')
      .select(`
        id,
        content,
        image_urls,
        location,
        likes_count,
        comments_count,
        points_awarded,
        korea_trip_verified,
        created_at,
        community_post_tags (
          tag_name
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(6);

    // Get level progress
    const { data: levelProgress } = await supabase.rpc('get_user_level_progress', {
      user_uuid: user.id
    });

    // Transform user data
    const transformedUser = {
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      avatar: user.avatar_url,
      points: user.points,
      level: user.level,
      koreanLanguageLearner: user.korean_language_learner,
      preferredLanguage: user.preferred_language,
      country: user.country_code,
      joinedAt: user.created_at,
      badges: user.user_badges || [],
      stats: stats?.[0] || {
        totalPosts: 0,
        totalLikes: 0,
        totalComments: 0,
        koreaVerifiedPosts: 0
      },
      levelProgress: levelProgress?.[0] || null,
      recentPosts: recentPosts?.map(post => ({
        id: post.id,
        content: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
        imageCount: post.image_urls?.length || 0,
        location: post.location,
        likesCount: post.likes_count,
        commentsCount: post.comments_count,
        pointsAwarded: post.points_awarded,
        koreaVerified: post.korea_trip_verified,
        createdAt: post.created_at,
        tags: post.community_post_tags?.map((t: any) => t.tag_name) || []
      })) || []
    };

    return NextResponse.json({
      success: true,
      data: transformedUser
    });

  } catch (error) {
    console.error('User Profile API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}