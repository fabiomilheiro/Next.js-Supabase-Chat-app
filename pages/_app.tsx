import "../styles/globals.css";
import type { AppProps } from "next/app";
import useSupabase from "../utils/useSupabase";

function MyApp({ Component, pageProps }: AppProps) {
  const { profile, session, supabase } = useSupabase();

  return (
    <Component
      profile={profile}
      session={session}
      supabase={supabase}
      {...pageProps}
    />
  );
}

export default MyApp;
