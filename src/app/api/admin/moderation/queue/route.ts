import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin/moderator
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // TODO: Add proper admin role check
    // For now, we'll assume authenticated users can moderate

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const contentType = searchParams.get('content_type');
    const priority = searchParams.get('priority');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build moderation queue query
    let query = supabase
      .from('moderation_queue')
      .select(`
        *,
        flagged_by_user:flagged_by (
          username
        ),
        assigned_moderator:assigned_to (
          username
        )
      `)
      .eq('status', status)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(limit);

    if (contentType) {
      query = query.eq('content_type', contentType);
    }

    if (priority) {
      query = query.eq('priority', parseInt(priority));
    }

    const { data: queueItems, error } = await query;

    if (error) throw error;

    // Get additional content details for each item
    const enrichedItems = await Promise.all(
      (queueItems || []).map(async (item) => {
        let contentDetails = null;

        try {
          if (item.content_type === 'post') {
            const { data: post } = await supabase
              .from('community_posts')
              .select(`
                content,
                image_urls,
                location,
                users!inner (
                  username,
                  avatar_url
                )
              `)
              .eq('id', item.content_id)
              .single();

            contentDetails = {
              content: post?.content?.substring(0, 200) + (post?.content?.length > 200 ? '...' : ''),
              imageCount: post?.image_urls?.length || 0,
              location: post?.location,
              author: post?.users?.username
            };
          } else if (item.content_type === 'comment') {
            const { data: comment } = await supabase
              .from('community_post_comments')
              .select(`
                content,
                users!inner (
                  username
                )
              `)
              .eq('id', item.content_id)
              .single();

            contentDetails = {
              content: comment?.content,
              author: comment?.users?.username
            };
          } else if (item.content_type === 'review') {
            const { data: review } = await supabase
              .from('product_reviews')
              .select(`
                title,
                content,
                images,
                users!inner (
                  username
                )
              `)
              .eq('id', item.content_id)
              .single();

            contentDetails = {
              title: review?.title,
              content: review?.content?.substring(0, 200) + (review?.content?.length > 200 ? '...' : ''),
              imageCount: review?.images?.length || 0,
              author: review?.users?.username
            };
          }
        } catch (contentError) {
          console.error('Error fetching content details:', contentError);
        }

        return {
          ...item,
          contentDetails
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrichedItems,
      filters: { status, contentType, priority }
    });

  } catch (error) {
    console.error('Moderation Queue API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch moderation queue' },
      { status: 500 }
    );
  }
}