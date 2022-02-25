import "../styles/globals.css";
import type { AppProps } from "next/app";
import useSupabase from "../utils/useSupabase";

function MyApp({ Component, pageProps }: AppProps) {
  const { session, supabase } = useSupabase();

  return <Component session={session} supabase={supabase} {...pageProps} />;
}

export default MyApp;
