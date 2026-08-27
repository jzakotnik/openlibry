/**
 * Live PDF preview of a single label.
 *
 * Sends the current template as an inline object + a sample book
 * to POST /api/labels/generate and displays the resulting PDF
 * in an iframe. Debounced (800ms) to avoid excessive server load,
 * especially on Raspberry Pi.
 */

import type { LabelTemplate } from "@/lib/labels/types";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/** Sample book data shown in the preview */
const SAMPLE_BOOK = {
  id: "B-0042",
  title: "Der kleine Prinz",
  author: "Antoine de Saint-Exupéry",
  subtitle: "Eine Erzählung",
  topics: "Abenteuer; Freundschaft; Philosophie; Kinderbuch",
};

interface LabelPreviewProps {
  template: LabelTemplate;
  sheetId: string;
}

export default function LabelPreview({ template, sheetId }: LabelPreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevUrlRef = useRef<string | null>(null);

  // Serialize template to a stable string for effect dependency
  const templateJson = JSON.stringify(template);

  const fetchPreview = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/labels/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheetConfigId: sheetId,
          template: template, // Inline template — no save needed
          books: [SAMPLE_BOOK],
        }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(
          errBody.error || "Vorschau konnte nicht geladen werden",
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Revoke previous URL to avoid memory leaks
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
      }
      prevUrlRef.current = url;
      setPdfUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vorschau-Fehler");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheetId, templateJson]);

  useEffect(() => {
    if (!sheetId || !template.fields) return;

    // Debounce: wait 800ms after last change before requesting
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchPreview();
    }, 800);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [sheetId, templateJson, fetchPreview]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-2">
      <div className="relative rounded-lg border bg-muted/30 overflow-hidden min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            className="w-full h-[400px]"
            title="Etikettenvorschau"
            data-cy="label-preview-iframe"
          />
        ) : error ? (
          <div className="flex items-center justify-center h-[300px] text-sm text-destructive">
            {error}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
            Vorschau wird geladen, sobald ein Bogen ausgewählt ist…
          </div>
        )}
      </div>
    </div>
  );
}
