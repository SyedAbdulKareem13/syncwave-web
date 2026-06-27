import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// NEXT_PUBLIC_* vars are statically inlined at build time, so this works in the
// browser. With neither set, the app transparently falls back to LOCAL MODE.
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export function supabaseEnabled(): boolean {
  return Boolean(URL && ANON);
}

export function getSupabase(): SupabaseClient | null {
  if (!supabaseEnabled()) return null;
  if (!client) {
    client = createClient(URL as string, ANON as string, {
      auth: { persistSession: false },
      realtime: { params: { eventsPerSecond: 30 } },
    });
  }
  return client;
}
