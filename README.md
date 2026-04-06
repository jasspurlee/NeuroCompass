# NeuroCompass

NeuroCompass is a mobile-first React and Supabase app for stroke survivors and caregivers. It focuses on orientation, low-friction reminders, and quick memory notes with an intentionally simple healthcare interface.

## Features

- Home dashboard with current date and time, next task, and large action buttons
- Orientation screen with current time, date, last completed task, and next activity
- Reminder system for medication, appointments, and daily tasks
- Conversation memory notes with automatic timestamps
- Caregiver access pattern with shared reminder list
- Supabase authentication and shared household data model
- Caregiver invite code flow for joining a shared household
- Installable PWA shell with offline caching
- Browser notification scheduling as a lightweight fallback
- Web push subscription plumbing for production delivery

## Tech stack

- React
- Vite
- Supabase
- React Router

## Local setup

1. Install Node.js 20+.
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env` and fill in your Supabase project values.
4. Apply the SQL in [supabase/schema.sql](/Users/jaredspurlock/Documents/NeuroCompass/supabase/schema.sql) inside the Supabase SQL editor.
5. Start the app:

```bash
npm run dev
```

## Supabase notes

- Create user accounts in Supabase Auth for both survivor and caregiver.
- Each new account gets a household code. Survivors can create invite codes and caregivers can join that shared household from the app.
- The frontend runs in demo mode automatically when Supabase environment variables are missing.

## Push notifications

NeuroCompass now supports two notification paths:

- Local browser scheduling for reminders already loaded in the app
- Remote web push subscriptions stored in Supabase for device-level alerts

### Web push setup

1. Generate VAPID keys.
2. Put the public key in `.env` as `VITE_VAPID_PUBLIC_KEY`.
3. Add these Supabase function secrets:
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT`
4. Deploy [supabase/functions/send-reminder-push/index.ts](/Users/jaredspurlock/Documents/NeuroCompass/supabase/functions/send-reminder-push/index.ts).
5. Trigger that function when a reminder is due, passing `household_id`, `reminder_id`, `title`, and `message`.

Device subscriptions are stored in the `push_subscriptions` table defined in [supabase/schema.sql](/Users/jaredspurlock/Documents/NeuroCompass/supabase/schema.sql).

## PWA

- The app registers a service worker from [public/sw.js](/Users/jaredspurlock/Documents/NeuroCompass/public/sw.js).
- Install metadata lives in [public/manifest.webmanifest](/Users/jaredspurlock/Documents/NeuroCompass/public/manifest.webmanifest).
- The current manifest uses the SVG app icon in [public/icons/icon.svg](/Users/jaredspurlock/Documents/NeuroCompass/public/icons/icon.svg). Add platform-specific PNG exports if you need stricter store/device compatibility.
