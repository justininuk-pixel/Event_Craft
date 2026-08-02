import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const isServer = typeof window === "undefined";
const activeKey = (isServer && serviceRoleKey) ? serviceRoleKey : supabaseAnonKey;

if (!supabaseUrl || !activeKey) {
  console.warn(
    "Supabase credentials missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY/SUPABASE_SERVICE_ROLE_KEY are set in environment variables."
  );
}

export const supabase = createClient(supabaseUrl, activeKey, {
  auth: {
    persistSession: !isServer,
    autoRefreshToken: !isServer,
  },
});
