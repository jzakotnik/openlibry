import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";

import React, { useEffect, useState } from "react";

import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getCsrfToken } from "next-auth/react";

import registersplash from "./registersplashscreen.jpg";

export default function Register({
  csrfToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEMail] = useState("");
  const [passwordValidate, setPasswordValidate] = useState("");

  const [passwordInPutError, setPasswordInputError] = useState(false);
  const [submitEnabled, setSubmitEnabled] = useState(false);

  useEffect(() => {
    validate();
  }, [user, email, password, passwordValidate]);

  const router = useRouter();

  const validate = () => {
    //console.log("Validating input", user, password, passwordValidate);
    if (password != passwordValidate || password.length < 3) {
      setPasswordInputError(true);
      setSubmitEnabled(false);
    } else {
      setPasswordInputError(false);
      setSubmitEnabled(true);
    }
    return;
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const userData = {
      user: user,
      password: password,
      email: email,
      role: "admin",
      active: true,
    };
    fetch("/api/login/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    }).then((res) => {
      if (!res.ok) {
        console.log("ERROR while creating user", res.statusText);
      }
      console.log("Created user", userData.user);

      router.push("/");
    });
  }

  return (
    <Grid container component="main" sx={{ height: "100vh" }}>
      <CssBaseline />
      <Grid
        size={{ xs: false, sm: 4, md: 7 }}
        sx={{
          backgroundImage: `url(${registersplash.src})`,
          backgroundRepeat: "no-repeat",

          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <Grid size={{ xs: 12, sm: 8, md: 5 }} component={Paper} elevation={6} square>
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
            Neuen Benutzer für OpenLibry erzeugen
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 1 }}
          >
            <TextField
              sx={{ input: { color: "black" } }}
              margin="normal"
              required
              fullWidth
              id="user"
              label="Username"
              name="user"
              autoComplete="user"
              color="secondary"
              autoFocus
              onChange={(e) => setUser(e.target.value)}
            />
            <TextField
              sx={{ input: { color: "black" } }}
              margin="normal"
              required
              fullWidth
              id="email"
              label="eMail"
              name="email"
              autoComplete="email"
              color="secondary"
              autoFocus
              onChange={(e) => setEMail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Passwort"
              type="password"
              id="password"
              onChange={(e) => setPassword(e.target.value)}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              error={passwordInPutError}
              name="password-validation"
              label="Passwort wiederholen"
              type="password"
              id="passwordValidation"
              onChange={(e) => setPasswordValidate(e.target.value)}
            />

            <Button
              type="submit"
              fullWidth
              disabled={!submitEnabled}
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Benutzer erzeugen
            </Button>
          </Box>
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
