import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Conduct monthly raffle drawing (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { month } = body;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // TODO: Add proper admin role check
    
    if (!month) {
      return NextResponse.json(
        { success: false, error: 'Month is required (YYYY-MM format)' },
        { status: 400 }
      );
    }

    // Check if winner already exists for this month
    const { data: existingWinner } = await supabase
      .from('raffle_winners')
      .select('id')
      .eq('raffle_month', month)
      .single();

    if (existingWinner) {
      return NextResponse.json(
        { success: false, error: 'Winner already selected for this month' },
        { status: 400 }
      );
    }

    // Get all raffle entries for the month
    const { data: entries, error: entriesError } = await supabase
      .from('raffle_entries')
      .select(`
        user_id,
        tickets_count,
        users!inner (
          username,
          email,
          country_code
        )
      `)
      .eq('raffle_month', month);

    if (entriesError) throw entriesError;

    if (!entries || entries.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No raffle entries found for this month' },
        { status: 400 }
      );
    }

    // Create weighted ticket pool
    const ticketPool: string[] = [];
    entries.forEach(entry => {
      for (let i = 0; i < entry.tickets_count; i++) {
        ticketPool.push(entry.user_id);
      }
    });

    // Draw random winner
    const randomIndex = Math.floor(Math.random() * ticketPool.length);
    const winnerUserId = ticketPool[randomIndex];
    const winnerEntry = entries.find(e => e.user_id === winnerUserId);

    if (!winnerEntry) {
      throw new Error('Winner not found in entries');
    }

    // Create winner record
    const { data: winner, error: winnerError } = await supabase
      .from('raffle_winners')
      .insert({
        user_id: winnerUserId,
        raffle_month: month,
        prize_type: 'seoul_trip',
        prize_description: '5-Day Seoul Adventure Trip - Complete Korean culture experience',
        claimed: false
      })
      .select()
      .single();

    if (winnerError) throw winnerError;

    // Award bonus points to winner
    await supabase.rpc('award_points', {
      user_uuid: winnerUserId,
      points_amount: 1000,
      transaction_action: 'raffle_winner',
      transaction_description: `Won Seoul trip raffle for ${month}`,
      reference_uuid: winner.id
    });

    // Send notification email to winner (mock implementation)
    console.log(`Congratulations email sent to ${winnerEntry.users.email}`);

    return NextResponse.json({
      success: true,
      message: 'Raffle drawing completed successfully!',
      data: {
        month,
        winner: {
          userId: winnerUserId,
          username: winnerEntry.users.username,
          country: winnerEntry.users.country_code,
          ticketsHeld: winnerEntry.tickets_count
        },
        stats: {
          totalEntries: entries.length,
          totalTickets: ticketPool.length,
          winningOdds: ((winnerEntry.tickets_count / ticketPool.length) * 100).toFixed(2)
        }
      }
    });

  } catch (error) {
    console.error('Raffle Drawing API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to conduct raffle drawing' },
      { status: 500 }
    );
  }
}