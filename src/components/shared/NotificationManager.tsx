"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";
import { savePushSubscription } from "@/actions/pushActions";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function NotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.register('/sw.js').then(() => {
        setIsSupported(true);
        checkSubscription();
      }).catch((err) => {
        console.error("SW registration failed", err);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.error("Error checking subscription:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribe = async () => {
    setIsLoading(true);
    try {
      // Request permission if not granted
      if (Notification.permission !== "granted") {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          toast.error("Notification permission denied");
          setIsLoading(false);
          return;
        }
      }

      const registration = await navigator.serviceWorker.ready;
      
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicVapidKey) throw new Error("VAPID key not configured");

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });

      const payload = JSON.parse(JSON.stringify(subscription));
      const res = await savePushSubscription(payload);
      
      if (res.error) {
        toast.error("Failed to save subscription: " + res.error);
      } else {
        setIsSubscribed(true);
        toast.success("Push notifications enabled!");
      }
    } catch (err: any) {
      console.error("Failed to subscribe:", err);
      toast.error(err.message || "Failed to subscribe to notifications");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported || isLoading) return null;

  if (isSubscribed) return null; // Hide if already subscribed

  return (
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50">
      <button
        onClick={subscribe}
        className="flex items-center gap-2 px-4 py-3 bg-button-primary hover:bg-primary-hover text-text-primary rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all group"
      >
        <Bell className="w-4 h-4 group-hover:rotate-12 transition-transform" />
        <span className="text-sm font-bold">Enable Notifications</span>
      </button>
    </div>
  );
}
