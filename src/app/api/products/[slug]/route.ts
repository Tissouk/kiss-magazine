import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Get product with all related data
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images (
          id,
          url,
          alt_text,
          is_primary,
          position
        ),
        product_variants (
          id,
          title,
          option1,
          option2,
          option3,
          sku,
          price,
          compare_price,
          inventory_quantity,
          position
        ),
        korean_brands (
          id,
          name,
          slug,
          description,
          logo_url,
          website_url,
          instagram_handle,
          founded_year,
          headquarters_city,
          brand_story
        ),
        kbeauty_attributes (
          skin_types,
          skin_concerns,
          key_ingredients,
          korean_routine_step,
          ph_level,
          cruelty_free,
          vegan,
          fragrance_free
        ),
        product_reviews!left (
          id,
          rating,
          title,
          content,
          images,
          verified_purchase,
          helpful_count,
          created_at,
          users (
            username,
            avatar_url
          )
        )
      `)
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error || !product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get related products (same category, Korean brand preference)
    const { data: relatedProducts } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        price,
        rating,
        review_count,
        is_korean_brand,
        product_images!left (
          url,
          is_primary
        )
      `)
      .eq('category', product.category)
      .eq('published', true)
      .neq('id', product.id)
      .limit(8);

    // Transform product data
    const transformedProduct = {
      ...product,
      images: product.product_images?.sort((a, b) => a.position - b.position).map(img => ({
        id: img.id,
        url: img.url,
        alt: img.alt_text,
        isPrimary: img.is_primary
      })) || [],
      variants: product.product_variants?.sort((a, b) => a.position - b.position) || [],
      koreanBrand: product.korean_brands || null,
      kBeautyAttributes: product.kbeauty_attributes?.[0] || null,
      reviews: product.product_reviews?.filter(review => review.users).map(review => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        content: review.content,
        images: review.images,
        verifiedPurchase: review.verified_purchase,
        helpfulCount: review.helpful_count,
        createdAt: review.created_at,
        user: {
          username: review.users.username,
          avatar: review.users.avatar_url
        }
      })) || [],
      relatedProducts: relatedProducts?.map(rp => ({
        ...rp,
        image: rp.product_images?.find(img => img.is_primary)?.url || rp.product_images?.[0]?.url
      })) || []
    };

    return NextResponse.json({
      success: true,
      data: transformedProduct
    });

  } catch (error) {
    console.error('Product Detail API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}