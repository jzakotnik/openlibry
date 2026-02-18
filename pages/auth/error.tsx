import { ArrowLeft, ShieldAlert } from "lucide-react";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getCsrfToken } from "next-auth/react";
import Head from "next/head";

import errorsplash from "./errorsplashscreen.jpg";

// Map NextAuth error codes to user-friendly German messages
const errorMessages: Record<string, string> = {
  Signin: "Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.",
  OAuthSignin: "Fehler beim Aufbau der OAuth-Verbindung.",
  OAuthCallback: "Fehler bei der OAuth-Rückgabe.",
  OAuthCreateAccount: "OAuth-Konto konnte nicht erstellt werden.",
  EmailCreateAccount: "E-Mail-Konto konnte nicht erstellt werden.",
  Callback: "Fehler bei der Rückrufverarbeitung.",
  OAuthAccountNotLinked:
    "Diese E-Mail ist bereits mit einem anderen Konto verknüpft.",
  CredentialsSignin: "Benutzername oder Passwort ist falsch.",
  SessionRequired: "Bitte melden Sie sich an, um fortzufahren.",
  Default: "Ein unbekannter Fehler ist aufgetreten.",
};

function getErrorMessage(error: string | null): string {
  if (!error) return errorMessages.Default;
  return errorMessages[error] ?? `${errorMessages.Default} (${error})`;
}

export default function Error({
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  console.log("Auth error:", error);

  const friendlyMessage = getErrorMessage(error as string | null);

  return (
    <>
      <Head>
        <title>Anmeldefehler | OpenLibry</title>
      </Head>

      <div className="min-h-screen flex">
        {/* Left: Background image — hidden on mobile */}
        <div
          className="hidden sm:block sm:w-5/12 md:w-7/12 relative"
          style={{
            backgroundImage: `url(${errorsplash.src})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Subtle overlay for contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        </div>

        {/* Right: Error content */}
        <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
          <div className="w-full max-w-sm text-center">
            {/* Icon */}
            <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>

            {/* Heading */}
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Anmeldung fehlgeschlagen
            </h1>

            {/* Error message */}
            <p className="text-sm text-gray-500 leading-relaxed mb-8">
              {friendlyMessage}
            </p>

            {/* Error code (subtle) */}
            {error && (
              <p className="text-xs text-gray-300 font-mono mb-6">
                Fehlercode: {error}
              </p>
            )}

            {/* Back to login */}
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-2.5 text-sm font-medium text-white rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              style={{ backgroundColor: "#12556F" }}
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück zur Anmeldung
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { error } = context.query;
  return {
    props: {
      error: error ?? null,
      csrfToken: await getCsrfToken(context),
    },
  };
}
