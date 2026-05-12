import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Server-only Supabase client that uses the service role key. Bypasses
// RLS, so it MUST only be used inside API routes (never imported into a
// client component). Used for trusted payment verification + writes
// where the user's auth session can't be relied on (e.g. the MyFatoorah
// callback runs without a logged-in session).

let adminClient: SupabaseClient<Database> | null = null;

export function getSupabaseAdminClient(): SupabaseClient<Database> {
  if (adminClient) return adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY (and NEXT_PUBLIC_SUPABASE_URL) must be set " +
        "for server-side payment verification. Add it to .env.local and to " +
        "the Vercel project's environment variables."
    );
  }

  adminClient = createClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return adminClient;
}
