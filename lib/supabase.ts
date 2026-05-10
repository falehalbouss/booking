"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export type AppSupabaseClient = SupabaseClient<Database>;

let client: AppSupabaseClient | null = null;

// Use the plain @supabase/supabase-js browser client with localStorage for
// session persistence. The previous @supabase/ssr cookie-based client
// silently failed on networks/browsers that block third-party cookies or
// strip the cross-site Set-Cookie header (Edge ITP, Safari ITP, Brave,
// strict-mode Chrome, corporate proxies). Using localStorage means we
// only need a successful fetch response — no cross-domain cookies.
export function getSupabaseBrowserClient(): AppSupabaseClient {
  if (client) return client;
  client = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storage:
          typeof window !== "undefined" ? window.localStorage : undefined,
        storageKey: "layali-auth",
      },
    }
  );
  return client;
}
