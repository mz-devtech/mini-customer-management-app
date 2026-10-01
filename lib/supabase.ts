import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  created_at?: string;
};