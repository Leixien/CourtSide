/**
 * Push Subscription API
 * POST /api/user/push-subscription - Save user's push notification subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request.headers);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const subscription = await request.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription' },
        { status: 400 }
      );
    }

    await connectDB();

    await User.findByIdAndUpdate(user.userId, {
      pushSubscription: subscription,
      notificationsEnabled: true,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Save push subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}
