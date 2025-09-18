import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Get single article for editing
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

    const { data: article, error } = await supabase
      .from('articles')
      .select(`
        *,
        users!inner (
          username,
          email
        ),
        article_tag_relationships!left (
          article_tags (
            id,
            name,
            korean_term
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error || !article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    // Transform article
    const transformedArticle = {
      ...article,
      author: {
        username: article.users.username,
        email: article.users.email
      },
      tags: article.article_tag_relationships?.map((rel: any) => ({
        id: rel.article_tags.id,
        name: rel.article_tags.name,
        koreanTerm: rel.article_tags.korean_term
      })) || []
    };

    return NextResponse.json({
      success: true,
      data: transformedArticle
    });

  } catch (error) {
    console.error('Get Article API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

// Update article
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
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      category,
      tags = [],
      featured,
      trending,
      status,
      seoTitle,
      seoDescription,
      publishedAt
    } = body;

    // Check if article exists
    const { data: existingArticle, error: fetchError } = await supabase
      .from('articles')
      .select('id, slug')
      .eq('id', id)
      .single();

    if (fetchError || !existingArticle) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    // Check slug uniqueness (if changed)
    if (slug !== existingArticle.slug) {
      const { data: duplicateSlug } = await supabase
        .from('articles')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single();

      if (duplicateSlug) {
        return NextResponse.json({
          success: false,
          error: 'Slug already exists'
        }, { status: 400 });
      }
    }

    // Calculate read time
    const readTime = calculateReadTime(content);

    // Update article
    const updateData: any = {
      title,
      slug,
      excerpt,
      content,
      featured_image_url: featuredImage,
      category,
      featured,
      trending,
      status,
      read_time_minutes: readTime,
      seo_title: seoTitle,
      seo_description: seoDescription,
      updated_at: new Date().toISOString()
    };

    // Set published_at if status is being published
    if (status === 'approved' && !publishedAt) {
      updateData.published_at = new Date().toISOString();
    } else if (publishedAt) {
      updateData.published_at = publishedAt;
    }

    const { data: article, error: updateError } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Update tags
    // First, remove existing tag relationships
    await supabase
      .from('article_tag_relationships')
      .delete()
      .eq('article_id', id);

    // Add new tags
    if (tags.length > 0) {
      const tagInserts = await Promise.all(
        tags.map(async (tagName: string) => {
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
            article_id: id,
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
      message: 'Article updated successfully',
      data: article
    });

  } catch (error) {
    console.error('Update Article API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

// Delete article
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await checkAdminAuth(request);
    if (!isAdmin.success) {
      return NextResponse.json(isAdmin.error, { status: 401 });
    }

    const { id } = params;

    // Check if article exists
    const { data: existingArticle, error: fetchError } = await supabase
      .from('articles')
      .select('id, title')
      .eq('id', id)
      .single();

    if (fetchError || !existingArticle) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    // Delete article (cascade will handle relationships)
    const { error: deleteError } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully'
    });

  } catch (error) {
    console.error('Delete Article API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}