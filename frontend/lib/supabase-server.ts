import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** URL pública del proyecto remesa-blink (Supabase). */
const PROJECT_URL = "https://mfvubhgquumuudnoyiat.supabase.co";

declare global {
  // eslint-disable-next-line no-var
  var __pilotoSupabase: SupabaseClient | undefined;
  // eslint-disable-next-line no-var
  var __pilotoSupabaseAdmin: SupabaseClient | undefined;
}

/** Clave anon publicable (Dashboard → API). Override con SUPABASE_ANON_KEY en Vercel. */
const DEFAULT_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdnViaGdxdXVtdXVkbm95aWF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMDc5OTQsImV4cCI6MjA5Nzg4Mzk5NH0.3PcW2pPh6ueVJ9SaLF4WLycvFjP2bu__UXvu_IOY0Vw";

function getSupabase(): SupabaseClient {
  if (global.__pilotoSupabase) {
    return global.__pilotoSupabase;
  }
  const url = process.env.SUPABASE_URL?.trim() || PROJECT_URL;
  const key = process.env.SUPABASE_ANON_KEY?.trim() || DEFAULT_ANON_KEY;
  global.__pilotoSupabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return global.__pilotoSupabase;
}

/**
 * Preferir service role en el servidor para INSERT … RETURNING (RLS anon solo permite INSERT sin SELECT).
 * Si no hay service role, cae a anon (insert sin id).
 */
function getSupabaseAdmin(): SupabaseClient | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!serviceKey) return null;
  if (global.__pilotoSupabaseAdmin) {
    return global.__pilotoSupabaseAdmin;
  }
  const url = process.env.SUPABASE_URL?.trim() || PROJECT_URL;
  global.__pilotoSupabaseAdmin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return global.__pilotoSupabaseAdmin;
}

export { getSupabase, getSupabaseAdmin };
