import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

// Get cart items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    
    // Try to get user from auth
    const cookieStore = cookies();
    const authToken = cookieStore.get('sb-access-token')?.value;
    
    let userId = null;
    if (authToken) {
      const { data: { user } } = await supabase.auth.getUser(authToken);
      userId = user?.id;
    }

    if (!userId && !sessionId) {
      return NextResponse.json({
        success: false,
        error: 'User ID or session ID required'
      }, { status: 400 });
    }

    // Build cart query
    let query = supabase
      .from('cart_items')
      .select(`
        *,
        products (
          id,
          name,
          slug,
          price,
          currency,
          is_korean_brand,
          inventory_quantity,
          product_images!left (
            url,
            is_primary
          ),
          korean_brands (
            name
          )
        ),
        product_variants (
          id,
          title,
          option1,
          option2,
          price,
          inventory_quantity
        )
      `);

    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.eq('session_id', sessionId);
    }

    const { data: cartItems, error } = await query;

    if (error) throw error;

    // Calculate totals
    let subtotal = 0;
    const transformedItems = cartItems?.map(item => {
      const product = item.products;
      const variant = item.product_variants;
      const price = variant?.price || product.price;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      return {
        id: item.id,
        productId: product.id,
        variantId: item.variant_id,
        name: product.name,
        slug: product.slug,
        image: product.product_images?.find(img => img.is_primary)?.url || 
               product.product_images?.[0]?.url,
        price,
        currency: product.currency,
        quantity: item.quantity,
        total: itemTotal,
        isKoreanBrand: product.is_korean_brand,
        koreanBrandName: product.korean_brands?.name,
        variant: variant ? {
          title: variant.title,
          option1: variant.option1,
          option2: variant.option2
        } : null,
        maxQuantity: Math.min(
          variant?.inventory_quantity || product.inventory_quantity,
          10
        )
      };
    }) || [];

    // Calculate shipping (free over $50, otherwise $12.99 from Seoul)
    const shippingCost = subtotal >= 50 ? 0 : 12.99;
    const total = subtotal + shippingCost;

    return NextResponse.json({
      success: true,
      data: {
        items: transformedItems,
        subtotal,
        shippingCost,
        total,
        itemCount: transformedItems.length,
        freeShippingThreshold: 50,
        freeShippingRemaining: Math.max(0, 50 - subtotal)
      }
    });

  } catch (error) {
    console.error('Get Cart API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// Add item to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, variantId, quantity = 1, sessionId } = body;

    if (!productId || quantity < 1) {
      return NextResponse.json({
        success: false,
        error: 'Product ID and valid quantity required'
      }, { status: 400 });
    }

    // Try to get user from auth
    const cookieStore = cookies();
    const authToken = cookieStore.get('sb-access-token')?.value;
    
    let userId = null;
    if (authToken) {
      const { data: { user } } = await supabase.auth.getUser(authToken);
      userId = user?.id;
    }

    if (!userId && !sessionId) {
      return NextResponse.json({
        success: false,
        error: 'User ID or session ID required'
      }, { status: 400 });
    }

    // Check if item already exists in cart
    let existingQuery = supabase
      .from('cart_items')
      .select('*')
      .eq('product_id', productId);

    if (variantId) {
      existingQuery = existingQuery.eq('variant_id', variantId);
    }

    if (userId) {
      existingQuery = existingQuery.eq('user_id', userId);
    } else {
      existingQuery = existingQuery.eq('session_id', sessionId);
    }

    const { data: existingItems } = await existingQuery;

    if (existingItems && existingItems.length > 0) {
      // Update existing item
      const existingItem = existingItems[0];
      const newQuantity = existingItem.quantity + quantity;

      const { data, error } = await supabase
        .from('cart_items')
        .update({ 
          quantity: newQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Cart updated',
        data
      });
    } else {
      // Add new item
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          session_id: sessionId,
          product_id: productId,
          variant_id: variantId,
          quantity
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Item added to cart',
        data
      });
    }

  } catch (error) {
    console.error('Add to Cart API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}

// Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, quantity } = body;

    if (!itemId || quantity < 0) {
      return NextResponse.json({
        success: false,
        error: 'Item ID and valid quantity required'
      }, { status: 400 });
    }

    if (quantity === 0) {
      // Remove item
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Item removed from cart'
      });
    } else {
      // Update quantity
      const { data, error } = await supabase
        .from('cart_items')
        .update({ 
          quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Cart updated',
        data
      });
    }

  } catch (error) {
    console.error('Update Cart API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}