import { createClient, SupabaseClient } from "@supabase/supabase-js";

const globalForSupabase = global as unknown as { supabase: SupabaseClient };

export const supabase =
  globalForSupabase.supabase ||
  createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_KEY as string
  );

if (process.env.NODE_ENV !== "production")
  globalForSupabase.supabase = supabase;
