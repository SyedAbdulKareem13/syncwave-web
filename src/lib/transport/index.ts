import { supabaseEnabled } from "../supabase/client";
import { BroadcastChannelTransport } from "./BroadcastChannelTransport";
import { SupabaseTransport } from "./SupabaseTransport";
import type { Transport } from "./Transport";

/**
 * Pick the transport based on environment:
 *  • Supabase vars present → cross-device sync via Supabase Realtime.
 *  • otherwise            → same-browser sync via BroadcastChannel (local mode).
 */
export function createTransport(channelName: string, presenceKey: string): Transport {
  if (supabaseEnabled()) return new SupabaseTransport(channelName, presenceKey);
  return new BroadcastChannelTransport(channelName);
}

export * from "./Transport";
