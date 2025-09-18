import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, moderatorNotes, reason } = body; // action: 'approve' | 'reject'

    // Get authenticated user (moderator)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get moderation item
    const { data: moderationItem, error: itemError } = await supabase
      .from('moderation_queue')
      .select('*')
      .eq('id', id)
      .single();

    if (itemError || !moderationItem) {
      return NextResponse.json(
        { success: false, error: 'Moderation item not found' },
        { status: 404 }
      );
    }

    const { content_type, content_id } = moderationItem;

    // Update content status based on action
    let contentUpdateError = null;
    
    if (content_type === 'post') {
      const { error } = await supabase
        .from('community_posts')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          moderated_by: user.id,
          moderated_at: new Date().toISOString()
        })
        .eq('id', content_id);
      contentUpdateError = error;
    } else if (content_type === 'comment') {
      const { error } = await supabase
        .from('community_post_comments')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected'
        })
        .eq('id', content_id);
      contentUpdateError = error;
    } else if (content_type === 'review') {
      const { error } = await supabase
        .from('product_reviews')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          moderated_by: user.id,
          moderated_at: new Date().toISOString()
        })
        .eq('id', content_id);
      contentUpdateError = error;
    }

    if (contentUpdateError) throw contentUpdateError;

    // Update moderation queue item
    const { error: queueUpdateError } = await supabase
      .from('moderation_queue')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        moderator_notes: moderatorNotes,
        assigned_to: user.id,
        resolved_at: new Date().toISOString()
      })
      .eq('id', id);

    if (queueUpdateError) throw queueUpdateError;

    // If rejecting, optionally send notification to user
    if (action === 'reject' && reason) {
      // TODO: Implement user notification system
      console.log(`Content rejected for reason: ${reason}`);
    }

    return NextResponse.json({
      success: true,
      message: `Content ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      data: { action, moderatedBy: user.id }
    });

  } catch (error) {
    console.error('Moderation Action API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process moderation action' },
      { status: 500 }
    );
  }
}