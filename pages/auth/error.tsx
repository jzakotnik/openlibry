import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Button } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getCsrfToken } from "next-auth/react";

import errorsplash from "./errorsplashscreen.jpg";

export default function Error({
  csrfToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  //const { data: session } = useSession();
  //console.log("Session", session);

  return (
    <Grid container component="main" sx={{ height: "100vh" }}>
      <CssBaseline />
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundImage: `url(${errorsplash.src})`,
          backgroundRepeat: "no-repeat",

          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" color="primary" variant="h5">
            Falscher Nutzername oder Passwort, versuche es nochmal..
          </Typography>
          <Button href="/" variant="contained" color="primary">
            Login Seite
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}
export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}
