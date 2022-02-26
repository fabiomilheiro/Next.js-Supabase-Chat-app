import {
  Badge,
  Box,
  Collapse,
  Container,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Theme,
  Typography,
  useTheme,
} from "@mui/material";
import { Session, SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Message } from "../utils/types";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import { TransitionGroup } from "react-transition-group";
import { LogInButton, LogOutButton } from "./Auth";

interface Props {
  session: Session;
  supabase: SupabaseClient;
}

export const Chat = ({ session, supabase }: Props) => {
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

  const isLoggedIn = !!session;

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
  const theme = useTheme<Theme>();

  return (
    <Container maxWidth="sm" sx={{ padding: theme.spacing(2) }}>
      <Stack>
        <Box sx={{ width: "100%" }}>
          <Typography variant="h3" sx={{ mb: 3 }}>
            Chat
          </Typography>
          <Typography variant="body1">
            Feel free to type messages. Others will see them immediately.👍
          </Typography>
        </Box>
        <List sx={{ overflow: "auto" }}>
          <TransitionGroup>
            {messages.map((message) => (
              <Collapse key={message.id} in={true}>
                <ListItem
                  sx={{ paddingLeft: 0 }}
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
              {!isLoggedIn ? (
                <>
                  <Box mb={2}>
                    <TextField
                      label="Message"
                      fullWidth
                      {...register("message", {
                        required: true,
                        maxLength: 200,
                      })}
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
                  <LogOutButton supabase={supabase} />
                </>
              ) : (
                <LogInButton supabase={supabase} />
              )}
            </Box>
          </form>
        </Box>
      </Stack>
    </Container>
  );
};

interface MessageForm {
  message: string;
}
