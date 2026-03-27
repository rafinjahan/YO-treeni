import { createClient } from "@supabase/supabase-js";

// Ensure environment variables are present, else fallback for SSR builds
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "anon";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
