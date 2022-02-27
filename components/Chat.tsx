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
import { Message, Profile } from "../utils/types";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import { TransitionGroup } from "react-transition-group";
import { LogInButton, LogOutButton } from "./AuthButtons";
import { UserSettings } from "./UserSettings";
import { ChatMessage } from "./ChatMessage";

interface Props {
  profile: Profile;
  session: Session;
  supabase: SupabaseClient;
}

export const Chat = ({ profile, session, supabase }: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profiles, setProfiles] = useState<{ [id: string]: Profile }>({});
  const userIds = messages
    .map((m) => m.userId)
    .reduce<string[]>((acc, userId) => {
      if (!acc.some((id) => id === userId)) {
        acc = [...acc, userId];
      }

      return acc;
    }, []);
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from<Message>("messages")
        .select("*")
        .order("id")
        .filter("isDeleted", "eq", false);

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

  useEffect(() => {
    const username = profile?.username
      ? profile.username
      : session?.user?.email ?? "anonymous";
    setUsername(username);
  }, [profile, session]);
  useEffect(() => {
    const fetchProfiles = async () => {
      const userIdsToFetch = userIds.filter((id) => !profiles[id]);

      if (!userIdsToFetch.length) {
        return;
      }

      const { data, error } = await supabase
        .from<Profile>("profiles")
        .select("*")
        .in("id", userIdsToFetch);

      if (error) {
        console.error(error);
      } else if (data && data[0]) {
        setProfiles((previous) => {
          const newState = { ...previous };

          data.forEach((p) => {
            newState[p.id] = p;
          });

          return newState;
        });
      }
    };

    fetchProfiles();
  }, [profiles, supabase, userIds]);
  useEffect(() => {
    setIsLoggedIn(!!session);
  }, [session]);
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<MessageForm>();
  const theme = useTheme<Theme>();

  return (
    <Container maxWidth="sm" sx={{ padding: theme.spacing(2) }}>
      {profile && <UserSettings profile={profile} supabase={supabase} />}
      <Stack>
        <Box sx={{ width: "100%" }}>
          <Typography variant="h3" sx={{ mb: 3 }}>
            Chat
          </Typography>
          <Typography variant="body1">
            Welcome, {username}! <br />
            Feel free to type messages. Others will see them immediately.👍
          </Typography>
        </Box>
        <List sx={{ overflow: "auto" }}>
          <TransitionGroup>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                profiles={profiles}
                supabase={supabase}
                isLoggedIn={isLoggedIn}
              />
            ))}
          </TransitionGroup>
        </List>

        <Box>
          <form
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
              {isLoggedIn ? (
                <>
                  <Box mb={2}>
                    <TextField
                      autoComplete="off"
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
                  <Box mr={2} display="inline">
                    <LogOutButton supabase={supabase} />
                  </Box>
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
