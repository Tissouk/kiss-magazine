import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Get all orders for admin management
export async function GET(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth(request);
    if (!isAdmin.success) {
      return NextResponse.json(isAdmin.error, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('payment_status');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const search = searchParams.get('search'); // order number or email
    const koreanProducts = searchParams.get('korean_products') === 'true';

    // Build query
    let query = supabase
      .from('orders')
      .select(`
        *,
        users (
          username,
          email,
          country_code
        ),
        order_line_items!left (
          *,
          products!left (
            name,
            is_korean_brand,
            korean_brands (
              name
            )
          )
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (paymentStatus) {
      query = query.eq('payment_status', paymentStatus);
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    if (search) {
      query = query.or(`order_number.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: orders, error } = await query;
    if (error) throw error;

    // Filter for Korean products if requested
    let filteredOrders = orders;
    if (koreanProducts) {
      filteredOrders = orders?.filter(order => 
        order.order_line_items?.some((item: any) => item.products?.is_korean_brand)
      );
    }

    // Transform orders with Korean product info
    const transformedOrders = filteredOrders?.map(order => ({
      ...order,
      customer: order.users ? {
        username: order.users.username,
        email: order.users.email,
        country: order.users.country_code
      } : {
        email: order.email,
        guest: true
      },
      items: order.order_line_items?.map((item: any) => ({
        ...item,
        productName: item.products?.name || item.product_title,
        isKoreanBrand: item.products?.is_korean_brand || false,
        koreanBrandName: item.products?.korean_brands?.name || null
      })) || [],
      koreanProductsCount: order.order_line_items?.filter((item: any) => 
        item.products?.is_korean_brand
      ).length || 0,
      totalItems: order.order_line_items?.reduce((sum: number, item: any) => 
        sum + item.quantity, 0) || 0
    }));

    // Get total count
    let countQuery = supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (status) countQuery = countQuery.eq('status', status);
    if (paymentStatus) countQuery = countQuery.eq('payment_status', paymentStatus);
    if (dateFrom) countQuery = countQuery.gte('created_at', dateFrom);
    if (dateTo) countQuery = countQuery.lte('created_at', dateTo);
    if (search) countQuery = countQuery.or(`order_number.ilike.%${search}%,email.ilike.%${search}%`);

    const { count } = await countQuery;

    // Get order statistics
    const stats = await getOrderStatistics();

    return NextResponse.json({
      success: true,
      data: transformedOrders,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      stats
    });

  } catch (error) {
    console.error('Admin Orders API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

async function getOrderStatistics() {
  const { data: stats } = await supabase.rpc('get_order_statistics');
  
  return stats?.[0] || {
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
    koreanProductRevenue: 0,
    averageOrderValue: 0
  };
}