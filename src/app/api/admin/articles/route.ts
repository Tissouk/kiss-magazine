import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Get all articles with admin features
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const isAdmin = await checkAdminAuth(request);
    if (!isAdmin.success) {
      return NextResponse.json(isAdmin.error, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const author = searchParams.get('author');
    const search = searchParams.get('search');

    // Build admin query (can see all statuses)
    let query = supabase
      .from('articles')
      .select(`
        *,
        users!inner (
          username,
          email
        ),
        article_tag_relationships!left (
          article_tags (
            name,
            korean_term
          )
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (author) {
      query = query.eq('author_id', author);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: articles, error } = await query;
    if (error) throw error;

    // Get total count
    let countQuery = supabase
      .from('articles')
      .select('*', { count: 'exact', head: true });

    if (status) countQuery = countQuery.eq('status', status);
    if (category) countQuery = countQuery.eq('category', category);
    if (author) countQuery = countQuery.eq('author_id', author);
    if (search) countQuery = countQuery.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);

    const { count } = await countQuery;

    // Transform articles
    const transformedArticles = articles?.map(article => ({
      ...article,
      author: {
        username: article.users.username,
        email: article.users.email
      },
      tags: article.article_tag_relationships?.map((rel: any) => ({
        name: rel.article_tags.name,
        koreanTerm: rel.article_tags.korean_term
      })) || []
    }));

    return NextResponse.json({
      success: true,
      data: transformedArticles,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Admin Articles API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

// Create new article
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth(request);
    if (!isAdmin.success) {
      return NextResponse.json(isAdmin.error, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      category,
      tags = [],
      featured = false,
      trending = false,
      seoTitle,
      seoDescription,
      publishedAt
    } = body;

    if (!title || !slug || !content || !category) {
      return NextResponse.json({
        success: false,
        error: 'Title, slug, content, and category are required'
      }, { status: 400 });
    }

    // Check slug uniqueness
    const { data: existingArticle } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingArticle) {
      return NextResponse.json({
        success: false,
        error: 'Slug already exists'
      }, { status: 400 });
    }

    // Calculate read time
    const readTime = calculateReadTime(content);

    // Create article
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .insert({
        title,
        slug,
        excerpt,
        content,
        featured_image_url: featuredImage,
        category,
        author_id: isAdmin.user.id,
        status: publishedAt ? 'approved' : 'draft',
        featured,
        trending,
        read_time_minutes: readTime,
        seo_title: seoTitle,
        seo_description: seoDescription,
        published_at: publishedAt
      })
      .select()
      .single();

    if (articleError) throw articleError;

    // Add tags
    if (tags.length > 0) {
      const tagInserts = await Promise.all(
        tags.map(async (tagName: string) => {
          // Get or create tag
          const { data: tag, error: tagError } = await supabase
            .from('article_tags')
            .upsert({
              name: tagName,
              slug: tagName.toLowerCase().replace(/[^a-z0-9-]/g, '-')
            }, {
              onConflict: 'name',
              ignoreDuplicates: false
            })
            .select()
            .single();

          if (tagError) throw tagError;

          return {
            article_id: article.id,
            tag_id: tag.id
          };
        })
      );

      await supabase
        .from('article_tag_relationships')
        .insert(tagInserts);
    }

    return NextResponse.json({
      success: true,
      message: 'Article created successfully',
      data: article
    });

  } catch (error) {
    console.error('Create Article API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create article' },
      { status: 500 }
    );
  }
}

async function checkAdminAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return { success: false, error: { success: false, error: 'Authorization required' } };
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { success: false, error: { success: false, error: 'Invalid authentication' } };
    }

    // TODO: Add proper admin role check from user profile
    // For now, assume authenticated users can access admin features

    return { success: true, user };
  } catch (error) {
    return { success: false, error: { success: false, error: 'Authentication failed' } };
  }
}

function calculateReadTime(content: any): number {
  // Calculate read time based on content
  let wordCount = 0;
  
  if (typeof content === 'string') {
    wordCount = content.split(/\s+/).length;
  } else if (content && content.blocks) {
    // If content is structured (like Editor.js format)
    wordCount = content.blocks.reduce((total: number, block: any) => {
      if (block.data && block.data.text) {
        return total + block.data.text.split(/\s+/).length;
      }
      return total;
    }, 0);
  }

  // Average reading speed: 200 words per minute
  return Math.max(1, Math.ceil(wordCount / 200));
}