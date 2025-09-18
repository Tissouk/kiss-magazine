import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Bulk order operations
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth(request);
    if (!isAdmin.success) {
      return NextResponse.json(isAdmin.error, { status: 401 });
    }

    const body = await request.json();
    const { action, orderIds, data } = body;

    if (!action || !orderIds || !Array.isArray(orderIds)) {
      return NextResponse.json({
        success: false,
        error: 'Action and order IDs are required'
      }, { status: 400 });
    }

    let results = [];

    switch (action) {
      case 'update_status':
        results = await bulkUpdateStatus(orderIds, data.status);
        break;
      
      case 'mark_shipped':
        results = await bulkMarkShipped(orderIds, data);
        break;
      
      case 'export_korean_orders':
        results = await exportKoreanOrders(orderIds);
        break;
      
      case 'generate_shipping_labels':
        results = await generateKoreanShippingLabels(orderIds);
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid bulk action'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Bulk ${action} completed`,
      data: {
        processed: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      }
    });

  } catch (error) {
    console.error('Bulk Orders API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Bulk operation failed' },
      { status: 500 }
    );
  }
}

async function bulkUpdateStatus(orderIds: string[], status: string) {
  const results = [];

  for (const orderId of orderIds) {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'shipped') {
        updateData.shipped_at = new Date().toISOString();
      } else if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      results.push({
        orderId,
        success: !error,
        error: error?.message
      });
    } catch (error) {
      results.push({
        orderId,
        success: false,
        error: 'Update failed'
      });
    }
  }

  return results;
}

async function bulkMarkShipped(orderIds: string[], shippingData: any) {
  const results = [];

  for (const orderId of orderIds) {
    try {
      const updateData = {
        status: 'shipped',
        tracking_number: shippingData.trackingPrefix + orderId.slice(-6),
        tracking_url: `https://tracking.korea-post.go.kr/en?tracking=${shippingData.trackingPrefix}${orderId.slice(-6)}`,
        shipped_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      results.push({
        orderId,
        trackingNumber: updateData.tracking_number,
        success: !error,
        error: error?.message
      });
    } catch (error) {
      results.push({
        orderId,
        success: false,
        error: 'Shipping update failed'
      });
    }
  }

  return results;
}

async function exportKoreanOrders(orderIds: string[]) {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_line_items (
          *,
          products (
            name,
            is_korean_brand,
            korean_brands (
              name
            )
          )
        )
      `)
      .in('id', orderIds);

    if (error) throw error;

    // Format for Korean fulfillment center
    const exportData = orders?.map(order => ({
      orderNumber: order.order_number,
      customerEmail: order.email,
      shippingName: `${order.shipping_first_name} ${order.shipping_last_name}`,
      shippingAddress: {
        line1: order.shipping_address1,
        line2: order.shipping_address2,
        city: order.shipping_city,
        province: order.shipping_province,
        postalCode: order.shipping_postal_code,
        country: order.shipping_country
      },
      items: order.order_line_items?.filter((item: any) => 
        item.products?.is_korean_brand
      ).map((item: any) => ({
        productName: item.product_title,
        koreanBrand: item.products?.korean_brands?.name,
        quantity: item.quantity,
        sku: item.sku
      })),
      totalValue: order.total_amount,
      currency: order.currency,
      specialInstructions: order.notes
    }));

    return [{
      success: true,
      data: exportData,
      filename: `korean_orders_${new Date().toISOString().slice(0, 10)}.json`
    }];

  } catch (error) {
    return [{
      success: false,
      error: 'Export failed'
    }];
  }
}

async function generateKoreanShippingLabels(orderIds: string[]) {
  // Mock implementation for Korean shipping label generation
  const results = [];

  for (const orderId of orderIds) {
    try {
      // In real implementation, integrate with Korea Post API
      const labelUrl = `https://labels.korea-post.go.kr/generate/${orderId}`;
      
      results.push({
        orderId,
        labelUrl,
        success: true
      });
    } catch (error) {
      results.push({
        orderId,
        success: false,
        error: 'Label generation failed'
      });
    }
  }

  return results;
}