import { Session, SupabaseClient } from "@supabase/supabase-js";
import { NextPage } from "next";
import { Profile } from "./types";

export interface PageContext {
  profile: Profile;
  session: Session;
  supabase: SupabaseClient;
}
