/**
 * Hook for the label print page.
 *
 * Manages selected sheet, template, book filter, positions,
 * and the PDF download action.
 */

import {
  downloadBlob,
  generateLabelPdf,
  useSheetConfigs,
  useTemplates,
} from "@/hooks/useLabelApi";
import type { BookFilter, LabelPosition } from "@/lib/labels/types";
import { useCallback, useState } from "react";

type PickerMode = "start" | "pick";

export function useLabelPrint() {
  const { sheets, sheetsLoading } = useSheetConfigs();
  const { templates, templatesLoading } = useTemplates();

  // Selection state
  const [sheetId, setSheetId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [filter, setFilter] = useState<BookFilter>({
    type: "latest",
    count: 24,
  });

  // Position state
  const [pickerMode, setPickerMode] = useState<PickerMode>("start");
  const [positions, setPositions] = useState<LabelPosition[]>([]);
  const [startPosition, setStartPosition] = useState<LabelPosition | null>(
    null,
  );

  // PDF generation state
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived
  const selectedSheet = sheets.find((s) => s.id === sheetId) ?? null;
  const canGenerate = !!sheetId && !!templateId && !generating;

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;

    setGenerating(true);
    setError(null);

    try {
      const request: Record<string, unknown> = {
        sheetConfigId: sheetId,
        templateId,
        bookFilter: filter,
      };

      // Add position info
      if (pickerMode === "start" && startPosition) {
        request.startPosition = startPosition;
      } else if (pickerMode === "pick" && positions.length > 0) {
        request.positions = positions;
      }

      const blob = await generateLabelPdf(request);
      const dateStr = new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `buchetiketten-${dateStr}.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setGenerating(false);
    }
  }, [
    canGenerate,
    sheetId,
    templateId,
    filter,
    pickerMode,
    startPosition,
    positions,
  ]);

  return {
    // Data
    sheets,
    templates,
    selectedSheet,
    loading: sheetsLoading || templatesLoading,

    // Selection
    sheetId,
    setSheetId,
    templateId,
    setTemplateId,
    filter,
    setFilter,

    // Positions
    pickerMode,
    setPickerMode,
    positions,
    setPositions,
    startPosition,
    setStartPosition,

    // Actions
    canGenerate,
    generating,
    error,
    handleGenerate,
  };
}
