/**
 * Notification Setup Component
 * Prompts users to enable push notifications
 */

'use client';

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  isPushSupported,
  requestNotificationPermission,
  subscribeToPush,
  getPushSubscription,
} from '@/lib/push-notifications';

export default function NotificationSetup() {
  const { isAuthenticated, getAuthHeaders } = useAuth();
  const [show, setShow] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    checkNotificationStatus();
  }, [isAuthenticated]);

  const checkNotificationStatus = async () => {
    if (!isAuthenticated || !isPushSupported()) {
      return;
    }

    const currentPermission = Notification.permission;
    setPermission(currentPermission);

    // Show prompt if notifications are not enabled
    if (currentPermission === 'default') {
      const subscription = await getPushSubscription();
      if (!subscription) {
        setShow(true);
      }
    }
  };

  const handleEnableNotifications = async () => {
    try {
      const permission = await requestNotificationPermission();
      setPermission(permission);

      if (permission === 'granted') {
        const subscription = await subscribeToPush();

        if (subscription) {
          // Send subscription to server
          await fetch('/api/user/push-subscription', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(subscription.toJSON()),
          });

          setShow(false);
        }
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
    }
  };

  if (!show || !isAuthenticated || !isPushSupported()) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white dark:bg-slate-800 rounded-lg shadow-2xl p-4 border border-gray-200 dark:border-slate-700 z-50 animation-fade-in">
      <button
        onClick={() => setShow(false)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
          <Bell className="w-6 h-6 text-primary-500" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Enable Notifications
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Get instant alerts when your favorite players make a play during live matches
          </p>

          <button
            onClick={handleEnableNotifications}
            className="w-full bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition font-medium"
          >
            Enable Notifications
          </button>
        </div>
      </div>
    </div>
  );
}
