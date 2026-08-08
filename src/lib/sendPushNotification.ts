import webPush from 'web-push';
import PushSubscription from '@/models/PushSubscription';
import { connectDB } from './mongodb';

const DEFAULT_VAPID_PUBLIC_KEY = 'BMoGwGL1vbYPUVtZJuua1j0UISy8hFs3B_z24EFw16DBiUjeFFyGPyp77PyHAu9cDCJu2CADw7CmPdzmP-3yC1U';
const DEFAULT_VAPID_PRIVATE_KEY = 'uAaqDiduSpvnFa-sZxfFkBmtUIb3oTycsjLj0NZEaOE';
const DEFAULT_VAPID_SUBJECT = 'mailto:vinayaktuitionclasses76@gmail.com';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || DEFAULT_VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || DEFAULT_VAPID_SUBJECT;

webPush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

interface PushPayload {
  title: string;
  body: string;
  url: string;
}

export async function sendPushToUser(
  userId: string,
  userType: 'student' | 'staff',
  payload: PushPayload
) {
  try {
    await connectDB();
    const targetUserId = String(userId);

    const subscriptions = await PushSubscription.find({ userId: targetUserId, userType });

    if (subscriptions.length === 0) {
      console.log(`[Push Notification] No subscriptions found for user ${targetUserId} (${userType})`);
      return;
    }

    console.log(`[Push Notification] Found ${subscriptions.length} subscription(s) for user ${targetUserId} (${userType})`);

    const jsonPayload = JSON.stringify(payload);

    const sendPromises = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth
        }
      };

      try {
        console.log(`[Push Notification] Attempting to send to endpoint: ${sub.endpoint}`);
        const result = await webPush.sendNotification(pushSubscription, jsonPayload, {
          TTL: 86400, // 24 hours
          urgency: 'high',
          topic: 'vtc-alert',
          contentEncoding: 'aes128gcm',
          headers: {
            'Urgency': 'high',
            'Topic': 'vtc-alert'
          }
        });
        console.log(`[Push Notification] Success! Deployed to endpoint: ${sub.endpoint}. Status: ${result.statusCode}`);
      } catch (err: any) {
        console.error(`[Push Notification] Error sending to ${sub.endpoint}:`, err.message || err);
        if (err.statusCode === 410 || err.statusCode === 404) {
          console.log(`[Push Notification] Deleting expired/invalid subscription: ${sub.endpoint}`);
          await PushSubscription.deleteOne({ _id: sub._id });
        } else {
          console.error('[Push Notification] Non-expired push error details:', err);
        }
      }
    });

    await Promise.all(sendPromises);
  } catch (error) {
    console.error('sendPushToUser general error:', error);
  }
}
