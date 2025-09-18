import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Get single order details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await checkAdminAuth(request);
    if (!isAdmin.success) {
      return NextResponse.json(isAdmin.error, { status: 401 });
    }

    const { id } = params;

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        users (
          id,
          username,
          email,
          country_code,
          points,
          level
        ),
        order_line_items (
          *,
          products (
            name,
            slug,
            is_korean_brand,
            korean_brands (
              name,
              logo_url
            ),
            product_images (
              url,
              is_primary
            )
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Calculate Korean shipping info
    const shippingInfo = calculateKoreanShipping(order);

    // Transform order with detailed information
    const transformedOrder = {
      ...order,
      customer: order.users ? {
        id: order.users.id,
        username: order.users.username,
        email: order.users.email,
        country: order.users.country_code,
        points: order.users.points,
        level: order.users.level,
        isGuest: false
      } : {
        email: order.email,
        isGuest: true
      },
      items: order.order_line_items?.map((item: any) => ({
        ...item,
        product: {
          name: item.products?.name || item.product_title,
          slug: item.products?.slug,
          isKoreanBrand: item.products?.is_korean_brand || false,
          koreanBrand: item.products?.korean_brands || null,
          image: item.products?.product_images?.find((img: any) => img.is_primary)?.url ||
                 item.products?.product_images?.[0]?.url
        }
      })) || [],
      shippingInfo,
      timeline: await getOrderTimeline(id),
      koreanProductsValue: order.order_line_items?.reduce((sum: number, item: any) => {
        return sum + (item.products?.is_korean_brand ? item.total_price : 0);
      }, 0) || 0
    };

    return NextResponse.json({
      success: true,
      data: transformedOrder
    });

  } catch (error) {
    console.error('Get Order Details API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
}

// Update order status and shipping
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await checkAdminAuth(request);
    if (!isAdmin.success) {
      return NextResponse.json(isAdmin.error, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const {
      status,
      paymentStatus,
      trackingNumber,
      trackingUrl,
      notes,
      notifyCustomer = true
    } = body;

    // Get current order
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (status) {
      updateData.status = status;
      
      // Set timestamps based on status
      if (status === 'shipped' && !currentOrder.shipped_at) {
        updateData.shipped_at = new Date().toISOString();
      } else if (status === 'delivered' && !currentOrder.delivered_at) {
        updateData.delivered_at = new Date().toISOString();
      }
    }

    if (paymentStatus) {
      updateData.payment_status = paymentStatus;
    }

    if (trackingNumber) {
      updateData.tracking_number = trackingNumber;
    }

    if (trackingUrl) {
      updateData.tracking_url = trackingUrl;
    }

    if (notes) {
      updateData.notes = notes;
    }

    // Update order
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Award delivery points if order is delivered
    if (status === 'delivered' && currentOrder.status !== 'delivered' && currentOrder.user_id) {
      const deliveryPoints = Math.floor(currentOrder.total_amount / 10); // 1 point per $10 spent
      
      await supabase.rpc('award_points', {
        user_uuid: currentOrder.user_id,
        points_amount: deliveryPoints,
        transaction_action: 'order_delivered',
        transaction_description: `Order ${currentOrder.order_number} delivered`,
        reference_uuid: id
      });
    }

    // Send notification email if requested
    if (notifyCustomer && status) {
      await sendOrderStatusNotification(currentOrder, status, trackingNumber);
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder
    });

  } catch (error) {
    console.error('Update Order API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

function calculateKoreanShipping(order: any) {
  const destination = order.shipping_country;
  const weight = order.order_line_items?.reduce((total: number, item: any) => {
    return total + ((item.products?.weight_grams || 500) * item.quantity);
  }, 0) || 1000;

  // Korean shipping carriers and methods
  const carriers = {
    'KR-POST': 'Korea Post',
    'K-PACKET': 'K-Packet',
    'EMS': 'EMS Korea',
    'DHL': 'DHL Express'
  };

  const estimatedDays = {
    'US': '10-14',
    'CA': '12-16',
    'GB': '12-18',
    'AU': '12-16',
    'JP': '7-10',
    'CN': '10-14',
    'DE': '12-18',
    'FR': '12-18'
  };

  return {
    origin: 'Seoul, South Korea',
    carrier: carriers['K-PACKET'],
    estimatedDelivery: estimatedDays[destination as keyof typeof estimatedDays] || '14-21',
    weight: `${(weight / 1000).toFixed(1)} kg`,
    shippingCost: order.shipping_amount
  };
}

async function getOrderTimeline(orderId: string) {
  // Mock timeline - in real app, this would come from order_timeline table
  return [
    {
      status: 'pending',
      timestamp: new Date().toISOString(),
      description: 'Order received and payment processing',
      location: 'Seoul, KR'
    }
  ];
}

async function sendOrderStatusNotification(order: any, status: string, trackingNumber?: string) {
  // Mock email notification
  console.log(`Sending ${status} notification to ${order.email}`, { trackingNumber });
  
  // TODO: Implement actual email service
  // Example: Send email with Korean culture branding and tracking info
}