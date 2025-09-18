import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Get all Korean brands for admin management
export async function GET(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth(request);
    if (!isAdmin.success) {
      return NextResponse.json(isAdmin.error, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const verified = searchParams.get('verified');
    const search = searchParams.get('search');

    // Build query
    let query = supabase
      .from('korean_brands')
      .select(`
        *,
        products!left (
          id,
          published
        )
      `)
      .order('created_at', { ascending: false });

    if (verified !== null) {
      query = query.eq('verified', verified === 'true');
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: brands, error } = await query;
    if (error) throw error;

    // Get total count
    let countQuery = supabase
      .from('korean_brands')
      .select('*', { count: 'exact', head: true });

    if (verified !== null) countQuery = countQuery.eq('verified', verified === 'true');
    if (search) countQuery = countQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`);

    const { count } = await countQuery;

    // Transform brands with product stats
    const transformedBrands = brands?.map(brand => ({
      ...brand,
      productCount: brand.products?.length || 0,
      publishedProductCount: brand.products?.filter((p: any) => p.published).length || 0
    }));

    return NextResponse.json({
      success: true,
      data: transformedBrands,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Admin Korean Brands API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Korean brands' },
      { status: 500 }
    );
  }
}

// Create new Korean brand
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth(request);
    if (!isAdmin.success) {
      return NextResponse.json(isAdmin.error, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      slug,
      description,
      logoUrl,
      websiteUrl,
      instagramHandle,
      foundedYear,
      headquartersCity = 'Seoul',
      brandStory,
      verified = false
    } = body;

    if (!name || !slug) {
      return NextResponse.json({
        success: false,
        error: 'Name and slug are required'
      }, { status: 400 });
    }

    // Check slug uniqueness
    const { data: existingBrand } = await supabase
      .from('korean_brands')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingBrand) {
      return NextResponse.json({
        success: false,
        error: 'Slug already exists'
      }, { status: 400 });
    }

    // Create brand
    const { data: brand, error: brandError } = await supabase
      .from('korean_brands')
      .insert({
        name,
        slug,
        description,
        logo_url: logoUrl,
        website_url: websiteUrl,
        instagram_handle: instagramHandle,
        founded_year: foundedYear,
        headquarters_city: headquartersCity,
        brand_story: brandStory,
        verified
      })
      .select()
      .single();

    if (brandError) throw brandError;

    return NextResponse.json({
      success: true,
      message: 'Korean brand created successfully',
      data: brand
    });

  } catch (error) {
    console.error('Create Korean Brand API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create Korean brand' },
      { status: 500 }
    );
  }
}