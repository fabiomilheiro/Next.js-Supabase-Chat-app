import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { Auth } from "../components/Auth";
import { Chat } from "../components/Chat";
import styles from "../styles/Home.module.css";
import { PageContext } from "../utils/pages";

const Home: NextPage<PageContext> = ({ session, supabase }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    setLoggedIn(!!session);
  }, [session]);
  return (
    <div className={styles.container}>
      <Head>
        <title>Supabase chat</title>
      </Head>

      <main className={styles.main}>
        {loggedIn ? <Chat supabase={supabase} /> : <Auth supabase={supabase} />}
      </main>
    </div>
  );
};

export default Home;
