import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '30d'; // 7d, 30d, 90d, 1y
    const breakdown = searchParams.get('breakdown') || 'daily'; // daily, weekly, monthly

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Get points analytics data
    const { data: transactions, error } = await supabase
      .from('loyalty_transactions')
      .select('points, type, action, created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Process analytics
    const analytics = processPointsAnalytics(transactions || [], breakdown);
    
    // Get top earning actions
    const topActions = getTopEarningActions(transactions || []);
    
    // Get user level distribution
    const { data: levelDistribution, error: levelError } = await supabase
      .from('users')
      .select('level')
      .not('level', 'is', null);

    if (levelError) throw levelError;

    const levelCounts = (levelDistribution || []).reduce((acc, user) => {
      acc[user.level] = (acc[user.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get Korean culture engagement metrics
    const koreanCultureMetrics = await getKoreanCultureMetrics(startDate);

    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        breakdown,
        dateRange: {
          start: startDate.toISOString(),
          end: now.toISOString()
        },
        analytics,
        topActions,
        levelDistribution: levelCounts,
        koreanCultureMetrics,
        summary: {
          totalPointsEarned: analytics.totalEarned,
          totalPointsSpent: analytics.totalSpent,
          netPoints: analytics.totalEarned - analytics.totalSpent,
          activeUsers: analytics.activeUsers,
          averagePerUser: analytics.activeUsers > 0 ? Math.round(analytics.totalEarned / analytics.activeUsers) : 0
        }
      }
    });

  } catch (error) {
    console.error('Points Analytics API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

function processPointsAnalytics(transactions: any[], breakdown: string) {
  const groupedData = new Map();
  let totalEarned = 0;
  let totalSpent = 0;
  const activeUsers = new Set();

  transactions.forEach(transaction => {
    const date = new Date(transaction.created_at);
    let key = '';

    // Group by breakdown type
    if (breakdown === 'daily') {
      key = date.toISOString().split('T')[0];
    } else if (breakdown === 'weekly') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else if (breakdown === 'monthly') {
      key = date.toISOString().slice(0, 7); // YYYY-MM
    }

    if (!groupedData.has(key)) {
      groupedData.set(key, { earned: 0, spent: 0, users: new Set() });
    }

    const group = groupedData.get(key);
    if (transaction.type === 'earn') {
      group.earned += transaction.points;
      totalEarned += transaction.points;
    } else {
      group.spent += transaction.points;
      totalSpent += transaction.points;
    }
    
    group.users.add(transaction.user_id);
    activeUsers.add(transaction.user_id);
  });

  // Convert to array format
  const chartData = Array.from(groupedData.entries())
    .map(([date, data]) => ({
      date,
      earned: data.earned,
      spent: data.spent,
      net: data.earned - data.spent,
      activeUsers: data.users.size
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    chartData,
    totalEarned,
    totalSpent,
    activeUsers: activeUsers.size
  };
}

function getTopEarningActions(transactions: any[]) {
  const actionCounts = new Map();
  
  transactions
    .filter(t => t.type === 'earn')
    .forEach(transaction => {
      const action = transaction.action;
      if (!actionCounts.has(action)) {
        actionCounts.set(action, { count: 0, totalPoints: 0 });
      }
      const actionData = actionCounts.get(action);
      actionData.count += 1;
      actionData.totalPoints += transaction.points;
    });

  return Array.from(actionCounts.entries())
    .map(([action, data]) => ({
      action,
      count: data.count,
      totalPoints: data.totalPoints,
      averagePoints: Math.round(data.totalPoints / data.count)
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 10);
}

async function getKoreanCultureMetrics(startDate: Date) {
  // Get Korean culture engagement metrics
  const { data: posts } = await supabase
    .from('community_posts')
    .select('id, points_awarded, korea_trip_verified, created_at')
    .gte('created_at', startDate.toISOString())
    .eq('status', 'approved');

  const { data: koreanProducts } = await supabase
    .from('order_line_items')
    .select(`
      quantity,
      total_price,
      orders!inner (
        created_at
      ),
      products!inner (
        is_korean_brand
      )
    `)
    .gte('orders.created_at', startDate.toISOString())
    .eq('products.is_korean_brand', true);

  const koreanCulturePosts = posts?.filter(p => p.korea_trip_verified) || [];
  const totalKoreanSales = koreanProducts?.reduce((sum, item) => sum + item.total_price, 0) || 0;

  return {
    koreanCulturePosts: koreanCulturePosts.length,
    totalCommunityPosts: posts?.length || 0,
    koreanVerificationRate: posts?.length > 0 ? ((koreanCulturePosts.length / posts.length) * 100).toFixed(1) : '0',
    koreanProductSales: totalKoreanSales,
    koreanProductOrders: koreanProducts?.length || 0
  };
}