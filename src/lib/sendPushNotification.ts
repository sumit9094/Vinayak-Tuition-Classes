import webPush from 'web-push';
import PushSubscription from '@/models/PushSubscription';
import { connectDB } from './mongodb';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:vinayaktuitionclasses76@gmail.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
} else {
  console.warn('VAPID keys not configured. Push notifications will be disabled.');
}

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

    const subscriptions = await PushSubscription.find({ userId, userType });

    if (subscriptions.length === 0) return;

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
        await webPush.sendNotification(pushSubscription, jsonPayload);
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          console.log(`Deleting expired push subscription: ${sub.endpoint}`);
          await PushSubscription.deleteOne({ _id: sub._id });
        } else {
          console.error('Error sending push notification:', err);
        }
      }
    });

    await Promise.all(sendPromises);
  } catch (error) {
    console.error('sendPushToUser general error:', error);
  }
}
