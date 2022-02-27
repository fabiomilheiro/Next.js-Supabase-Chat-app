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
} from "@mui/material";
import { SupabaseClient } from "@supabase/supabase-js";
import { Message, Profile } from "../utils/types";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import DeleteIcon from "@mui/icons-material/Delete";
import UndoIcon from "@mui/icons-material/Undo";

interface Props {
  message: Message;
  profiles: { [id: string]: Profile };
  supabase: SupabaseClient;
}

export const ChatMessage = ({ message, profiles, supabase }: Props) => {
  const theme = useTheme<Theme>();
  const authorProfile = profiles[message.userId];
  return (
    <Collapse in={true}>
      <ListItem
        sx={{
          paddingLeft: 0,
          backgroundColor: theme.palette.grey[200],
          borderRadius: 4,
          padding: 2,
          marginBottom: 1,
        }}
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
                  badgeContent={message.likes ? message.likes : undefined}
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
                      isDeleted: true,
                    })
                    .eq("id", message.id);
                }}
              >
                <DeleteIcon />
              </IconButton>
            )}
            {message.isDeleted && (
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
        }
      >
        {authorProfile && (
          <ListItemAvatar>
            <Avatar alt={authorProfile.username} src={authorProfile.avatar} />
          </ListItemAvatar>
        )}
        <ListItemText>
          {!message.isDeleted ? (
            message.content
          ) : (
            <Box sx={{ fontStyle: "italic", color: "Gray" }}>(deleted)</Box>
          )}
        </ListItemText>
      </ListItem>
    </Collapse>
  );
};
