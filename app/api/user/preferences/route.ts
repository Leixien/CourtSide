/**
 * User Preferences API
 * GET /api/user/preferences - Get user preferences
 * PUT /api/user/preferences - Update user preferences (favorite teams/players)
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request.headers);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const userDoc = await User.findById(user.userId)
      .populate('favoriteTeams')
      .lean();

    if (!userDoc) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      favoriteTeams: userDoc.favoriteTeams,
      favoritePlayers: userDoc.favoritePlayers,
      notificationsEnabled: userDoc.notificationsEnabled,
    });
  } catch (error: any) {
    console.error('Fetch preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request.headers);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { favoriteTeams, favoritePlayers, notificationsEnabled } = await request.json();

    await connectDB();

    const updateData: any = {};
    if (favoriteTeams !== undefined) updateData.favoriteTeams = favoriteTeams;
    if (favoritePlayers !== undefined) updateData.favoritePlayers = favoritePlayers;
    if (notificationsEnabled !== undefined) updateData.notificationsEnabled = notificationsEnabled;

    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      updateData,
      { new: true }
    ).populate('favoriteTeams');

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      favoriteTeams: updatedUser.favoriteTeams,
      favoritePlayers: updatedUser.favoritePlayers,
      notificationsEnabled: updatedUser.notificationsEnabled,
    });
  } catch (error: any) {
    console.error('Update preferences error:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
