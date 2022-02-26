import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Theme,
  useTheme,
} from "@mui/material";
import { Session, SupabaseClient } from "@supabase/supabase-js";
import { useState } from "react";
import { Profile } from "../utils/types";
import { UserSettingsForm } from "./UserSettingsForm";

interface Props {
  profile: Profile;
  supabase: SupabaseClient;
}

export const UserSettings = ({ profile, supabase }: Props) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme<Theme>();

  if (!profile) {
    return null;
  }

  const close = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ position: "fixed", right: 0, top: 0, margin: theme.spacing(3) }}>
      <Dialog open={open} onClose={close}>
        <DialogTitle>User settings</DialogTitle>
        <DialogContent>
          {open && (
            <UserSettingsForm
              profile={profile}
              supabase={supabase}
              onSubmitted={close}
              onCancel={close}
            />
          )}
        </DialogContent>
      </Dialog>
      <Button variant="text" onClick={() => setOpen(true)}>
        Change user settings
      </Button>
    </Box>
  );
};
