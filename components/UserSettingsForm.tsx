import { Box, Button, DialogActions, TextField } from "@mui/material";
import { SupabaseClient } from "@supabase/supabase-js";
import { useForm } from "react-hook-form";
import { Profile } from "../utils/types";

interface UserSettingsForm {
  username: string;
}

interface Props {
  profile: Profile;
  supabase: SupabaseClient;
  onSubmitted: () => void;
  onCancel: () => void;
}

export const UserSettingsForm = ({
  profile,
  supabase,
  onSubmitted,
  onCancel,
}: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserSettingsForm>({
    defaultValues: {
      username: profile.username,
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await supabase
          .from<Profile>("profiles")
          .update({
            username: data.username,
          })
          .eq("id", profile.id);

        onSubmitted();
      })}
    >
      <Box mt={2}>
        <TextField
          autoComplete="off"
          label="Username"
          fullWidth
          {...register("username", {
            required: true,
            maxLength: 200,
          })}
          helperText={
            (errors.username?.type === "required" && "username is required.") ||
            (errors.username?.type === "maxLength" &&
              "Please type username with less than 50 characters.")
          }
          FormHelperTextProps={{
            error: !!errors.username,
          }}
        />
      </Box>
      <DialogActions sx={{ paddingRight: 0, paddingBottom: 0 }}>
        <Button variant="text" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" type="submit">
          Update
        </Button>
      </DialogActions>
    </form>
  );
};
