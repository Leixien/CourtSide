/**
 * Push Notification Service
 * Sends push notifications to users via Web Push API
 * Note: Requires web-push package (npm install web-push)
 */

import webpush from 'web-push';
import User from '@/models/User';
import PlayerEvent from '@/models/PlayerEvent';
import connectDB from '@/lib/mongodb';

// Configure VAPID details (generate with: npx web-push generate-vapid-keys)
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:noreply@courtside.app',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  matchId?: string;
  playerId?: string;
}

/**
 * Send push notification to a single user
 */
export async function sendPushToUser(
  userId: string,
  payload: NotificationPayload
): Promise<boolean> {
  try {
    await connectDB();

    const user = await User.findById(userId);
    if (!user || !user.pushSubscription || !user.notificationsEnabled) {
      return false;
    }

    await webpush.sendNotification(
      user.pushSubscription,
      JSON.stringify(payload)
    );

    return true;
  } catch (error: any) {
    console.error('Failed to send push notification:', error);

    // Remove invalid subscriptions
    if (error.statusCode === 410) {
      await User.findByIdAndUpdate(userId, {
        $unset: { pushSubscription: '' },
      });
    }

    return false;
  }
}

/**
 * Send push notification to multiple users
 */
export async function sendPushToUsers(
  userIds: string[],
  payload: NotificationPayload
): Promise<number> {
  let successCount = 0;

  await Promise.all(
    userIds.map(async (userId) => {
      const sent = await sendPushToUser(userId, payload);
      if (sent) successCount++;
    })
  );

  return successCount;
}

/**
 * Notify users about player events
 */
export async function notifyPlayerEvent(
  playerId: string,
  matchId: string,
  eventDescription: string,
  playerName: string
): Promise<void> {
  try {
    await connectDB();

    // Find users who have this player as favorite
    const users = await User.find({
      favoritePlayers: playerId,
      notificationsEnabled: true,
      pushSubscription: { $exists: true },
    });

    if (users.length === 0) {
      return;
    }

    const payload: NotificationPayload = {
      title: `${playerName} - Live Update`,
      body: eventDescription,
      icon: '/icon-192.png',
      url: `/matches/${matchId}`,
      matchId,
      playerId,
    };

    const userIds = users.map((u) => u._id.toString());
    const sentCount = await sendPushToUsers(userIds, payload);

    // Log the event
    await PlayerEvent.findOneAndUpdate(
      { matchId, playerId, eventDescription },
      {
        $set: { notificationSent: true },
        $addToSet: { notifiedUsers: { $each: userIds } },
      }
    );

    console.log(`Sent ${sentCount} notifications for ${playerName} event`);
  } catch (error) {
    console.error('Failed to notify player event:', error);
  }
}

export default {
  sendPushToUser,
  sendPushToUsers,
  notifyPlayerEvent,
};
