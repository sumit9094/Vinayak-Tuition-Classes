import { NextResponse } from 'next/server';
import webPush from 'web-push';
import { connectDB } from '@/lib/mongodb';
import PushSubscription from '@/models/PushSubscription';

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

export async function GET() {
  try {
    await connectDB();
    const subscriptions = await PushSubscription.find({});
    
    if (subscriptions.length === 0) {
      return NextResponse.json({ message: 'No subscriptions found in DB' });
    }

    const payload = JSON.stringify({
      title: '🔔 Vinayak Tuition Trial Test Notification',
      body: 'Testing background push notification! Please check your mobile notification bar.',
      url: '/student/dashboard'
    });

    const results = await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth
            }
          };
          const res = await webPush.sendNotification(pushSubscription, payload, {
            TTL: 86400,
            urgency: 'high',
            contentEncoding: 'aes128gcm'
          });
          return { endpoint: sub.endpoint, status: res.statusCode };
        } catch (err: any) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await PushSubscription.deleteOne({ _id: sub._id });
          }
          return { endpoint: sub.endpoint, error: err.message || String(err) };
        }
      })
    );

    return NextResponse.json({ success: true, count: subscriptions.length, results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
