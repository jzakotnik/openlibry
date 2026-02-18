import Layout from "@/components/layout/Layout";
import { ArrowLeft, Construction } from "lucide-react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <Layout>
      <Head>
        <title>Einstellungen | OpenLibry</title>
      </Head>

      <div className="max-w-5xl mx-auto py-8 px-4">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            type="button"
            onClick={() => router.push("/admin")}
            title="Zurück zur Administration"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Einstellungen</h1>
            <p className="text-muted-foreground">Systemkonfiguration</p>
          </div>
        </div>

        {/* Coming Soon */}
        <div
          className="
            p-10 text-center rounded-xl border border-primary/10
            bg-gradient-to-br from-primary/5 to-primary/[0.02]
          "
        >
          <Construction className="w-16 h-16 text-primary opacity-70 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">In Arbeit</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Die Einstellungsseite wird in einer zukünftigen Version verfügbar
            sein. Aktuell können Einstellungen über die{" "}
            <code className="text-sm bg-gray-100 px-1 py-0.5 rounded">
              .env
            </code>
            -Datei vorgenommen werden.
          </p>
          <div className="mt-4 inline-block bg-gray-50 rounded-md px-4 py-2">
            <p className="text-sm font-mono text-muted-foreground">
              Dokumentation:{" "}
              <a
                href="https://github.com/jzakotnik/openlibry#readme"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                README.md
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
