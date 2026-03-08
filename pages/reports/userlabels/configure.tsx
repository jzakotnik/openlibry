import Layout from "@/components/layout/Layout";
import LabelPreview from "@/components/reports/userlabels/LabelPreview";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  DEFAULT_USER_LABEL_CONFIG,
  LabelLine,
  USER_PLACEHOLDER_FIELDS,
  UserLabelConfig,
} from "@/lib/utils/userLabelConfig";
import {
  ArrowLeft,
  Check,
  Image as ImageIcon,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";

// =============================================================================
// Sub-components
// =============================================================================

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.6875rem] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
      {children}
    </p>
  );
}

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <Label className="w-28 shrink-0 text-sm text-muted-foreground">
        {label}
      </Label>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function CmInput({
  value,
  onChange,
  min = 0,
  step = 0.1,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <Input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-20 text-right text-sm"
      />
      <span className="text-xs text-muted-foreground w-5">cm</span>
    </div>
  );
}

function PctInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <Input
      value={value}
      placeholder={placeholder ?? "50%"}
      onChange={(e) => onChange(e.target.value)}
      className="w-20 text-right text-sm"
    />
  );
}

// =============================================================================
// Main Page
// =============================================================================

export default function ConfigureUserLabels() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [config, setConfig] = useState<UserLabelConfig>(
    DEFAULT_USER_LABEL_CONFIG,
  );
  const [savedConfig, setSavedConfig] = useState<UserLabelConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());

  const hasUnsavedChanges =
    savedConfig !== null &&
    JSON.stringify(config) !== JSON.stringify(savedConfig);

  // -------------------------------------------------------------------------
  // Load config on mount
  // -------------------------------------------------------------------------
  useEffect(() => {
    fetch("/api/report/userlabels/config")
      .then((r) => r.json())
      .then((data) => {
        setConfig(data);
        setSavedConfig(data);
      })
      .catch(() => {
        setConfig(DEFAULT_USER_LABEL_CONFIG);
        setSavedConfig(DEFAULT_USER_LABEL_CONFIG);
      })
      .finally(() => setLoading(false));
  }, []);

  // -------------------------------------------------------------------------
  // Helpers to update nested state
  // -------------------------------------------------------------------------
  const updateGrid = useCallback(
    (updates: Partial<UserLabelConfig["grid"]>) =>
      setConfig((prev) => ({ ...prev, grid: { ...prev.grid, ...updates } })),
    [],
  );

  const updateLabel = useCallback(
    (updates: Partial<UserLabelConfig["label"]>) =>
      setConfig((prev) => ({ ...prev, label: { ...prev.label, ...updates } })),
    [],
  );

  const updateBarcode = useCallback(
    (updates: Partial<UserLabelConfig["barcode"]>) =>
      setConfig((prev) => ({
        ...prev,
        barcode: { ...prev.barcode, ...updates },
      })),
    [],
  );

  const updateLine = useCallback(
    (index: number, updates: Partial<LabelLine>) =>
      setConfig((prev) => ({
        ...prev,
        lines: prev.lines.map((l, i) =>
          i === index ? { ...l, ...updates } : l,
        ),
      })),
    [],
  );

  const addLine = useCallback(
    () =>
      setConfig((prev) => ({
        ...prev,
        lines: [
          ...prev.lines,
          {
            text: "",
            fontSize: 12,
            top: "50%",
            left: "3%",
            color: "#000000",
          },
        ],
      })),
    [],
  );

  const removeLine = useCallback(
    (index: number) =>
      setConfig((prev) => ({
        ...prev,
        lines: prev.lines.filter((_, i) => i !== index),
      })),
    [],
  );

  const insertPlaceholder = useCallback(
    (lineIndex: number, placeholder: string) =>
      setConfig((prev) => ({
        ...prev,
        lines: prev.lines.map((l, i) =>
          i === lineIndex
            ? {
                ...l,
                text: (l.text + (l.text ? " " : "") + placeholder).trim(),
              }
            : l,
        ),
      })),
    [],
  );

  // -------------------------------------------------------------------------
  // Save
  // -------------------------------------------------------------------------
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/report/userlabels/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setSavedConfig(config);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------------------------------------
  // Reset to defaults
  // -------------------------------------------------------------------------
  const handleReset = async () => {
    if (!confirm("Konfiguration auf Standardwerte zurücksetzen?")) return;
    await fetch("/api/report/userlabels/config", { method: "DELETE" });
    setConfig(DEFAULT_USER_LABEL_CONFIG);
    setSavedConfig(DEFAULT_USER_LABEL_CONFIG);
  };

  // -------------------------------------------------------------------------
  // Image upload
  // -------------------------------------------------------------------------
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      await fetch("/api/report/userlabels/image", {
        method: "POST",
        body: formData,
      });
      setImageTimestamp(Date.now());
      updateLabel({ image: "userlabel-background.jpg" });
    } finally {
      setUploadingImage(false);
      // Reset input so same file can be re-uploaded
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" size={18} />
          <span>Konfiguration wird geladen…</span>
        </div>
      </Layout>
    );
  }

  const imageUrl = `/api/report/userlabels/image?t=${imageTimestamp}`;

  return (
    <Layout>
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {/* ------------------------------------------------------------------ */}
        {/* Header                                                              */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/reports")}
              className="gap-1.5 text-muted-foreground"
            >
              <ArrowLeft size={15} />
              Zurück
            </Button>
            <Separator orientation="vertical" className="h-5" />
            <h1 className="text-xl font-semibold text-foreground">
              Benutzerausweise konfigurieren
            </h1>
            {hasUnsavedChanges && (
              <Badge
                variant="outline"
                className="text-warning border-warning/50 bg-warning-light text-xs"
              >
                Nicht gespeichert
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-1.5 text-muted-foreground"
            >
              <RotateCcw size={14} />
              Zurücksetzen
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="gap-1.5"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : saveSuccess ? (
                <Check size={14} />
              ) : (
                <Save size={14} />
              )}
              {saveSuccess ? "Gespeichert!" : "Speichern"}
            </Button>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Two-panel grid                                                       */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-6 items-start">
          {/* ===== Left: Settings ===== */}
          <div className="space-y-2">
            <Accordion
              type="multiple"
              defaultValue={["grid", "label", "content"]}
              className="space-y-2"
            >
              {/* ------- SECTION 1: Grid ------- */}
              <AccordionItem
                value="grid"
                className="border rounded-xl overflow-hidden shadow-sm bg-card"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline font-semibold text-sm">
                  Seitenraster
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-3">
                  <SectionLabel>Spalten und Zeilen</SectionLabel>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Spalten</Label>
                      <Input
                        type="number"
                        min={1}
                        max={6}
                        value={config.grid.columns}
                        onChange={(e) =>
                          updateGrid({
                            columns: parseInt(e.target.value) || 1,
                          })
                        }
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Zeilen</Label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={config.grid.rows}
                        onChange={(e) =>
                          updateGrid({ rows: parseInt(e.target.value) || 1 })
                        }
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <Separator />
                  <SectionLabel>Seitenränder</SectionLabel>
                  <div className="space-y-2">
                    <FieldRow label="Oben">
                      <CmInput
                        value={config.grid.marginTopCm}
                        onChange={(v) => updateGrid({ marginTopCm: v })}
                      />
                    </FieldRow>
                    <FieldRow label="Links">
                      <CmInput
                        value={config.grid.marginLeftCm}
                        onChange={(v) => updateGrid({ marginLeftCm: v })}
                      />
                    </FieldRow>
                  </div>

                  <Separator />
                  <SectionLabel>Abstand zwischen Etiketten</SectionLabel>
                  <div className="space-y-2">
                    <FieldRow label="Horizontal">
                      <CmInput
                        value={config.grid.spacingHCm}
                        onChange={(v) => updateGrid({ spacingHCm: v })}
                      />
                    </FieldRow>
                    <FieldRow label="Vertikal">
                      <CmInput
                        value={config.grid.spacingVCm}
                        onChange={(v) => updateGrid({ spacingVCm: v })}
                      />
                    </FieldRow>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* ------- SECTION 2: Label ------- */}
              <AccordionItem
                value="label"
                className="border rounded-xl overflow-hidden shadow-sm bg-card"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline font-semibold text-sm">
                  Einzelnes Etikett
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-3">
                  <SectionLabel>Größe</SectionLabel>
                  <div className="space-y-2">
                    <FieldRow label="Breite">
                      <CmInput
                        value={config.label.widthCm}
                        onChange={(v) => updateLabel({ widthCm: v })}
                        min={1}
                      />
                    </FieldRow>
                    <FieldRow label="Höhe">
                      <CmInput
                        value={config.label.heightCm}
                        onChange={(v) => updateLabel({ heightCm: v })}
                        min={1}
                      />
                    </FieldRow>
                  </div>

                  <Separator />
                  <SectionLabel>Hintergrundbild</SectionLabel>

                  <div className="flex gap-3 items-start">
                    {/* Thumbnail */}
                    <div className="w-20 h-14 rounded border bg-muted overflow-hidden flex items-center justify-center shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt="Vorschau"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <ImageIcon
                        size={20}
                        className="text-muted-foreground absolute opacity-30"
                      />
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Bild hochladen (JPG/PNG, max. 5 MB). Wird in{" "}
                        <code className="text-[10px] bg-muted px-1 rounded">
                          database/custom/
                        </code>{" "}
                        gespeichert.
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                      >
                        {uploadingImage ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Upload size={12} />
                        )}
                        Bild auswählen
                      </Button>
                    </div>
                  </div>

                  <Separator />
                  <SectionLabel>Darstellung</SectionLabel>
                  <div className="flex items-center gap-3">
                    <Switch
                      id="showBorder"
                      checked={config.label.showBorder}
                      onCheckedChange={(v) => updateLabel({ showBorder: v })}
                    />
                    <Label
                      htmlFor="showBorder"
                      className="text-sm cursor-pointer"
                    >
                      Schnittrahmen anzeigen
                    </Label>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* ------- SECTION 3: Content ------- */}
              <AccordionItem
                value="content"
                className="border rounded-xl overflow-hidden shadow-sm bg-card"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline font-semibold text-sm">
                  Inhalt &amp; Text
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  {/* Text lines */}
                  <SectionLabel>Textzeilen</SectionLabel>
                  <div className="space-y-3">
                    {config.lines.map((line, idx) => (
                      <LineEditor
                        key={idx}
                        line={line}
                        index={idx}
                        onChange={(updates) => updateLine(idx, updates)}
                        onRemove={() => removeLine(idx)}
                        onInsertPlaceholder={(ph) => insertPlaceholder(idx, ph)}
                      />
                    ))}
                  </div>

                  {config.lines.length < 5 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addLine}
                      className="gap-1.5 text-xs w-full"
                    >
                      <Plus size={12} />
                      Zeile hinzufügen
                    </Button>
                  )}

                  <Separator />

                  {/* Barcode */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Switch
                        id="barcodeEnabled"
                        checked={config.barcode.enabled}
                        onCheckedChange={(v) => updateBarcode({ enabled: v })}
                      />
                      <Label
                        htmlFor="barcodeEnabled"
                        className="font-semibold text-sm cursor-pointer"
                      >
                        Barcode anzeigen
                      </Label>
                    </div>

                    {config.barcode.enabled && (
                      <div className="pl-9 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                              Oben (%)
                            </Label>
                            <PctInput
                              value={config.barcode.top}
                              onChange={(v) => updateBarcode({ top: v })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                              Links (%)
                            </Label>
                            <PctInput
                              value={config.barcode.left}
                              onChange={(v) => updateBarcode({ left: v })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                              Breite
                            </Label>
                            <Input
                              value={config.barcode.width}
                              placeholder="3cm"
                              onChange={(e) =>
                                updateBarcode({ width: e.target.value })
                              }
                              className="text-sm w-20 text-right"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                              Höhe
                            </Label>
                            <Input
                              value={config.barcode.height}
                              placeholder="1.6cm"
                              onChange={(e) =>
                                updateBarcode({ height: e.target.value })
                              }
                              className="text-sm w-20 text-right"
                            />
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Barcode-Typ: code128 (fest)
                        </p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Export hint */}
            <div className="rounded-xl border bg-info-light/50 border-info/20 px-4 py-3 text-sm text-info">
              <strong>Tipp:</strong> Nach dem Speichern können Ausweise über{" "}
              <button
                onClick={() => router.push("/reports")}
                className="underline font-medium hover:text-info/80"
              >
                Reports → Ausweise
              </button>{" "}
              exportiert werden.
            </div>
          </div>

          {/* ===== Right: Preview ===== */}
          <div className="lg:sticky lg:top-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Vorschau
              </h2>
              <span className="text-xs text-muted-foreground">
                {config.grid.columns} × {config.grid.rows} ={" "}
                {config.grid.columns * config.grid.rows} Etiketten/Seite
              </span>
            </div>
            <LabelPreview config={config} imageUrl={imageUrl} />
            <p className="text-[10px] text-center text-muted-foreground mt-2">
              Beispieldaten: „Lena Müller · 4a · #1042"
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// =============================================================================
// LineEditor sub-component
// =============================================================================

interface LineEditorProps {
  line: LabelLine;
  index: number;
  onChange: (updates: Partial<LabelLine>) => void;
  onRemove: () => void;
  onInsertPlaceholder: (placeholder: string) => void;
}

function LineEditor({
  line,
  index,
  onChange,
  onRemove,
  onInsertPlaceholder,
}: LineEditorProps) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
      <div className="flex items-center gap-1.5 justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Zeile {index + 1}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 size={12} />
        </Button>
      </div>

      {/* Text + placeholder selector */}
      <div className="flex gap-1.5">
        <Input
          value={line.text}
          placeholder="z.B. User.firstName User.lastName"
          onChange={(e) => onChange({ text: e.target.value })}
          className="text-xs flex-1"
        />
        <select
          className="text-xs border rounded-md px-1.5 bg-background text-muted-foreground cursor-pointer"
          value=""
          onChange={(e) => {
            if (e.target.value) onInsertPlaceholder(e.target.value);
            e.target.value = "";
          }}
          title="Platzhalter einfügen"
        >
          <option value="" disabled>
            + Feld
          </option>
          {USER_PLACEHOLDER_FIELDS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Position + size */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="space-y-0.5">
          <Label className="text-[10px] text-muted-foreground">Oben</Label>
          <PctInput
            value={line.top}
            onChange={(v) => onChange({ top: v })}
            placeholder="75%"
          />
        </div>
        <div className="space-y-0.5">
          <Label className="text-[10px] text-muted-foreground">Links</Label>
          <PctInput
            value={line.left}
            onChange={(v) => onChange({ left: v })}
            placeholder="3%"
          />
        </div>
        <div className="space-y-0.5">
          <Label className="text-[10px] text-muted-foreground">
            Größe (pt)
          </Label>
          <Input
            type="number"
            min={6}
            max={48}
            value={line.fontSize}
            onChange={(e) =>
              onChange({ fontSize: parseInt(e.target.value) || 12 })
            }
            className="text-xs text-right"
          />
        </div>
      </div>

      {/* Color */}
      <div className="flex items-center gap-2">
        <Label className="text-[10px] text-muted-foreground w-10">Farbe</Label>
        <input
          type="color"
          value={line.color}
          onChange={(e) => onChange({ color: e.target.value })}
          className="w-7 h-7 rounded cursor-pointer border border-border p-0.5 bg-background"
        />
        <Input
          value={line.color}
          onChange={(e) => onChange({ color: e.target.value })}
          className="font-mono text-xs w-24"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
