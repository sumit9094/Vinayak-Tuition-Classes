'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationOptIn() {
  const [showBanner, setShowBanner] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Graceful feature detection for Push notifications (PWA support check)
    const supported =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;
    
    setIsSupported(supported);

    if (!supported) return;

    // If permission is already granted, silently register/sync subscription in background
    if (Notification.permission === 'granted') {
      syncSubscription();
      return;
    }

    // If permission is denied or already dismissed in this local session, don't show banner
    const dismissed = localStorage.getItem('push_opt_in_dismissed');
    if (Notification.permission === 'denied' || dismissed === 'true') {
      return;
    }

    // Show opt-in banner after a short delay (3 seconds)
    const timer = setTimeout(() => {
      setShowBanner(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const syncSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      // If no subscription exists, create one using our VAPID public key
      if (!subscription) {
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          console.error('VAPID public key is missing.');
          return;
        }

        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });
      }

      // Send subscription object to our server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });
    } catch (err) {
      console.error('Failed to sync push subscription:', err);
    }
  };

  const handleEnable = async () => {
    setShowBanner(false);
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await syncSubscription();
      } else {
        localStorage.setItem('push_opt_in_dismissed', 'true');
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Suppress showing the banner for the current session/local storage
    localStorage.setItem('push_opt_in_dismissed', 'true');
  };

  if (!isSupported || !showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-4 right-4 z-[9999] max-w-sm w-[calc(100vw-2rem)] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md shadow-xl flex flex-col space-y-3"
      >
        <div className="flex items-start justify-between space-x-3">
          <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div className="flex-1 text-left">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Enable Alerts
            </h4>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Get real-time updates about marks, attendance, and fee alerts directly on your device.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-1">
          <button
            onClick={handleDismiss}
            className="px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            Not Now
          </button>
          <button
            onClick={handleEnable}
            className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all"
          >
            Enable
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
