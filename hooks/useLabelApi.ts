/**
 * Shared SWR hooks for the label API.
 *
 * Provides data fetching for sheet configs and templates
 * used by both the print and editor pages.
 */

import type { LabelTemplate, SheetConfig } from "@/lib/labels/types";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * Fetch all available sheet configurations.
 */
export function useSheetConfigs() {
  const { data, error, isLoading } = useSWR<SheetConfig[]>(
    "/api/labels/sheets",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return {
    sheets: data ?? [],
    sheetsError: error,
    sheetsLoading: isLoading,
  };
}

/**
 * Fetch all available label templates.
 */
export function useTemplates() {
  const { data, error, isLoading, mutate } = useSWR<LabelTemplate[]>(
    "/api/labels/templates",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return {
    templates: data ?? [],
    templatesError: error,
    templatesLoading: isLoading,
    mutateTemplates: mutate,
  };
}

/**
 * Download a label PDF by POSTing to the generate endpoint.
 * Returns the blob URL for download, or throws on error.
 */
export async function generateLabelPdf(
  request: Record<string, unknown>,
): Promise<Blob> {
  const response = await fetch("/api/labels/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `PDF-Generierung fehlgeschlagen (${response.status})`,
    );
  }

  return response.blob();
}

/**
 * Save a label template via POST.
 */
export async function saveTemplate(
  template: LabelTemplate,
): Promise<{ success: boolean; template: LabelTemplate }> {
  const response = await fetch("/api/labels/templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(template),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Vorlage konnte nicht gespeichert werden`,
    );
  }

  return response.json();
}

/**
 * Trigger a browser download for a blob.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
