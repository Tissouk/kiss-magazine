import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth(request);
    if (!isAdmin.success) {
      return NextResponse.json(isAdmin.error, { status: 401 });
    }

    // Get comprehensive system statistics
    const [
      userStats,
      contentStats,
      orderStats,
      loyaltyStats,
      koreanCultureStats
    ] = await Promise.all([
      getUserStatistics(),
      getContentStatistics(),
      getOrderStatistics(),
      getLoyaltyStatistics(),
      getKoreanCultureStatistics()
    ]);

    // System health metrics
    const systemHealth = await getSystemHealth();

    return NextResponse.json({
      success: true,
      data: {
        users: userStats,
        content: contentStats,
        orders: orderStats,
        loyalty: loyaltyStats,
        koreanCulture: koreanCultureStats,
        systemHealth
      },
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('System Stats API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch system statistics' },
      { status: 500 }
    );
  }
}

async function getUserStatistics() {
  // Total users and growth
  const { data: totalUsers } = await supabase
    .from('users')
    .select('id, created_at, level, korean_language_learner, country_code')
    .order('created_at', { ascending: false });

  const now = new Date();
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const newUsersThisMonth = totalUsers?.filter(u => 
    new Date(u.created_at) > lastMonth).length || 0;
  
  const newUsersThisWeek = totalUsers?.filter(u => 
    new Date(u.created_at) > lastWeek).length || 0;

  // Level distribution
  const levelDistribution = (totalUsers || []).reduce((acc, user) => {
    acc[user.level] = (acc[user.level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Korean language learners
  const koreanLearners = totalUsers?.filter(u => u.korean_language_learner).length || 0;

  // Top countries
  const countryDistribution = (totalUsers || []).reduce((acc, user) => {
    const country = user.country_code || 'Unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCountries = Object.entries(countryDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([country, count]) => ({ country, count }));

  return {
    total: totalUsers?.length || 0,
    newThisMonth: newUsersThisMonth,
    newThisWeek: newUsersThisWeek,
    koreanLearners,
    koreanLearnerPercentage: totalUsers?.length > 0 ? 
      ((koreanLearners / totalUsers.length) * 100).toFixed(1) : '0',
    levelDistribution,
    topCountries
  };
}

async function getContentStatistics() {
  // Articles
  const { data: articles } = await supabase
    .from('articles')
    .select('status, category, views_count, created_at');

  // Community posts
  const { data: posts } = await supabase
    .from('community_posts')
    .select('status, korea_trip_verified, likes_count, comments_count, created_at');

  // Product reviews
  const { data: reviews } = await supabase
    .from('product_reviews')
    .select('status, rating, created_at');

  const now = new Date();
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Articles stats
  const totalArticles = articles?.length || 0;
  const publishedArticles = articles?.filter(a => a.status === 'approved').length || 0;
  const pendingArticles = articles?.filter(a => a.status === 'pending').length || 0;
  const totalViews = articles?.reduce((sum, a) => sum + (a.views_count || 0), 0) || 0;

  // Posts stats
  const totalPosts = posts?.length || 0;
  const approvedPosts = posts?.filter(p => p.status === 'approved').length || 0;
  const koreaVerifiedPosts = posts?.filter(p => p.korea_trip_verified).length || 0;
  const newPostsThisMonth = posts?.filter(p => 
    new Date(p.created_at) > lastMonth).length || 0;

  // Reviews stats
  const totalReviews = reviews?.length || 0;
  const approvedReviews = reviews?.filter(r => r.status === 'approved').length || 0;
  const averageRating = reviews?.length > 0 ? 
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return {
    articles: {
      total: totalArticles,
      published: publishedArticles,
      pending: pendingArticles,
      totalViews,
      averageViews: totalArticles > 0 ? Math.round(totalViews / totalArticles) : 0
    },
    posts: {
      total: totalPosts,
      approved: approvedPosts,
      koreaVerified: koreaVerifiedPosts,
      newThisMonth: newPostsThisMonth,
      verificationRate: totalPosts > 0 ? 
        ((koreaVerifiedPosts / totalPosts) * 100).toFixed(1) : '0'
    },
    reviews: {
      total: totalReviews,
      approved: approvedReviews,
      averageRating: averageRating.toFixed(1)
    }
  };
}

async function getOrderStatistics() {
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      total_amount,
      status,
      created_at,
      shipping_country,
      order_line_items!left (
        total_price,
        products!left (
          is_korean_brand
        )
      )
    `);

  const now = new Date();
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const totalOrders = orders?.length || 0;
  const completedOrders = orders?.filter(o => o.status === 'delivered').length || 0;
  const totalRevenue = orders?.reduce((sum, o) => sum + o.total_amount, 0) || 0;
  const ordersThisMonth = orders?.filter(o => 
    new Date(o.created_at) > lastMonth).length || 0;
  const revenueThisMonth = orders?.filter(o => 
    new Date(o.created_at) > lastMonth)
    .reduce((sum, o) => sum + o.total_amount, 0) || 0;

  // Korean product revenue
  const koreanProductRevenue = orders?.reduce((sum, order) => {
    const koreanItemsValue = order.order_line_items?.reduce((itemSum: number, item: any) => {
      return itemSum + (item.products?.is_korean_brand ? item.total_price : 0);
    }, 0) || 0;
    return sum + koreanItemsValue;
  }, 0) || 0;

  // Average order value
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Top shipping countries
  const countryDistribution = (orders || []).reduce((acc, order) => {
    const country = order.shipping_country || 'Unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topShippingCountries = Object.entries(countryDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([country, count]) => ({ country, count }));

  return {
    total: totalOrders,
    completed: completedOrders,
    totalRevenue,
    averageOrderValue,
    ordersThisMonth,
    revenueThisMonth,
    koreanProductRevenue,
    koreanProductPercentage: totalRevenue > 0 ? 
      ((koreanProductRevenue / totalRevenue) * 100).toFixed(1) : '0',
    completionRate: totalOrders > 0 ? 
      ((completedOrders / totalOrders) * 100).toFixed(1) : '0',
    topShippingCountries
  };
}

async function getLoyaltyStatistics() {
  const { data: transactions } = await supabase
    .from('loyalty_transactions')
    .select('points, type, action, created_at');

  const { data: raffleEntries } = await supabase
    .from('raffle_entries')
    .select('tickets_count, raffle_month');

  const { data: redemptions } = await supabase
    .from('reward_redemptions')
    .select('points_cost, reward_type, created_at');

  const totalPointsEarned = transactions?.filter(t => t.type === 'earn')
    .reduce((sum, t) => sum + t.points, 0) || 0;

  const totalPointsSpent = transactions?.filter(t => t.type === 'redeem')
    .reduce((sum, t) => sum + t.points, 0) || 0;

  const totalRedemptions = redemptions?.length || 0;
  const totalRaffleTickets = raffleEntries?.reduce((sum, entry) => sum + entry.tickets_count, 0) || 0;

  // Current month raffle
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthTickets = raffleEntries?.filter(e => e.raffle_month === currentMonth)
    .reduce((sum, entry) => sum + entry.tickets_count, 0) || 0;

  return {
    totalPointsEarned,
    totalPointsSpent,
    pointsInCirculation: totalPointsEarned - totalPointsSpent,
    totalRedemptions,
    totalRaffleTickets,
    currentMonthRaffleTickets: currentMonthTickets
  };
}

async function getKoreanCultureStatistics() {
  // Korean brands
  const { data: koreanBrands } = await supabase
    .from('korean_brands')
    .select('verified');

  // Korean products
  const { data: koreanProducts } = await supabase
    .from('products')
    .select('published')
    .eq('is_korean_brand', true);

  // Korean language learners engagement
  const { data: learnersPosts } = await supabase
    .from('community_posts')
    .select(`
      users!inner (
        korean_language_learner
      )
    `)
    .eq('users.korean_language_learner', true)
    .eq('status', 'approved');

  const totalKoreanBrands = koreanBrands?.length || 0;
  const verifiedKoreanBrands = koreanBrands?.filter(b => b.verified).length || 0;
  const publishedKoreanProducts = koreanProducts?.filter(p => p.published).length || 0;
  const learnerPosts = learnersPosts?.length || 0;

  return {
    totalKoreanBrands,
    verifiedKoreanBrands,
    brandVerificationRate: totalKoreanBrands > 0 ? 
      ((verifiedKoreanBrands / totalKoreanBrands) * 100).toFixed(1) : '0',
    publishedKoreanProducts,
    koreanLearnerPosts: learnerPosts
  };
}

async function getSystemHealth() {
  // Database connection and basic health checks
  const dbHealthCheck = await supabase
    .from('users')
    .select('id')
    .limit(1);

  const isDbHealthy = !dbHealthCheck.error;

  // Recent error rates (mock - in real app, integrate with monitoring)
  const errorRate = '0.1%';
  const uptime = '99.9%';
  const responseTime = '125ms';

  return {
    database: isDbHealthy ? 'healthy' : 'unhealthy',
    errorRate,
    uptime,
    averageResponseTime: responseTime,
    lastHealthCheck: new Date().toISOString()
  };
}