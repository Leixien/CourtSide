/**
 * Player Statistics API
 * GET /api/matches/[id]/stats - Fetch player statistics for a match
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PlayerStats from '@/models/PlayerStats';
import Match from '@/models/Match';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await connectDB();

    // Get match to verify it exists
    const match = await Match.findById(id);
    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    // Get player stats for this match
    const stats = await PlayerStats.find({ matchId: id })
      .sort({ points: -1 }) // Sort by points descending
      .lean();

    // Group by team
    const homeStats = stats.filter(s => s.teamName === match.homeTeam.name);
    const awayStats = stats.filter(s => s.teamName === match.awayTeam.name);

    return NextResponse.json({
      match: {
        id: match._id,
        homeTeam: match.homeTeam.name,
        awayTeam: match.awayTeam.name,
      },
      stats: {
        home: homeStats,
        away: awayStats,
      },
      lastUpdate: stats[0]?.lastUpdate || new Date(),
    });

  } catch (error: any) {
    console.error('Fetch stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
