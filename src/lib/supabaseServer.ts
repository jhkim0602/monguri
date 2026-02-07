import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabaseKey = serviceRoleKey ?? publishableKey;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase server environment variables.");
}

export const supabaseServer = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export const isServiceRole = Boolean(serviceRoleKey);
