import {
  Collapse,
  ListItem,
  IconButton,
  Badge,
  ListItemText,
  Box,
  ListItemAvatar,
  Avatar,
  Theme,
  useTheme,
  Grid,
} from "@mui/material";
import { SupabaseClient } from "@supabase/supabase-js";
import { Message, Profile } from "../utils/types";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import DeleteIcon from "@mui/icons-material/Delete";
import UndoIcon from "@mui/icons-material/Undo";
import { formatDistanceToNow } from "date-fns";

interface Props {
  message: Message;
  profiles: { [id: string]: Profile };
  isLoggedIn: boolean;
  supabase: SupabaseClient;
}

export const ChatMessage = ({
  message,
  profiles,
  isLoggedIn,
  supabase,
}: Props) => {
  const theme = useTheme<Theme>();
  const authorProfile = profiles[message.userId];
  return (
    <Collapse in={true}>
      <ListItem
        sx={{
          paddingLeft: 0,
          backgroundColor: theme.palette.grey[100],
          borderRadius: 4,
          padding: 2,
          marginBottom: 1,
        }}
        alignItems="flex-start"
      >
        {authorProfile && (
          <ListItemAvatar>
            <Avatar alt={authorProfile.username} src={authorProfile.avatar} />
          </ListItemAvatar>
        )}
        <ListItemText>
          <Grid container>
            <Grid item xs={8} sx={{ fontSize: "0.75em" }}>
              {authorProfile?.username}
            </Grid>
            <Grid
              item
              xs={4}
              sx={{
                fontSize: "0.75em",
                fontStyle: "italic",
                color: theme.palette.grey[500],
                textAlign: "right",
                marginBottom: 1,
              }}
            >
              {message.createdAt &&
                formatDistanceToNow(new Date(message.createdAt))}
            </Grid>
            <Grid item xs={8}>
              {!message.isDeleted ? (
                message.content
              ) : (
                <Box sx={{ fontStyle: "italic", color: "Gray" }}>(deleted)</Box>
              )}
            </Grid>
            <Grid
              item
              xs={4}
              sx={{
                textAlign: "right",
              }}
            >
              <>
                {!message.isDeleted && (
                  <IconButton
                    onClick={async () => {
                      isLoggedIn &&
                        (await supabase
                          .from<Message>("messages")
                          .update({ likes: message.likes + 1 })
                          .eq("id", message.id));
                    }}
                  >
                    <Badge
                      badgeContent={message.likes ? message.likes : undefined}
                      color="primary"
                    >
                      <ThumbUpIcon />
                    </Badge>
                  </IconButton>
                )}
                {!message.isDeleted && isLoggedIn && (
                  <IconButton
                    onClick={async () => {
                      await supabase
                        .from<Message>("messages")
                        .update({
                          isDeleted: true,
                        })
                        .eq("id", message.id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
                {message.isDeleted && isLoggedIn && (
                  <IconButton
                    onClick={async () => {
                      await supabase
                        .from<Message>("messages")
                        .update({
                          isDeleted: false,
                        })
                        .eq("id", message.id);
                    }}
                  >
                    <UndoIcon />
                  </IconButton>
                )}
              </>
            </Grid>
          </Grid>
        </ListItemText>
      </ListItem>
    </Collapse>
  );
};
