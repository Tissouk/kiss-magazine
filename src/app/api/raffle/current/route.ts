import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Get current month raffle statistics
    const { data: raffleStats, error: statsError } = await supabase
      .from('raffle_entries')
      .select('user_id, tickets_count')
      .eq('raffle_month', currentMonth);

    if (statsError) throw statsError;

    const totalParticipants = raffleStats?.length || 0;
    const totalTickets = raffleStats?.reduce((sum, entry) => sum + entry.tickets_count, 0) || 0;

    // Calculate drawing date (last day of current month)
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const lastDay = new Date(year, month, 0);
    const drawingDate = new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate(), 23, 59, 59);

    // Check if winner has been selected
    const { data: winner, error: winnerError } = await supabase
      .from('raffle_winners')
      .select(`
        *,
        users!inner (
          username,
          avatar_url,
          country_code
        )
      `)
      .eq('raffle_month', currentMonth)
      .single();

    // Get recent winners for display
    const { data: recentWinners, error: recentError } = await supabase
      .from('raffle_winners')
      .select(`
        raffle_month,
        trip_completed,
        users!inner (
          username,
          country_code
        )
      `)
      .order('raffle_month', { ascending: false })
      .limit(5);

    if (recentError) throw recentError;

    // Get authenticated user's entry if available
    let userEntry = null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: entry } = await supabase
          .from('raffle_entries')
          .select('tickets_count')
          .eq('user_id', user.id)
          .eq('raffle_month', currentMonth)
          .single();
        userEntry = entry;
      }
    } catch (authError) {
      // Continue without user entry if not authenticated
    }

    const now = new Date();
    const timeUntilDrawing = Math.max(0, drawingDate.getTime() - now.getTime());
    const hasDrawingPassed = now > drawingDate;

    return NextResponse.json({
      success: true,
      data: {
        month: currentMonth,
        drawingDate: drawingDate.toISOString(),
        timeUntilDrawing,
        hasDrawingPassed,
        stats: {
          totalParticipants,
          totalTickets,
          averageTicketsPerUser: totalParticipants > 0 ? (totalTickets / totalParticipants).toFixed(1) : '0'
        },
        currentWinner: winner ? {
          username: winner.users.username,
          country: winner.users.country_code,
          claimed: winner.claimed,
          tripCompleted: winner.trip_completed
        } : null,
        userEntry: userEntry ? {
          tickets: userEntry.tickets_count,
          odds: totalTickets > 0 ? ((userEntry.tickets_count / totalTickets) * 100).toFixed(2) : '0.00'
        } : null,
        recentWinners: recentWinners?.map(w => ({
          month: w.raffle_month,
          username: w.users.username,
          country: w.users.country_code,
          tripCompleted: w.trip_completed
        })) || [],
        prize: {
          name: '5-Day Seoul Adventure Trip',
          value: '$3,500',
          description: 'Complete Seoul experience with flights, hotel, tours, and shopping budget'
        }
      }
    });

  } catch (error) {
    console.error('Current Raffle API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch raffle information' },
      { status: 500 }
    );
  }
}