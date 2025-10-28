/**
 * Manual Sync Endpoint
 * GET /api/sync/live-matches - Sincronizza manualmente i match live
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Match from '@/models/Match';
import { fetchLiveMatches, fetchUpcomingMatches } from '@/lib/sports-api';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Sync live matches
    const liveMatches = await fetchLiveMatches('basketball');
    let liveCount = 0;

    for (const matchData of liveMatches) {
      await Match.findOneAndUpdate(
        { externalId: matchData.externalId },
        {
          ...matchData,
          lastUpdate: new Date(),
        },
        { upsert: true }
      );
      liveCount++;
    }

    // Sync upcoming matches
    const upcomingMatches = await fetchUpcomingMatches('basketball');
    let upcomingCount = 0;

    for (const matchData of upcomingMatches) {
      await Match.findOneAndUpdate(
        { externalId: matchData.externalId },
        {
          ...matchData,
          lastUpdate: new Date(),
        },
        { upsert: true }
      );
      upcomingCount++;
    }

    return NextResponse.json({
      success: true,
      synced: {
        live: liveCount,
        upcoming: upcomingCount,
        total: liveCount + upcomingCount,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
