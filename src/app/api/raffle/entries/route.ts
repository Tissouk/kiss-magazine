import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Get user's raffle entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7); // YYYY-MM

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's raffle entries for the month
    const { data: entry, error: entryError } = await supabase
      .from('raffle_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('raffle_month', month)
      .single();

    // Get total entries for the month (for odds calculation)
    const { data: totalEntries, error: totalError } = await supabase
      .from('raffle_entries')
      .select('tickets_count')
      .eq('raffle_month', month);

    if (totalError) throw totalError;

    const totalTickets = totalEntries?.reduce((sum, entry) => sum + entry.tickets_count, 0) || 0;
    const userTickets = entry?.tickets_count || 0;

    // Get current month raffle info
    const raffleInfo = await getRaffleInfo(month);

    // Check if user has won this month
    const { data: winner } = await supabase
      .from('raffle_winners')
      .select('*')
      .eq('user_id', user.id)
      .eq('raffle_month', month)
      .single();

    return NextResponse.json({
      success: true,
      data: {
        month,
        userTickets,
        totalTickets,
        odds: totalTickets > 0 ? ((userTickets / totalTickets) * 100).toFixed(2) : '0.00',
        hasWon: !!winner,
        winner: winner ? {
          prizeType: winner.prize_type,
          prizeDescription: winner.prize_description,
          claimed: winner.claimed,
          claimedAt: winner.claimed_at
        } : null,
        raffle: raffleInfo
      }
    });

  } catch (error) {
    console.error('Raffle Entries API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch raffle entries' },
      { status: 500 }
    );
  }
}

// Purchase additional raffle tickets with points
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketCount = 1 } = body;

    if (ticketCount < 1 || ticketCount > 10) {
      return NextResponse.json({
        success: false,
        error: 'Can purchase 1-10 tickets at a time'
      }, { status: 400 });
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const pointsCost = ticketCount * 100; // 100 points per ticket
    const currentMonth = new Date().toISOString().slice(0, 7);

    // Check if user has enough points
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('points')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    if (userProfile.points < pointsCost) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient points',
        data: {
          required: pointsCost,
          current: userProfile.points,
          needed: pointsCost - userProfile.points
        }
      }, { status: 400 });
    }

    // Redeem points
    const { data: success, error: redeemError } = await supabase.rpc('redeem_points', {
      user_uuid: user.id,
      points_amount: pointsCost,
      transaction_action: 'raffle_tickets',
      transaction_description: `Purchased ${ticketCount} Seoul trip raffle tickets`,
      reference_uuid: null
    });

    if (redeemError || !success) {
      throw redeemError || new Error('Failed to redeem points');
    }

    // Add raffle tickets
    const { data: entry, error: entryError } = await supabase
      .from('raffle_entries')
      .upsert({
        user_id: user.id,
        raffle_month: currentMonth,
        tickets_count: ticketCount
      }, {
        onConflict: 'user_id,raffle_month',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (entryError) throw entryError;

    return NextResponse.json({
      success: true,
      message: `Successfully purchased ${ticketCount} raffle tickets!`,
      data: {
        ticketsPurchased: ticketCount,
        pointsSpent: pointsCost,
        totalTickets: entry.tickets_count,
        remainingPoints: userProfile.points - pointsCost
      }
    });

  } catch (error) {
    console.error('Purchase Raffle Tickets API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to purchase raffle tickets' },
      { status: 500 }
    );
  }
}

async function getRaffleInfo(month: string) {
  const year = parseInt(month.split('-')[0]);
  const monthNum = parseInt(month.split('-')[1]);
  
  // Calculate next drawing date (last day of month)
  const nextDrawing = new Date(year, monthNum, 0); // Last day of the month
  const now = new Date();
  
  // If we're past the drawing date, it's for next month
  if (now > nextDrawing) {
    nextDrawing.setMonth(nextDrawing.getMonth() + 1);
  }

  return {
    month,
    drawingDate: nextDrawing.toISOString(),
    timeUntilDrawing: Math.max(0, nextDrawing.getTime() - now.getTime()),
    prize: {
      name: '5-Day Seoul Adventure Trip',
      description: 'Round-trip flights, 4-night hotel, cultural tours, and $1,000 shopping budget',
      estimatedValue: 3500,
      includes: [
        'Round-trip flights to Seoul',
        '4 nights at 4-star Seoul hotel',
        'Guided K-culture tours (Gangnam, Hongdae, Myeongdong)',
        '$1,000 Korean shopping budget',
        'Traditional Korean cultural experiences',
        'K-beauty and K-fashion shopping tours',
        'Korean language basics course'
      ]
    },
    rules: {
      eligibility: 'Must be 18+ and have valid passport',
      restrictions: 'Trip must be taken within 6 months of winning',
      alternatives: 'Cash equivalent available if travel not possible'
    }
  };
}