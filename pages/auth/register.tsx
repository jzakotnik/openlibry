import { Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getCsrfToken } from "next-auth/react";
import Head from "next/head";

import registersplash from "./registersplashscreen.jpg";

export default function Register({
  csrfToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  // Validation
  const passwordTooShort = password.length > 0 && password.length < 3;
  const passwordMismatch =
    passwordConfirm.length > 0 && password !== passwordConfirm;
  const canSubmit = useMemo(
    () =>
      user.trim().length > 0 &&
      email.trim().length > 0 &&
      password.length >= 3 &&
      password === passwordConfirm,
    [user, email, password, passwordConfirm],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/login/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user,
          password,
          email,
          role: "admin",
          active: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.message || `Fehler beim Erstellen (${res.status})`,
        );
      }

      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unbekannter Fehler. Bitte erneut versuchen.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Registrieren | OpenLibry</title>
      </Head>

      <div className="min-h-screen flex">
        {/* Left: Background image — hidden on mobile */}
        <div
          className="hidden sm:block sm:w-5/12 md:w-7/12 relative"
          style={{
            backgroundImage: `url(${registersplash.src})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        </div>

        {/* Right: Register form */}
        <div className="flex-1 flex items-center justify-center bg-white px-6 py-12 shadow-xl">
          <div className="w-full max-w-sm">
            {/* Icon + Heading */}
            <div className="text-center mb-8">
              <div
                className="mx-auto mb-4 w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: "#12556F" }}
              >
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Neuen Benutzer erzeugen
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Admin-Zugang für OpenLibry erstellen
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
              {/* Username */}
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

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  E-Mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg outline-none transition-colors focus:border-[#12556F] focus:ring-2 focus:ring-[#12556F]/20 placeholder-gray-400"
                  placeholder="E-Mail eingeben"
                />
              </div>

              {/* Password */}
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
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-3 py-2.5 text-sm text-gray-900 bg-gray-50 border rounded-lg outline-none transition-colors focus:ring-2 placeholder-gray-400 ${
                    passwordTooShort
                      ? "border-amber-400 focus:border-amber-500 focus:ring-amber-500/20"
                      : "border-gray-300 focus:border-[#12556F] focus:ring-[#12556F]/20"
                  }`}
                  placeholder="Mindestens 3 Zeichen"
                />
                {passwordTooShort && (
                  <p className="mt-1 text-xs text-amber-600">
                    Passwort muss mindestens 3 Zeichen lang sein
                  </p>
                )}
              </div>

              {/* Password confirm */}
              <div>
                <label
                  htmlFor="passwordConfirm"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Passwort wiederholen
                </label>
                <input
                  id="passwordConfirm"
                  name="passwordConfirm"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className={`w-full px-3 py-2.5 text-sm text-gray-900 bg-gray-50 border rounded-lg outline-none transition-colors focus:ring-2 placeholder-gray-400 ${
                    passwordMismatch
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-300 focus:border-[#12556F] focus:ring-[#12556F]/20"
                  }`}
                  placeholder="Passwort bestätigen"
                />
                {passwordMismatch && (
                  <p className="mt-1 text-xs text-red-600">
                    Passwörter stimmen nicht überein
                  </p>
                )}
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
                    Wird erstellt…
                  </>
                ) : (
                  "Benutzer erzeugen"
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
