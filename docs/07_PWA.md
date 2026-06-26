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
Whenever a significant action happens (e.g., an Announcement is created), we trigger a push to all users.

Inside `src/actions/announcements.ts`:
```typescript
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function addAnnouncement(data: FormData) {
  // 1. Insert announcement into Supabase...
  
  // 2. Fetch all subscriptions from the push_subscriptions table
  const { data: subs } = await supabase.from('push_subscriptions').select('*');
  
  // 3. Send notifications in parallel
  const payload = JSON.stringify({ 
    title: 'New Announcement!', 
    body: data.get('title'),
    url: '/main/student/announcements'
  });

  await Promise.all(subs.map(async (sub) => {
    try {
      await webpush.sendNotification({
        endpoint: sub.endpoint,
        keys: { auth: sub.auth, p256dh: sub.p256dh }
      }, payload);
    } catch (e) {
      // If error is 410 (Gone), the user unsubscribed. Delete it from DB.
    }
  }));
}
```

---

## Important Constraints & Best Practices

1. **iOS Requirements:** On iPhones, Web Push is ONLY available if the user taps "Share" > "Add to Home Screen". You cannot even request permission in the standard Safari browser tab.
2. **Notification Fatigue:** Do not send push notifications for global chat messages, as this will quickly annoy users. Restrict them to high-value events:
   - Faculty Announcements
   - Lost & Found Items
   - Direct mention/replies (if implemented later)
3. **Clean Up Dead Subscriptions:** Browsers routinely cycle push endpoints. If `webpush.sendNotification` throws a `410 Gone` error, you must delete that subscription row from your database to keep things fast.

