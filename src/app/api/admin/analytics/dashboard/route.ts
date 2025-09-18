import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth(request);
    if (!isAdmin.success) {
      return NextResponse.json(isAdmin.error, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '30d';
    const compareWith = searchParams.get('compare_with'); // previous period

    // Calculate date ranges
    const { startDate, endDate, compareStartDate, compareEndDate } = getDateRanges(timeframe);

    // Get comprehensive analytics
    const [
      salesMetrics,
      koreanCultureMetrics,
      communityMetrics,
      loyaltyMetrics,
      trafficMetrics,
      productMetrics
    ] = await Promise.all([
      getSalesMetrics(startDate, endDate, compareStartDate, compareEndDate),
      getKoreanCultureMetrics(startDate, endDate),
      getCommunityMetrics(startDate, endDate),
      getLoyaltyMetrics(startDate, endDate),
      getTrafficMetrics(startDate, endDate),
      getProductMetrics(startDate, endDate)
    ]);

    // Calculate growth rates if comparing
    const growthRates = compareWith ? calculateGrowthRates(salesMetrics) : null;

    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        metrics: {
          sales: salesMetrics,
          koreanCulture: koreanCultureMetrics,
          community: communityMetrics,
          loyalty: loyaltyMetrics,
          traffic: trafficMetrics,
          products: productMetrics
        },
        growthRates,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Analytics Dashboard API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

function getDateRanges(timeframe: string) {
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

  const endDate = new Date(now);
  const compareStartDate = new Date(startDate);
  const compareEndDate = new Date(startDate);
  
  // Calculate comparison period (same duration, previous period)
  const duration = endDate.getTime() - startDate.getTime();
  compareStartDate.setTime(startDate.getTime() - duration);
  compareEndDate.setTime(startDate.getTime());

  return { startDate, endDate, compareStartDate, compareEndDate };
}

async function getSalesMetrics(startDate: Date, endDate: Date, compareStartDate?: Date, compareEndDate?: Date) {
  // Current period sales
  const { data: currentSales } = await supabase
    .from('orders')
    .select(`
      total_amount,
      currency,
      created_at,
      status,
      order_line_items!left (
        total_price,
        products!left (
          is_korean_brand
        )
      )
    `)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .in('status', ['processing', 'shipped', 'delivered']);

  // Previous period for comparison
  let previousSales = null;
  if (compareStartDate && compareEndDate) {
    const { data } = await supabase
      .from('orders')
      .select('total_amount, currency')
      .gte('created_at', compareStartDate.toISOString())
      .lte('created_at', compareEndDate.toISOString())
      .in('status', ['processing', 'shipped', 'delivered']);
    previousSales = data;
  }

  // Calculate metrics
  const totalRevenue = currentSales?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
  const totalOrders = currentSales?.length || 0;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Korean products revenue
  const koreanProductRevenue = currentSales?.reduce((sum, order) => {
    const koreanItemsValue = order.order_line_items?.reduce((itemSum: number, item: any) => {
      return itemSum + (item.products?.is_korean_brand ? item.total_price : 0);
    }, 0) || 0;
    return sum + koreanItemsValue;
  }, 0) || 0;

  const koreanProductPercentage = totalRevenue > 0 ? (koreanProductRevenue / totalRevenue) * 100 : 0;

  // Previous period comparison
  const previousRevenue = previousSales?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
  const previousOrders = previousSales?.length || 0;

  return {
    current: {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      koreanProductRevenue,
      koreanProductPercentage: koreanProductPercentage.toFixed(1)
    },
    previous: {
      totalRevenue: previousRevenue,
      totalOrders: previousOrders,
      averageOrderValue: previousOrders > 0 ? previousRevenue / previousOrders : 0
    },
    chartData: generateSalesChartData(currentSales || [])
  };
}

async function getKoreanCultureMetrics(startDate: Date, endDate: Date) {
  // Community posts with Korean culture focus
  const { data: posts } = await supabase
    .from('community_posts')
    .select(`
      id,
      korea_trip_verified,
      likes_count,
      comments_count,
      community_post_tags!left (
        tag_name
      )
    `)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .eq('status', 'approved');

  // Korean language learners
  const { data: learners } = await supabase
    .from('users')
    .select('id')
    .eq('korean_language_learner', true)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  // Korea trip verified posts
  const koreaVerifiedPosts = posts?.filter(p => p.korea_trip_verified) || [];
  
  // Korean culture tags
  const koreanTags = posts?.flatMap(p => 
    p.community_post_tags?.filter((tag: any) => 
      tag.tag_name.includes('korea') || 
      tag.tag_name.includes('k-') || 
      tag.tag_name.includes('korean')
    ) || []
  ) || [];

  const totalEngagement = posts?.reduce((sum, post) => 
    sum + post.likes_count + post.comments_count, 0) || 0;

  return {
    totalCommunityPosts: posts?.length || 0,
    koreaVerifiedPosts: koreaVerifiedPosts.length,
    koreanCultureTags: koreanTags.length,
    newKoreanLanguageLearners: learners?.length || 0,
    totalEngagement,
    verificationRate: posts?.length > 0 ? 
      ((koreaVerifiedPosts.length / posts.length) * 100).toFixed(1) : '0',
    topKoreanTags: getTopKoreanTags(posts || [])
  };
}

async function getCommunityMetrics(startDate: Date, endDate: Date) {
  // User registrations
  const { data: newUsers } = await supabase
    .from('users')
    .select('id, country_code, korean_language_learner')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  // Community engagement
  const { data: engagement } = await supabase
    .from('community_posts')
    .select('likes_count, comments_count')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .eq('status', 'approved');

  // Country distribution
  const countryDistribution = (newUsers || []).reduce((acc, user) => {
    const country = user.country_code || 'Unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalLikes = engagement?.reduce((sum, post) => sum + post.likes_count, 0) || 0;
  const totalComments = engagement?.reduce((sum, post) => sum + post.comments_count, 0) || 0;

  return {
    newUsers: newUsers?.length || 0,
    koreanLanguageLearners: newUsers?.filter(u => u.korean_language_learner).length || 0,
    totalLikes,
    totalComments,
    engagementRate: engagement?.length > 0 ? 
      ((totalLikes + totalComments) / engagement.length).toFixed(1) : '0',
    topCountries: Object.entries(countryDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([country, count]) => ({ country, count }))
  };
}

async function getLoyaltyMetrics(startDate: Date, endDate: Date) {
  // Points transactions
  const { data: transactions } = await supabase
    .from('loyalty_transactions')
    .select('points, type, action')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  // Raffle entries
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { data: raffleEntries } = await supabase
    .from('raffle_entries')
    .select('tickets_count')
    .eq('raffle_month', currentMonth);

  // Reward redemptions
  const { data: redemptions } = await supabase
    .from('reward_redemptions')
    .select('points_cost, reward_type')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  const pointsEarned = transactions?.filter(t => t.type === 'earn')
    .reduce((sum, t) => sum + t.points, 0) || 0;
  
  const pointsSpent = transactions?.filter(t => t.type === 'redeem')
    .reduce((sum, t) => sum + t.points, 0) || 0;

  const totalRaffleTickets = raffleEntries?.reduce((sum, entry) => sum + entry.tickets_count, 0) || 0;

  return {
    pointsEarned,
    pointsSpent,
    netPoints: pointsEarned - pointsSpent,
    totalRedemptions: redemptions?.length || 0,
    raffleParticipants: raffleEntries?.length || 0,
    totalRaffleTickets,
    topEarningActions: getTopPointActions(transactions || []),
    redemptionsByType: getRedemptionsByType(redemptions || [])
  };
}

async function getTrafficMetrics(startDate: Date, endDate: Date) {
  // Search analytics
  const { data: searches } = await supabase
    .from('search_analytics')
    .select('query, results_count, clicked_product_id')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  const totalSearches = searches?.length || 0;
  const successfulSearches = searches?.filter(s => s.results_count > 0).length || 0;
  const clickedSearches = searches?.filter(s => s.clicked_product_id).length || 0;

  return {
    totalSearches,
    searchSuccessRate: totalSearches > 0 ? 
      ((successfulSearches / totalSearches) * 100).toFixed(1) : '0',
    searchClickRate: totalSearches > 0 ? 
      ((clickedSearches / totalSearches) * 100).toFixed(1) : '0',
    topSearchTerms: getTopSearchTerms(searches || [])
  };
}

async function getProductMetrics(startDate: Date, endDate: Date) {
  // Best selling products
  const { data: orderItems } = await supabase
    .from('order_line_items')
    .select(`
      quantity,
      total_price,
      products!left (
        name,
        is_korean_brand,
        korean_brands (
          name
        )
      ),
      orders!left (
        created_at,
        status
      )
    `)
    .gte('orders.created_at', startDate.toISOString())
    .lte('orders.created_at', endDate.toISOString())
    .in('orders.status', ['processing', 'shipped', 'delivered']);

  // Group by product
  const productSales = (orderItems || []).reduce((acc, item) => {
    const productName = item.products?.name || 'Unknown Product';
    if (!acc[productName]) {
      acc[productName] = {
        name: productName,
        quantity: 0,
        revenue: 0,
        isKoreanBrand: item.products?.is_korean_brand || false,
        koreanBrandName: item.products?.korean_brands?.name
      };
    }
    acc[productName].quantity += item.quantity;
    acc[productName].revenue += item.total_price;
    return acc;
  }, {} as Record<string, any>);

  const bestSellers = Object.values(productSales)
    .sort((a: any, b: any) => b.quantity - a.quantity)
    .slice(0, 10);

  const koreanProductSales = Object.values(productSales)
    .filter((p: any) => p.isKoreanBrand)
    .reduce((sum, p: any) => sum + p.revenue, 0);

  const totalProductRevenue = Object.values(productSales)
    .reduce((sum, p: any) => sum + p.revenue, 0);

  return {
    bestSellers,
    koreanProductShare: totalProductRevenue > 0 ? 
      ((koreanProductSales / totalProductRevenue) * 100).toFixed(1) : '0',
    totalProductsSold: Object.values(productSales)
      .reduce((sum, p: any) => sum + p.quantity, 0),
    uniqueProductsSold: Object.keys(productSales).length
  };
}

// Helper functions
function generateSalesChartData(orders: any[]) {
  const dailySales = orders.reduce((acc, order) => {
    const date = order.created_at.split('T')[0];
    if (!acc[date]) {
      acc[date] = { revenue: 0, orders: 0 };
    }
    acc[date].revenue += order.total_amount;
    acc[date].orders += 1;
    return acc;
  }, {} as Record<string, any>);

  return Object.entries(dailySales)
    .map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function getTopKoreanTags(posts: any[]) {
  const tagCounts = posts.flatMap(p => p.community_post_tags || [])
    .filter((tag: any) => 
      tag.tag_name.includes('korea') || 
      tag.tag_name.includes('k-') || 
      tag.tag_name.includes('korean')
    )
    .reduce((acc, tag: any) => {
      acc[tag.tag_name] = (acc[tag.tag_name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  return Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));
}

function getTopPointActions(transactions: any[]) {
  const actionCounts = transactions
    .filter(t => t.type === 'earn')
    .reduce((acc, t) => {
      acc[t.action] = (acc[t.action] || 0) + t.points;
      return acc;
    }, {} as Record<string, number>);

  return Object.entries(actionCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([action, points]) => ({ action, points }));
}

function getRedemptionsByType(redemptions: any[]) {
  return redemptions.reduce((acc, redemption) => {
    acc[redemption.reward_type] = (acc[redemption.reward_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

function getTopSearchTerms(searches: any[]) {
  const termCounts = searches.reduce((acc, search) => {
    const term = search.query.toLowerCase();
    acc[term] = (acc[term] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(termCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([term, count]) => ({ term, count }));
}

function calculateGrowthRates(salesMetrics: any) {
  const { current, previous } = salesMetrics;
  
  return {
    revenueGrowth: previous.totalRevenue > 0 ? 
      (((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100).toFixed(1) : '0',
    orderGrowth: previous.totalOrders > 0 ? 
      (((current.totalOrders - previous.totalOrders) / previous.totalOrders) * 100).toFixed(1) : '0',
    aovGrowth: previous.averageOrderValue > 0 ? 
      (((current.averageOrderValue - previous.averageOrderValue) / previous.averageOrderValue) * 100).toFixed(1) : '0'
  };
}