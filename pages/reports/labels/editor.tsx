/**
 * /reports/labels/editor
 *
 * Visual editor for label templates. Select a sheet config,
 * assign fields to the 4 zones, adjust spine width, see a
 * live PDF preview, and save the template.
 *
 * Supports ?template=<id> query param to load an existing template.
 */

import { ArrowLeft, CheckCircle, FilePlus, Loader2, Save } from "lucide-react";
import { useRouter } from "next/router";

import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import SheetSelector from "@/components/labels/SheetSelector";
import TemplateSelector from "@/components/labels/TemplateSelector";
import FieldAssigner from "@/components/labels/editor/FieldAssigner";
import LabelPreview from "@/components/labels/editor/LabelPreview";
import SpineWidthSlider from "@/components/labels/editor/SpineWidthSlider";
import { useTemplateEditor } from "@/components/labels/editor/useTemplateEditor";

export default function LabelEditorPage() {
  const router = useRouter();
  const templateParam = router.query.template as string | undefined;

  const {
    sheets,
    templates,
    loading,
    name,
    setName,
    sheetId,
    setSheetId,
    spineWidthPercent,
    setSpineWidthPercent,
    fields,
    updateField,
    currentTemplate,
    loadTemplate,
    resetToNew,
    canSave,
    saving,
    saveError,
    saveSuccess,
    handleSave,
    dirty,
  } = useTemplateEditor(templateParam);

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* Header with back button, template loader, and new button */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/reports")}
              data-cy="back-to-reports"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Zurück
            </Button>
            <h1 className="text-xl font-semibold">Etiketten-Vorlage</h1>
          </div>
          <div className="flex items-center gap-2">
            <TemplateSelector
              templates={templates}
              value={currentTemplate.id}
              onChange={loadTemplate}
              loading={loading}
              hideLabel
            />
            <Button
              variant="outline"
              size="sm"
              onClick={resetToNew}
              data-cy="new-template-button"
            >
              <FilePlus className="h-4 w-4 mr-1" />
              Neu
            </Button>
          </div>
        </div>

        {/* Main content: 2-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column: editor controls */}
          <div className="space-y-6">
            {/* Template settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Einstellungen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Template name */}
                <div className="space-y-1.5">
                  <Label htmlFor="template-name">Vorlagenname</Label>
                  <Input
                    id="template-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="z.B. Standard Buchetikett"
                    data-cy="template-name-input"
                  />
                </div>

                <SheetSelector
                  sheets={sheets}
                  value={sheetId}
                  onChange={setSheetId}
                  loading={loading}
                />

                <Separator />

                <SpineWidthSlider
                  value={spineWidthPercent}
                  onChange={setSpineWidthPercent}
                />

                <Separator />

                <FieldAssigner fields={fields} onChange={updateField} />
              </CardContent>
            </Card>

            {/* Save button */}
            <div className="space-y-2">
              <Button
                className="w-full"
                size="lg"
                disabled={!canSave}
                onClick={handleSave}
                data-cy="save-template-button"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Wird gespeichert…
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Vorlage speichern
                  </>
                )}
              </Button>

              {saveSuccess && (
                <p
                  className="text-sm text-green-600 flex items-center gap-1"
                  data-cy="save-success"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Vorlage gespeichert
                </p>
              )}

              {saveError && (
                <p className="text-sm text-destructive" data-cy="save-error">
                  {saveError}
                </p>
              )}

              {dirty && !saveSuccess && (
                <p className="text-xs text-muted-foreground">
                  Ungespeicherte Änderungen
                </p>
              )}
            </div>
          </div>

          {/* Right column: live preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Vorschau</CardTitle>
              </CardHeader>
              <CardContent>
                <LabelPreview template={currentTemplate} sheetId={sheetId} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
