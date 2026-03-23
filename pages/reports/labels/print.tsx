/**
 * /reports/labels/print
 *
 * Page for printing book labels. Select a sheet config,
 * template, filter which books to include, choose the
 * start position on the sheet, and download the PDF.
 */

import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { useRouter } from "next/router";

import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import SheetSelector from "@/components/labels/SheetSelector";
import TemplateSelector from "@/components/labels/TemplateSelector";
import BookFilterForm from "@/components/labels/print/BookFilterForm";
import PositionPicker from "@/components/labels/print/PositionPicker";
import { useLabelPrint } from "@/components/labels/print/useLabelPrint";
import { prisma } from "@/entities/db";
import { getUniqueTopics } from "@/lib/utils/getUniqueTopics";
import type { GetServerSideProps } from "next";

interface LabelPrintPageProps {
  topics: string[];
}

export default function LabelPrintPage({ topics }: LabelPrintPageProps) {
  const router = useRouter();
  const {
    sheets,
    templates,
    selectedSheet,
    loading,
    sheetId,
    setSheetId,
    templateId,
    setTemplateId,
    filter,
    setFilter,
    pickerMode,
    setPickerMode,
    positions,
    setPositions,
    startPosition,
    setStartPosition,
    canGenerate,
    generating,
    error,
    handleGenerate,
  } = useLabelPrint();

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* Header */}
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
          <h1 className="text-xl font-semibold">Buchetiketten drucken</h1>
        </div>

        {/* Main content: 2-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column: settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Konfiguration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <TemplateSelector
                  templates={templates}
                  value={templateId}
                  onChange={setTemplateId}
                  loading={loading}
                />
                <SheetSelector
                  sheets={sheets}
                  value={sheetId}
                  onChange={setSheetId}
                  loading={loading}
                />
                <Separator />
                <BookFilterForm
                  filter={filter}
                  onChange={setFilter}
                  topics={topics}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right column: position picker + action */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Position auf dem Bogen
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedSheet ? (
                  <PositionPicker
                    columns={selectedSheet.grid.columns}
                    rows={selectedSheet.grid.rows}
                    positions={positions}
                    startPosition={startPosition}
                    mode={pickerMode}
                    onModeChange={setPickerMode}
                    onPositionsChange={setPositions}
                    onStartPositionChange={setStartPosition}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground py-4">
                    Bitte zuerst einen Etikettenbogen auswählen.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Download button */}
            <Button
              className="w-full"
              size="lg"
              disabled={!canGenerate}
              onClick={handleGenerate}
              data-cy="generate-pdf-button"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  PDF wird erstellt…
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  PDF herunterladen
                </>
              )}
            </Button>

            {error && (
              <p className="text-sm text-destructive" data-cy="print-error">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<
  LabelPrintPageProps
> = async () => {
  const topics = await getUniqueTopics(prisma);
  return { props: { topics } };
};
