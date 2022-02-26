import { Session, SupabaseClient } from "@supabase/supabase-js";
import { NextPage } from "next";

export interface PageContext {
  session: Session;
  supabase: SupabaseClient;
}
