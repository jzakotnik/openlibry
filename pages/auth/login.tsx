import { Loader2, Lock } from "lucide-react";
import { signIn } from "next-auth/react";
import React, { useState } from "react";

import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getCsrfToken } from "next-auth/react";
import Head from "next/head";

import loginsplash from "./loginsplashscreen.jpg";

export default function Login({
  csrfToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        user,
        password,
        hiddenFieldName: csrfToken,
        callbackUrl: "/",
        redirect: false,
      });

      if (res?.ok) {
        // Successful — redirect manually so we can handle errors first
        window.location.href = res.url ?? "/";
        return;
      }

      setError("Login fehlgeschlagen. Bitte Eingaben prüfen.");
    } catch {
      setError("Verbindungsfehler. Bitte erneut versuchen.");
    } finally {
      setIsLoading(false);
    }
  }

  const canSubmit = user.trim().length > 0 && password.length > 0;

  return (
    <>
      <Head>
        <title>Login | OpenLibry</title>
      </Head>

      <div className="min-h-screen flex">
        {/* Left: Background image — hidden on mobile */}
        <div
          className="hidden sm:block sm:w-5/12 md:w-7/12 relative"
          style={{
            backgroundImage: `url(${loginsplash.src})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        </div>

        {/* Right: Login form */}
        <div className="flex-1 flex items-center justify-center bg-white px-6 py-12 shadow-xl">
          <div className="w-full max-w-sm">
            {/* Icon + Heading */}
            <div className="text-center mb-8">
              <div
                className="mx-auto mb-4 w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: "#12556F" }}
              >
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Login zu OpenLibry
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Bitte melden Sie sich an
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-4 px-4 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="user"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Benutzername
                </label>
                <input
                  id="user"
                  name="user"
                  type="text"
                  required
                  autoComplete="username"
                  autoFocus
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg outline-none transition-colors focus:border-[#12556F] focus:ring-2 focus:ring-[#12556F]/20 placeholder-gray-400"
                  placeholder="Benutzername eingeben"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Passwort
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg outline-none transition-colors focus:border-[#12556F] focus:ring-2 focus:ring-[#12556F]/20 placeholder-gray-400"
                  placeholder="Passwort eingeben"
                />
              </div>

              <button
                type="submit"
                disabled={!canSubmit || isLoading}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 mt-2 text-sm font-medium text-white rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                style={{ backgroundColor: "#12556F" }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Wird angemeldet…
                  </>
                ) : (
                  "Einloggen"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}
