import { createClient } from "@supabase/supabase-js";
import { useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_API_URL!
);

const useSupabase = () => {
  const [session, setSession] = useState(supabase.auth.session());

  supabase.auth.onAuthStateChange(async (event, session) => {
    setSession(session);
  });

  return { session, supabase };
};

export default useSupabase;
