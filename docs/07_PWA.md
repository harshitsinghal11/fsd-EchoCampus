# Progressive Web App (PWA) & Push Notifications

This document outlines the detailed technical implementation that **is currently active** in the EchoCampus repository, converting it into an installable Progressive Web App (PWA) that supports native push notifications on Mobile (iOS/Android) and Desktop (Windows/Mac).

---

## Part 1: The PWA Foundation (Installable App)

To make the app installable, browsers require three things: secure context (HTTPS), a Web App Manifest, and a Service Worker.

### Step 1: Generate App Icons
1. Design a 512x512 logo for EchoCampus (e.g., using a high-resolution version of the current icon).
2. Generate the following icon sizes and place them in the `public/icons/` directory:
   - `icon-192x192.png`
   - `icon-512x512.png`
   - `apple-touch-icon.png` (specifically for iOS).

### Step 2: Create the Web App Manifest
In Next.js App Router, you can use a `manifest.ts` file in the root `app/` directory.

```typescript
// app/manifest.ts
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EchoCampus',
    short_name: 'EchoCampus',
    description: 'The unified campus platform for students and faculty.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a', // Tailwind slate-900
    theme_color: '#0f172a',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
```

### Step 3: Install and Configure Serwist (Service Worker)
`serwist/next` is the modern, actively maintained successor to `next-pwa` built for Next.js App Router.

1. Install the packages:
   ```bash
   npm install @serwist/next @serwist/window
   npm install -D serwist
   ```

2. Update `next.config.mjs`:
   ```javascript
   import withSerwistInit from "@serwist/next";

   const withSerwist = withSerwistInit({
     swSrc: "app/sw.ts",
     swDest: "public/sw.js",
     disable: process.env.NODE_ENV === "development",
   });

   export default withSerwist({
     // your existing next config
   });
   ```

3. Create the Service Worker entry `app/sw.ts`:
   ```typescript
   import { defaultCache } from "@serwist/next/worker";
   import { Serwist } from "serwist";

   const serwist = new Serwist({
     precacheEntries: self.__SW_MANIFEST,
     skipWaiting: true,
     clientsClaim: true,
     navigationPreload: true,
     runtimeCaching: defaultCache,
   });

   serwist.addEventListeners();
   ```

At this point, the app is fully installable on devices!

---

## Part 2: Push Notifications System

Web Push notifications require a backend to store subscriptions and a library to encrypt and send the push payloads via the browser vendor's push service.

### Step 4: Generate VAPID Keys
VAPID keys identify your server to the push services (like Apple and Google).
1. Install `web-push`:
   ```bash
   npm install web-push
   npm install -D @types/web-push
   ```
2. Run the generator script in your terminal:
   ```bash
   npx web-push generate-vapid-keys
   ```
3. Add the generated keys to your `.env.local`:
   ```env
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
   VAPID_PRIVATE_KEY=your_private_key
   ```

### Step 5: Database Updates (Supabase)
Create a new table in Supabase to store user subscriptions so you know *where* to send the notifications.

```sql
CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);
```

### Step 6: Request Permissions & Save Subscription
Create a UI component (or use an existing Dashboard layout) to ask the user for permission.

1. **Ask for permission:** `Notification.requestPermission()`.
2. **Subscribe via Service Worker:** 
   ```typescript
   const registration = await navigator.serviceWorker.ready;
   const subscription = await registration.pushManager.subscribe({
     userVisibleOnly: true,
     applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
   });
   ```
3. **Send to Supabase:** Call a Server Action (`saveSubscription(subscription)`) that inserts the data into the `push_subscriptions` table.

### Step 7: Listening for Push Events in Service Worker
Update `app/sw.ts` to listen for incoming push events and show them to the user:

```typescript
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'EchoCampus Notification';
  const options = {
    body: data.body || 'You have a new notification.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: data.url // Optional URL to open when clicked
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle clicking on the notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.notification.data) {
    event.waitUntil(clients.openWindow(event.notification.data));
  }
});
```

### Step 8: Triggering Notifications from Server Actions
Whenever a significant action happens, we trigger a push to all users via our centralized utility.

Inside `src/utils/pushUtility.ts`:
```typescript
import { createSupabaseAdminClient } from "@/utils/supabaseAdmin";
import webpush from "web-push";

// ... vapid setup

export async function sendPushNotificationBroadcast(payloadObj: { title: string; body: string; url: string; }) {
  // 1. Fetch subscriptions using Admin Client (bypassing RLS)
  // 2. Iterate and await Promise.all(subs.map(...))
  // 3. Catch 404/410 errors and delete stale subscriptions from the DB
}
```

We integrate this utility across all major features:
- **Announcements** (`src/actions/announcementActions.ts`)
- **Complaints** (`src/actions/complaintActions.ts`)
- **Marketplace** (`src/actions/marketplaceActions.ts`)
- **Lost & Found** (`src/actions/lostFoundActions.ts`)
- **Anonymous Chat** (`src/actions/chatActions.ts`) - Uses a **15-minute smart cooldown** logic.

---

## Important Constraints & Best Practices

1. **Development Environment:** The Service Worker is explicitly disabled in `next.config.ts` when `process.env.NODE_ENV === "development"`. This prevents Next.js Turbopack from entering an infinite compilation loop when `public/sw.js` is updated. To test push notifications locally, you must run `npm run build && npm start`.
2. **iOS Requirements:** On iPhones, Web Push is ONLY available if the user taps "Share" > "Add to Home Screen". You cannot request permission in the standard Safari browser tab.
3. **Notification Fatigue (Chat Cooldown):** To prevent severe notification spam from the global Anonymous Chat, we implement a **15-minute debounce cooldown**. The server action checks the timestamp of the previous message and only broadcasts a push notification if the chat has been inactive for at least 15 minutes. 
4. **Clean Up Dead Subscriptions:** The `pushUtility.ts` automatically deletes a subscription row from the database if `webpush.sendNotification` throws a `410 Gone` error.

