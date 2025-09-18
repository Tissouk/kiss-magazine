import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '8');
    const category = searchParams.get('category');
    const koreanOnly = searchParams.get('korean_only') === 'true';

    // Use the database function for trending products
    const { data: trendingProducts, error } = await supabase
      .rpc('get_trending_products', { limit_count: limit * 2 }); // Get more to filter

    if (error) throw error;

    let filteredProducts = trendingProducts;

    // Apply filters
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    if (koreanOnly) {
      filteredProducts = filteredProducts.filter(p => p.is_korean_brand);
    }

    // Limit results
    filteredProducts = filteredProducts.slice(0, limit);

    // Get additional product data for filtered products
    const productIds = filteredProducts.map(p => p.id);
    
    const { data: detailedProducts, error: detailError } = await supabase
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
        korean_exclusive,
        product_images!left (
          url,
          alt_text,
          is_primary
        ),
        korean_brands!left (
          name,
          slug
        )
      `)
      .in('id', productIds)
      .eq('published', true);

    if (detailError) throw detailError;

    // Transform and maintain trending order
    const transformedProducts = filteredProducts.map(trending => {
      const product = detailedProducts.find(p => p.id === trending.id);
      if (!product) return null;

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        currency: product.currency,
        rating: product.rating,
        reviewCount: product.review_count,
        isKoreanBrand: product.is_korean_brand,
        koreanExclusive: product.korean_exclusive,
        category: product.category,
        image: product.product_images?.find(img => img.is_primary)?.url || 
               product.product_images?.[0]?.url,
        koreanBrand: product.korean_brands ? {
          name: product.korean_brands.name,
          slug: product.korean_brands.slug
        } : null,
        trendingScore: trending.review_count + (trending.rating * 100) // Custom trending score
      };
    }).filter(Boolean);

    return NextResponse.json({
      success: true,
      data: transformedProducts,
      meta: {
        totalTrending: trendingProducts.length,
        filtered: transformedProducts.length,
        filters: { category, koreanOnly }
      }
    });

  } catch (error) {
    console.error('Trending Products API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trending products' },
      { status: 500 }
    );
  }
}