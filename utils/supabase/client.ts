import { createClient as createJsClient } from "@supabase/supabase-js";
export const supabaseBrowser = createJsClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
