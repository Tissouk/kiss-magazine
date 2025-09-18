import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      cartItems,
      shippingAddress,
      billingAddress,
      currency = 'USD',
      pointsToUse = 0,
      promoCode
    } = body;

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Cart is empty'
      }, { status: 400 });
    }

    // Get user ID
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    // Validate and calculate totals
    const { subtotal, taxes, shipping, discount, total, orderItems } = 
      await calculateOrderTotals(cartItems, shippingAddress, pointsToUse, promoCode);

    // Create order in database
    const orderData = {
      user_id: user.id,
      email: user.email,
      currency,
      subtotal,
      tax_amount: taxes,
      shipping_amount: shipping,
      discount_amount: discount,
      total_amount: total,
      points_used: pointsToUse,
      
      // Shipping address
      shipping_first_name: shippingAddress.firstName,
      shipping_last_name: shippingAddress.lastName,
      shipping_address1: shippingAddress.address1,
      shipping_address2: shippingAddress.address2,
      shipping_city: shippingAddress.city,
      shipping_province: shippingAddress.province,
      shipping_postal_code: shippingAddress.postalCode,
      shipping_country: shippingAddress.country,
      shipping_phone: shippingAddress.phone,
      
      // Billing address
      billing_first_name: billingAddress.firstName,
      billing_last_name: billingAddress.lastName,
      billing_address1: billingAddress.address1,
      billing_address2: billingAddress.address2,
      billing_city: billingAddress.city,
      billing_province: billingAddress.province,
      billing_postal_code: billingAddress.postalCode,
      billing_country: billingAddress.country,
      billing_phone: billingAddress.phone
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order line items
    const lineItems = orderItems.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      variant_id: item.variantId,
      quantity: item.quantity,
      price: item.price,
      total_price: item.total,
      product_title: item.name,
      variant_title: item.variantTitle,
      sku: item.sku
    }));

    const { error: lineItemsError } = await supabase
      .from('order_line_items')
      .insert(lineItems);

    if (lineItemsError) throw lineItemsError;

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        user_id: user.id,
        korean_products: 'true'
      },
      shipping: {
        name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        address: {
          line1: shippingAddress.address1,
          line2: shippingAddress.address2,
          city: shippingAddress.city,
          state: shippingAddress.province,
          postal_code: shippingAddress.postalCode,
          country: shippingAddress.country
        }
      }
    });

    // Update order with payment intent
    await supabase
      .from('orders')
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        payment_status: 'pending'
      })
      .eq('id', order.id);

    // Deduct points if used
    if (pointsToUse > 0) {
      await supabase.rpc('redeem_points', {
        user_uuid: user.id,
        points_amount: pointsToUse,
        transaction_action: 'order_payment',
        transaction_description: `Points used for order ${order.order_number}`,
        reference_uuid: order.id
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.order_number,
        clientSecret: paymentIntent.client_secret,
        total,
        currency
      }
    });

  } catch (error) {
    console.error('Checkout API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Checkout failed' },
      { status: 500 }
    );
  }
}

async function calculateOrderTotals(
  cartItems: any[], 
  shippingAddress: any, 
  pointsToUse: number, 
  promoCode?: string
) {
  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate shipping from Seoul
  const totalWeight = cartItems.reduce((sum, item) => sum + (item.weight || 500) * item.quantity, 0);
  const shipping = subtotal >= 50 ? 0 : 12.99; // Free shipping over $50
  
  // Calculate taxes (simplified - would need proper tax calculation)
  const taxes = 0; // Most international shipments don't include local taxes
  
  // Apply promo code discount
  let discount = 0;
  if (promoCode) {
    const { data: promoData } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', promoCode.toUpperCase())
      .eq('active', true)
      .single();
    
    if (promoData && promoData.starts_at <= new Date() && promoData.ends_at >= new Date()) {
      if (promoData.discount_type === 'percentage') {
        discount = subtotal * (promoData.discount_value / 100);
      } else {
        discount = promoData.discount_value;
      }
    }
  }
  
  // Apply points discount (100 points = $1)
  const pointsDiscount = pointsToUse / 100;
  discount += pointsDiscount;
  
  const total = Math.max(0, subtotal + taxes + shipping - discount);
  
  // Calculate points to earn (1 point per $1 spent)
  const pointsToEarn = Math.floor(total);
  
  return {
    subtotal,
    taxes,
    shipping,
    discount,
    total,
    pointsToEarn,
    orderItems: cartItems.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
      name: item.name,
      variantTitle: item.variantTitle,
      sku: item.sku
    }))
  };
}