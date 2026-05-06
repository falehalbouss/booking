# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Layali Hotel (`فندق ليالي`) — a bilingual (Arabic + English) hotel booking site built with Next.js 14 App Router, TypeScript, Tailwind, and Supabase.

## Commands

- `npm run dev` — start dev server (Next.js)
- `npm run build` — production build (will fail at prerender if Supabase env vars are missing — see below)
- `npm start` — serve the production build

There is no lint or test script.

## Required environment variables

Both must be set wherever the app runs (`.env.local` for dev, Vercel project settings for deploy). Build-time prerender will fail without them because [lib/supabase.ts](lib/supabase.ts) reads them with `!` at module load:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Architecture

### Single-context data layer

All client-side state — Supabase auth session, profile, bookings list, and the booking/auth actions — lives in one provider in [lib/store.tsx](lib/store.tsx) (`BookingProvider`), mounted once in [app/layout.tsx](app/layout.tsx). Pages consume it via two hooks from the same module:

- `useAuth()` — `user`, `isSignedIn`, `loading`, `signIn`, `signUp`, `signOut`
- `useBookings()` — everything above plus `bookings`, `addBooking`, `getBooking`

When you add a new auth- or booking-related concern, extend `AppContextValue` and both hooks rather than introducing a parallel store. The context auto-reloads bookings on `supabase.auth.onAuthStateChange`.

### Browser-only Supabase

This project uses `@supabase/ssr`'s **browser** client only — there is no server client, no middleware, and no server actions. Every page that needs data is `"use client"` and reads through `getSupabaseBrowserClient()` (memoized singleton in [lib/supabase.ts](lib/supabase.ts)). RLS is the only access boundary.

### Static rooms, dynamic bookings

Rooms are hardcoded in [lib/rooms.ts](lib/rooms.ts) (id, bilingual names, price in SAR, capacity, Unsplash image). They are **not** in the database. The `bookings` table stores `room_id` plus a denormalized snapshot of `room_name_en`/`room_name_ar` so booking history survives changes to the static room list. Use `findRoom(id)` to resolve a room by id; never assume the list is fetched.

### Database schema

Generated types live in [lib/database.types.ts](lib/database.types.ts) (regenerate via the Supabase MCP `generate_typescript_types` after migrations — do not hand-edit).

- `profiles` — one row per auth user (`id` = `auth.users.id`, `name`, `email`)
- `bookings` — references `profiles(id)` via `user_id`; carries the room snapshot fields and a human-readable `ref` like `LH-1234` generated client-side in `addBooking`

`rowToBooking` in [lib/store.tsx](lib/store.tsx) is the single mapper between the snake_case DB row and the camelCase `Booking` domain type.

### Bilingual UI convention

Every user-facing string is shown in both Arabic and English in the same view (often on the same line, separated by `·`). Arabic text uses `dir="rtl"` on the relevant element. Room data has parallel `nameEn`/`nameAr` and `descEn`/`descAr` fields — keep that pattern when adding new content.

### Tailwind design tokens

Custom palette in [tailwind.config.ts](tailwind.config.ts): `brand` (terracotta), `accent` (forest green), `sand` (warm beige), `ink` (near-black text + muted). Fonts are loaded via `next/font` in [app/layout.tsx](app/layout.tsx) and exposed as the `font-sans` (Inter) / `font-serif` (Playfair Display) Tailwind families. Use these tokens instead of raw hex values.

### Path alias

`@/*` maps to the repo root (see [tsconfig.json](tsconfig.json)) — import as `@/lib/store`, `@/components/Header`, etc.

## Deployment

The project deploys to Vercel (project `booking` under `falehalbouss-projects`). The most common deploy failure is missing Supabase env vars on Vercel — symptom is `@supabase/ssr: Your project's URL and API key are required` during prerender of `/signup`, `/book`, or `/_not-found`. Fix by setting the two env vars above for Production/Preview/Development, then redeploy.
