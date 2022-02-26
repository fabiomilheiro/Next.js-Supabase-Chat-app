import { Button } from "@mui/material";
import { SupabaseClient } from "@supabase/supabase-js";
import useSupabase from "../utils/useSupabase";

interface LogInButtonProps {
  supabase: SupabaseClient;
}

export const LogInButton = ({ supabase }: LogInButtonProps) => {
  return (
    <Button
      variant="contained"
      color="inherit"
      onClick={async () => {
        await supabase.auth.signIn({
          provider: "github",
        });
      }}
    >
      Log in with GitHub
    </Button>
  );
};

interface LogOutButtonProps {
  supabase: SupabaseClient;
}

export const LogOutButton = ({ supabase }: LogOutButtonProps) => {
  return (
    <Button
      variant="outlined"
      color="inherit"
      onClick={async () => {
        await supabase.auth.signOut();
      }}
    >
      Log out
    </Button>
  );
};
