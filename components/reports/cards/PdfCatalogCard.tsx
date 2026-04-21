import { BookQuoteSpinner } from "@/components/layout/BookQuoteSpinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileDown } from "lucide-react";
import { useState } from "react";

export default function PdfCatalogCard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/report/pdfcatalog");
      if (!res.ok) throw new Error(`Fehler ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `katalog_${new Date().toISOString().split("T")[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card data-cy="pdf-catalog-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileDown className="w-5 h-5 text-primary" />
          Katalog
        </CardTitle>
        <CardDescription>Alle Bücher als PDF-Katalog</CardDescription>
      </CardHeader>

      <CardContent>
        {loading ? (
          <BookQuoteSpinner />
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Erstellt einen vollständigen Bücherkatalog mit Covern als
              PDF-Dokument.
            </p>
            <Button
              onClick={handleDownload}
              data-cy="pdf-catalog-download-button"
            >
              <FileDown className="w-4 h-4 mr-2" />
              Katalog herunterladen
            </Button>
            {error && (
              <p className="text-sm text-destructive">Fehler: {error}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
