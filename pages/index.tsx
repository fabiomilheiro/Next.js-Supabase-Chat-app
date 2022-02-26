import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { LogInButton } from "../components/AuthButtons";
import { Chat } from "../components/Chat";
import styles from "../styles/Home.module.css";
import { PageContext } from "../utils/pages";

const Home: NextPage<PageContext> = ({ profile, session, supabase }) => {
  return (
    <>
      <Head>
        <title>Supabase chat</title>
      </Head>

      <Chat profile={profile} session={session} supabase={supabase} />
    </>
  );
};

export default Home;
