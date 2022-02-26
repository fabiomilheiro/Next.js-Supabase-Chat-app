import { Box, Grid, Typography } from "@mui/material";
import { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Message, Profile } from "../utils/types";

interface Props {
  supabase: SupabaseClient;
}

export const Chat = ({ supabase }: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from<Message>("messages")
        .select("*");

      setMessages(data || []);
    };

    fetchProfiles();
  }, [supabase, setMessages]);

  useEffect(() => {
    const setUpMessagesSubscription = () => {
      return supabase
        .from<Message>("messages")
        .on("*", (payload) => {
          if (payload.eventType === "INSERT") {
            setMessages((previous) => [...previous, payload.new]);
          } else if (payload.eventType === "UPDATE") {
            setMessages((previous) => {
              const state = [...previous];
              const updatedMessage = payload.new;
              const index = state.findIndex((m) => m.id === updatedMessage.id);
              state[index] = updatedMessage;
              return state;
            });
          }
        })
        .subscribe();
    };

    setUpMessagesSubscription();
  }, [supabase]);
  return (
    <>
      <Typography variant="h3" sx={{ mb: 3 }}>
        Chat
      </Typography>
      <Grid container>
        <Grid item xs={12}>
          {messages.map((message) => (
            <Box key={message.id}>{message.content}</Box>
          ))}
        </Grid>
      </Grid>
    </>
  );
};
