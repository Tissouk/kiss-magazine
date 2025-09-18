import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const koreanOnly = searchParams.get('korean_only') === 'true';

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Query must be at least 2 characters'
      }, { status: 400 });
    }

    // Build search query with Korean culture focus
    let searchQuery = supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        price,
        currency,
        rating,
        review_count,
        is_korean_brand,
        category,
        product_images!left (
          url,
          is_primary
        ),
        korean_brands!left (
          name
        )
      `)
      .eq('published', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,short_description.ilike.%${query}%`)
      .limit(limit);

    // Apply filters
    if (category) {
      searchQuery = searchQuery.eq('category', category);
    }

    if (koreanOnly) {
      searchQuery = searchQuery.eq('is_korean_brand', true);
    }

    // Order by relevance (Korean brands first, then by rating)
    searchQuery = searchQuery.order('is_korean_brand', { ascending: false })
                             .order('rating', { ascending: false });

    const { data: products, error } = await searchQuery;

    if (error) throw error;

    // Log search for analytics
    await supabase
      .from('search_analytics')
      .insert({
        query,
        results_count: products?.length || 0,
        no_results: (products?.length || 0) === 0
      });

    // Transform results
    const transformedProducts = products?.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      currency: product.currency,
      rating: product.rating,
      reviewCount: product.review_count,
      isKoreanBrand: product.is_korean_brand,
      category: product.category,
      image: product.product_images?.find(img => img.is_primary)?.url || 
             product.product_images?.[0]?.url,
      koreanBrandName: product.korean_brands?.name
    }));

    // Get search suggestions if no results
    let suggestions = [];
    if (transformedProducts?.length === 0) {
      const { data: suggestionData } = await supabase
        .from('products')
        .select('name')
        .eq('published', true)
        .or(`name.ilike.%${query.slice(0, -1)}%`)
        .limit(5);
      
      suggestions = suggestionData?.map(p => p.name) || [];
    }

    return NextResponse.json({
      success: true,
      data: transformedProducts,
      query,
      suggestions,
      totalResults: products?.length || 0
    });

  } catch (error) {
    console.error('Product Search API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, clickedProductId, clickedPosition } = body;

    if (!query) {
      return NextResponse.json({
        success: false,
        error: 'Query is required'
      }, { status: 400 });
    }

    // Log search click analytics
    await supabase
      .from('search_analytics')
      .insert({
        query,
        clicked_product_id: clickedProductId,
        clicked_position: clickedPosition
      });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Search Analytics API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to log analytics' },
      { status: 500 }
    );
  }
}