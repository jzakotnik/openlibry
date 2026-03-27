/**
 * Field assignment controls for the template editor.
 *
 * Four rows — one per field zone (spine, horizontal1–3).
 * Each row has a content dropdown, font size input, max length input,
 * and alignment toggle.
 */

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  LabelFieldConfig,
  LabelFieldContent,
  TextAlign,
} from "@/lib/labels/types";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";

/** Human-readable labels for field content types */
const CONTENT_OPTIONS: { value: LabelFieldContent; label: string }[] = [
  { value: "title", label: "Titel" },
  { value: "subtitle", label: "Untertitel" },
  { value: "author", label: "Autor" },
  { value: "id", label: "Buchnummer" },
  { value: "school", label: "Schulname" },
  { value: "topics", label: "Themen (max. 3)" },
  { value: "barcode", label: "Barcode" },
  { value: "none", label: "Leer" },
];

/** Zone labels and their tooltip descriptions */
const FIELD_META: Record<string, { label: string; tooltip: string }> = {
  spine: {
    label: "Rücken",
    tooltip:
      "Schmaler Streifen auf der linken Seite des Etiketts. Der Text wird um 90° gedreht angezeigt — ideal für kurze Beschriftungen wie Thema oder Autor.",
  },
  horizontal1: {
    label: "Zeile 1",
    tooltip:
      "Obere der drei horizontalen Zeilen rechts vom Buchrücken. Meist für den Titel verwendet.",
  },
  horizontal2: {
    label: "Zeile 2",
    tooltip:
      "Mittlere horizontale Zeile. Typischerweise für den Autor oder ein Schlagwort.",
  },
  horizontal3: {
    label: "Zeile 3",
    tooltip:
      "Untere horizontale Zeile. Häufig für den Barcode oder eine zweite Infozeile.",
  },
};

type FieldKey = "spine" | "horizontal1" | "horizontal2" | "horizontal3";

interface FieldAssignerProps {
  fields: Record<FieldKey, LabelFieldConfig>;
  onChange: (fieldKey: FieldKey, config: LabelFieldConfig) => void;
}

export default function FieldAssigner({
  fields,
  onChange,
}: FieldAssignerProps) {
  const fieldKeys: FieldKey[] = [
    "spine",
    "horizontal1",
    "horizontal2",
    "horizontal3",
  ];

  return (
    <TooltipProvider>
      <div className="space-y-3">
        <Label>Feldzuordnung</Label>

        {fieldKeys.map((key) => {
          const field = fields[key];
          const isBarcode = field.content === "barcode";
          const isNone = field.content === "none";
          const disableTextControls = isBarcode || isNone;
          const meta = FIELD_META[key];

          return (
            <div
              key={key}
              className="grid grid-cols-[70px_1fr_44px_44px_auto] items-center gap-2"
            >
              {/* Zone label with tooltip */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs font-medium text-muted-foreground truncate cursor-help underline decoration-dotted underline-offset-2">
                    {meta.label}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-56">
                  {meta.tooltip}
                </TooltipContent>
              </Tooltip>

              {/* Content dropdown */}
              <Select
                value={field.content}
                onValueChange={(value) =>
                  onChange(key, {
                    ...field,
                    content: value as LabelFieldContent,
                    fontSizeMax:
                      value === "barcode" ? 0 : field.fontSizeMax || 10,
                    maxLength:
                      value === "barcode" || value === "none"
                        ? undefined
                        : field.maxLength,
                  })
                }
              >
                <SelectTrigger
                  className="h-7 text-xs min-w-0"
                  data-cy={`field-content-${key}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Font size */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Input
                    type="number"
                    min={4}
                    max={28}
                    className="h-7 text-center text-xs px-1"
                    value={disableTextControls ? "" : field.fontSizeMax}
                    onChange={(e) =>
                      onChange(key, {
                        ...field,
                        fontSizeMax: parseInt(e.target.value) || 10,
                      })
                    }
                    disabled={disableTextControls}
                    placeholder={disableTextControls ? "–" : "pt"}
                    data-cy={`field-fontsize-${key}`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  Maximale Schriftgröße (pt). Der Text wird automatisch
                  verkleinert, wenn er nicht passt.
                </TooltipContent>
              </Tooltip>

              {/* Max length */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Input
                    type="number"
                    min={1}
                    max={999}
                    className="h-7 text-center text-xs px-1"
                    value={
                      disableTextControls || field.maxLength == null
                        ? ""
                        : field.maxLength
                    }
                    onChange={(e) => {
                      const raw = e.target.value;
                      onChange(key, {
                        ...field,
                        maxLength:
                          raw === "" ? undefined : parseInt(raw) || undefined,
                      });
                    }}
                    disabled={disableTextControls}
                    placeholder={disableTextControls ? "–" : "∞"}
                    data-cy={`field-maxlength-${key}`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  Maximale Zeichenanzahl. Längere Texte werden mit … gekürzt.
                  Leer lassen für unbegrenzte Länge.
                </TooltipContent>
              </Tooltip>

              {/* Alignment toggle */}
              <ToggleGroup
                type="single"
                size="sm"
                value={field.align}
                onValueChange={(value) => {
                  if (value)
                    onChange(key, { ...field, align: value as TextAlign });
                }}
                data-cy={`field-align-${key}`}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem value="left" className="h-7 w-7 p-0">
                      <AlignLeft className="h-3 w-3" />
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>Linksbündig</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem value="center" className="h-7 w-7 p-0">
                      <AlignCenter className="h-3 w-3" />
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>Zentriert</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem value="right" className="h-7 w-7 p-0">
                      <AlignRight className="h-3 w-3" />
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>Rechtsbündig</TooltipContent>
                </Tooltip>
              </ToggleGroup>
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
