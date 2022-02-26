import { Button } from "@mui/material";
import { SupabaseClient } from "@supabase/supabase-js";
import useSupabase from "../utils/useSupabase";

interface Props {
  supabase: SupabaseClient;
}

export const Auth = ({ supabase }: Props) => {
  return (
    <Button
      variant="contained"
      onClick={() => {
        supabase.auth.signIn({
          provider: "github",
        });
      }}
    >
      Log in with GitHub
    </Button>
  );
};
