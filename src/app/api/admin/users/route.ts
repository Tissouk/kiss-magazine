import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Get all users for admin management
export async function GET(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth(request);
    if (!isAdmin.success) {
      return NextResponse.json(isAdmin.error, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const level = searchParams.get('level');
    const country = searchParams.get('country');
    const search = searchParams.get('search');
    const koreanLearner = searchParams.get('korean_learner');
    const bannedOnly = searchParams.get('banned_only') === 'true';

    // Build query
    let query = supabase
      .from('users')
      .select(`
        *,
        user_badges!left (
          name,
          icon,
          earned_at
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (level) {
      query = query.eq('level', level);
    }

    if (country) {
      query = query.eq('country_code', country);
    }

    if (koreanLearner !== null) {
      query = query.eq('korean_language_learner', koreanLearner === 'true');
    }

    if (bannedOnly) {
      query = query.not('banned_until', 'is', null);
    }

    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: users, error } = await query;
    if (error) throw error;

    // Get additional user stats
    const usersWithStats = await Promise.all(
      (users || []).map(async (user) => {
        // Get user stats
        const { data: stats } = await supabase.rpc('get_user_community_stats', {
          user_uuid: user.id
        });

        // Get recent activity
        const { data: recentActivity } = await supabase
          .from('loyalty_transactions')
          .select('created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        return {
          ...user,
          stats: stats?.[0] || {
            total_posts: 0,
            total_likes: 0,
            total_comments: 0,
            korea_verified_posts: 0
          },
          lastActivity: recentActivity?.[0]?.created_at || null,
          badges: user.user_badges || []
        };
      })
    );

    // Get total count
    let countQuery = supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (level) countQuery = countQuery.eq('level', level);
    if (country) countQuery = countQuery.eq('country_code', country);
    if (koreanLearner !== null) countQuery = countQuery.eq('korean_language_learner', koreanLearner === 'true');
    if (bannedOnly) countQuery = countQuery.not('banned_until', 'is', null);
    if (search) countQuery = countQuery.or(`username.ilike.%${search}%,email.ilike.%${search}%`);

    const { count } = await countQuery;

    return NextResponse.json({
      success: true,
      data: usersWithStats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Admin Users API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}