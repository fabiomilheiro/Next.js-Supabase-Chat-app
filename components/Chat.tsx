import {
  Badge,
  Box,
  Collapse,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Message } from "../utils/types";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import { TransitionGroup } from "react-transition-group";

interface Props {
  supabase: SupabaseClient;
}

export const Chat = ({ supabase }: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from<Message>("messages")
        .select("*")
        .order("id");

      if (error) {
        console.error(error);
      }
      setMessages(data || []);
    };

    fetchMessages();
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
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<MessageForm>();

  return (
    <>
      <Box sx={{ width: "100%" }}>
        <Typography variant="h3" sx={{ mb: 3 }}>
          Chat
        </Typography>
      </Box>
      <Grid container alignItems="stretch">
        <Grid xs={12} md={6}>
          <List>
            <TransitionGroup>
              {messages.map((message) => (
                <Collapse key={message.id} in={true}>
                  <ListItem
                    alignItems="flex-start"
                    secondaryAction={
                      <>
                        {!message.isDeleted && (
                          <IconButton
                            onClick={async () => {
                              await supabase
                                .from<Message>("messages")
                                .update({ likes: message.likes + 1 })
                                .eq("id", message.id);
                            }}
                          >
                            <Badge
                              badgeContent={
                                message.likes ? message.likes : undefined
                              }
                              color="primary"
                            >
                              <ThumbUpIcon />
                            </Badge>
                          </IconButton>
                        )}
                        {!message.isDeleted && (
                          <IconButton
                            onClick={async () => {
                              await supabase
                                .from<Message>("messages")
                                .update({
                                  content: "",
                                  isDeleted: true,
                                })
                                .eq("id", message.id);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </>
                    }
                  >
                    <ListItemText>
                      {!message.isDeleted ? (
                        message.content
                      ) : (
                        <Box sx={{ fontStyle: "italic", color: "Gray" }}>
                          (deleted)
                        </Box>
                      )}
                    </ListItemText>
                  </ListItem>
                </Collapse>
              ))}
            </TransitionGroup>
          </List>

          <Box>
            <form
              autoComplete="off"
              onSubmit={handleSubmit(async (data) => {
                const newMessage: Message = {
                  content: data.message,
                  userId: supabase.auth.user()?.id!,
                  isDeleted: false,
                  likes: 0,
                };
                await supabase.from<Message>("messages").insert(newMessage);
                reset();
              })}
            >
              <Box>
                <TextField
                  label="Message"
                  fullWidth
                  {...register("message", { required: true, maxLength: 200 })}
                  helperText={
                    (errors.message?.type === "required" &&
                      "Message is required.") ||
                    (errors.message?.type === "maxLength" &&
                      "Please type message with less than 200 characters.")
                  }
                  FormHelperTextProps={{
                    error: !!errors.message,
                  }}
                  InputProps={{
                    endAdornment: (
                      <IconButton type="submit">
                        <SendIcon />
                      </IconButton>
                    ),
                  }}
                />
              </Box>
            </form>
          </Box>
        </Grid>
        <Grid xs={12} md={6}></Grid>
      </Grid>
    </>
  );
};

interface MessageForm {
  message: string;
}
