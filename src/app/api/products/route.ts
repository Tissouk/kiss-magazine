import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const koreanBrand = searchParams.get('korean_brand');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const minRating = searchParams.get('min_rating');
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const trending = searchParams.get('trending');

    // Build query
    let query = supabase
      .from('products')
      .select(`
        *,
        product_images!left (
          id,
          url,
          alt_text,
          is_primary
        ),
        korean_brands!left (
          name,
          slug,
          logo_url
        ),
        kbeauty_attributes!left (
          skin_types,
          skin_concerns,
          key_ingredients,
          korean_routine_step
        )
      `)
      .eq('published', true);

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }

    if (koreanBrand === 'true') {
      query = query.eq('is_korean_brand', true);
    } else if (koreanBrand === 'false') {
      query = query.eq('is_korean_brand', false);
    }

    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice));
    }

    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice));
    }

    if (minRating) {
      query = query.gte('rating', parseFloat(minRating));
    }

    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply sorting
    const validSortColumns = ['created_at', 'price', 'rating', 'review_count', 'name'];
    if (validSortColumns.includes(sortBy)) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: products, error } = await query;

    if (error) throw error;

    // Get total count for pagination
    let countQuery = supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('published', true);

    // Apply same filters for count
    if (category) countQuery = countQuery.eq('category', category);
    if (koreanBrand === 'true') countQuery = countQuery.eq('is_korean_brand', true);
    if (koreanBrand === 'false') countQuery = countQuery.eq('is_korean_brand', false);
    if (minPrice) countQuery = countQuery.gte('price', parseFloat(minPrice));
    if (maxPrice) countQuery = countQuery.lte('price', parseFloat(maxPrice));
    if (minRating) countQuery = countQuery.gte('rating', parseFloat(minRating));
    if (featured === 'true') countQuery = countQuery.eq('featured', true);
    if (search) countQuery = countQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`);

    const { count } = await countQuery;

    // Transform products data
    const transformedProducts = products?.map(product => ({
      ...product,
      images: product.product_images?.map(img => ({
        id: img.id,
        url: img.url,
        alt: img.alt_text,
        isPrimary: img.is_primary
      })) || [],
      koreanBrand: product.korean_brands ? {
        name: product.korean_brands.name,
        slug: product.korean_brands.slug,
        logoUrl: product.korean_brands.logo_url
      } : null,
      kBeautyAttributes: product.kbeauty_attributes?.[0] || null
    }));

    return NextResponse.json({
      success: true,
      data: transformedProducts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      filters: {
        category,
        koreanBrand,
        minPrice,
        maxPrice,
        minRating,
        search,
        featured
      }
    });

  } catch (error) {
    console.error('Products API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}