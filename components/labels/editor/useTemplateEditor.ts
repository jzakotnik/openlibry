/**
 * Hook for the label template editor page.
 *
 * Manages template fields, loads existing templates for editing,
 * saves templates, and tracks dirty state.
 */

import {
  saveTemplate as apiSaveTemplate,
  useSheetConfigs,
  useTemplates,
} from "@/hooks/useLabelApi";
import type { LabelFieldConfig, LabelTemplate } from "@/lib/labels/types";
import { useCallback, useEffect, useMemo, useState } from "react";

type FieldKey = "spine" | "horizontal1" | "horizontal2" | "horizontal3";

const DEFAULT_FIELD: LabelFieldConfig = {
  content: "none",
  fontSizeMax: 10,
  align: "left",
};

const DEFAULT_TEMPLATE: LabelTemplate = {
  id: "",
  name: "",
  sheetConfigId: "",
  spineWidthPercent: 25,
  padding: 2,
  fields: {
    spine: { content: "id", fontSizeMax: 14, align: "center" },
    horizontal1: { content: "title", fontSizeMax: 11, align: "left" },
    horizontal2: { content: "author", fontSizeMax: 9, align: "left" },
    horizontal3: { content: "barcode", fontSizeMax: 0, align: "center" },
  },
};

export function useTemplateEditor(initialTemplateId?: string) {
  const { sheets, sheetsLoading } = useSheetConfigs();
  const { templates, templatesLoading, mutateTemplates } = useTemplates();

  // Template state
  const [templateId, setTemplateId] = useState(initialTemplateId ?? "");
  const [name, setName] = useState("");
  const [sheetId, setSheetId] = useState("");
  const [spineWidthPercent, setSpineWidthPercent] = useState(25);
  const [padding, setPadding] = useState(2);
  const [fields, setFields] = useState<Record<FieldKey, LabelFieldConfig>>(
    DEFAULT_TEMPLATE.fields,
  );

  // UI state
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Load existing template when selection changes
  const loadTemplate = useCallback(
    (id: string) => {
      const template = templates.find((t) => t.id === id);
      if (!template) return;

      setTemplateId(template.id);
      setName(template.name);
      setSheetId(template.sheetConfigId);
      setSpineWidthPercent(template.spineWidthPercent);
      setPadding(template.padding);
      setFields(template.fields);
      setDirty(false);
      setSaveSuccess(false);
    },
    [templates],
  );

  // Auto-load initial template from URL query
  useEffect(() => {
    if (initialTemplateId && templates.length > 0) {
      loadTemplate(initialTemplateId);
    }
  }, [initialTemplateId, templates, loadTemplate]);

  // Reset to new template
  const resetToNew = useCallback(() => {
    setTemplateId("");
    setName("");
    setSheetId(sheets.length > 0 ? sheets[0].id : "");
    setSpineWidthPercent(DEFAULT_TEMPLATE.spineWidthPercent);
    setPadding(DEFAULT_TEMPLATE.padding);
    setFields(DEFAULT_TEMPLATE.fields);
    setDirty(false);
    setSaveSuccess(false);
  }, [sheets]);

  // Field update helper
  const updateField = useCallback((key: FieldKey, config: LabelFieldConfig) => {
    setFields((prev) => ({ ...prev, [key]: config }));
    setDirty(true);
    setSaveSuccess(false);
  }, []);

  // Build current template object (for preview and saving)
  const currentTemplate: LabelTemplate = useMemo(
    () => ({
      id:
        templateId ||
        name
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, "-")
          .replace(/-+/g, "-"),
      name,
      sheetConfigId: sheetId,
      spineWidthPercent,
      padding,
      fields,
    }),
    [templateId, name, sheetId, spineWidthPercent, padding, fields],
  );

  // Save
  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      setSaveError("Bitte einen Namen für die Vorlage eingeben.");
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await apiSaveTemplate(currentTemplate);
      setDirty(false);
      setSaveSuccess(true);
      // Update the template ID to the saved one (might have been sanitized)
      setTemplateId(currentTemplate.id);
      // Refresh the templates list
      mutateTemplates();
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Speichern fehlgeschlagen",
      );
    } finally {
      setSaving(false);
    }
  }, [currentTemplate, name, mutateTemplates]);

  const canSave = !!name.trim() && !!sheetId && !saving;

  return {
    // Data
    sheets,
    templates,
    loading: sheetsLoading || templatesLoading,

    // Template state
    templateId,
    name,
    setName: (v: string) => {
      setName(v);
      setDirty(true);
      setSaveSuccess(false);
    },
    sheetId,
    setSheetId: (v: string) => {
      setSheetId(v);
      setDirty(true);
      setSaveSuccess(false);
    },
    spineWidthPercent,
    setSpineWidthPercent: (v: number) => {
      setSpineWidthPercent(v);
      setDirty(true);
      setSaveSuccess(false);
    },
    padding,
    fields,
    updateField,
    currentTemplate,

    // Actions
    loadTemplate,
    resetToNew,
    canSave,
    saving,
    saveError,
    saveSuccess,
    handleSave,
    dirty,
  };
}
