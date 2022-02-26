import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Profile } from "./types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_API_URL!
);

const useSupabase = () => {
  const [session, setSession] = useState(supabase.auth.session());
  const [profile, setProfile] = useState<Profile>();

  supabase.auth.onAuthStateChange(async (event, session) => {
    setSession(session);
    if (!session) {
      setProfile(undefined);
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) {
        return null;
      }
      const { data, error } = await supabase
        .from<Profile>("profiles")
        .select("*")
        .eq("id", session.user.id);

      if (error) {
        console.error("Could not fetch profile.", error);
        setProfile(undefined);
      } else if (data?.length && data[0]) {
        setProfile(data[0]);
      }
    };

    fetchProfile();
  }, [session?.user?.id]);

  useEffect(() => {
    const subscribeToProfileChanges = async () => {
      if (profile) {
        await supabase
          .from<Profile>(`profiles:id=eq.${profile.id}`)
          .on("UPDATE", (payload) => {
            setProfile(payload.new);
          })
          .subscribe();
      }
    };

    subscribeToProfileChanges();
  }, [profile]);

  return { session, profile, supabase };
};

export default useSupabase;
