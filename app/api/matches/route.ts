/**
 * Matches API
 * GET /api/matches - Fetch matches with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Match from '@/models/Match';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // live, scheduled, finished
    const sport = searchParams.get('sport');
    const league = searchParams.get('league');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    await connectDB();

    // Build query
    const query: any = {};
    if (status) query.status = status;
    if (sport) query.sport = sport;
    if (league) query.league = league;

    // Fetch matches
    const matches = await Match.find(query)
      .sort({ startTime: status === 'finished' ? -1 : 1 })
      .limit(Math.min(limit, 100)) // Cap at 100 for free tier
      .skip(skip)
      .lean();

    const total = await Match.countDocuments(query);

    return NextResponse.json({
      matches,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + matches.length < total,
      },
    });
  } catch (error: any) {
    console.error('Fetch matches error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}
