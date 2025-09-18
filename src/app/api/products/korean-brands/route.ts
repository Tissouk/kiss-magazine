import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get Korean brands with product counts
    let query = supabase
      .from('korean_brands')
      .select(`
        *,
        products!left (
          id,
          published
        )
      `);

    if (featured) {
      query = query.eq('verified', true);
    }

    query = query.limit(limit);

    const { data: brands, error } = await supabase.rpc('get_korean_brands_with_stats');

    if (error) throw error;

    // Transform brands data
    const transformedBrands = brands?.map(brand => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      logoUrl: brand.logo_url,
      websiteUrl: brand.website_url,
      instagramHandle: brand.instagram_handle,
      foundedYear: brand.founded_year,
      headquartersCity: brand.headquarters_city,
      brandStory: brand.brand_story,
      verified: brand.verified,
      productCount: brand.product_count || 0,
      avgRating: brand.avg_rating || 0
    }));

    return NextResponse.json({
      success: true,
      data: transformedBrands
    });

  } catch (error) {
    console.error('Korean Brands API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Korean brands' },
      { status: 500 }
    );
  }
}