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

/** Human-readable labels for the 4 field zones */
const FIELD_LABELS: Record<string, string> = {
  spine: "Rücken",
  horizontal1: "Zeile 1",
  horizontal2: "Zeile 2",
  horizontal3: "Zeile 3",
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
    <div className="space-y-3">
      <Label>Feldzuordnung (Label, Größe, max Zeichen, Orientierung)</Label>

      {fieldKeys.map((key) => {
        const field = fields[key];
        const isBarcode = field.content === "barcode";
        const isNone = field.content === "none";
        const disableTextControls = isBarcode || isNone;

        return (
          <div
            key={key}
            // 70px zone label | 1fr select | 44px pt | 44px chars | auto toggles
            // At 374px card inner width: 70+44+44+~88+32gaps = 278px fixed → ~96px for 1fr
            className="grid grid-cols-[70px_1fr_44px_44px_auto] items-center gap-2"
          >
            {/* Zone label */}
            <span className="text-xs font-medium text-muted-foreground truncate">
              {FIELD_LABELS[key]}
            </span>

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

            {/* Font size — placeholder doubles as column header */}
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
              title="Maximale Schriftgröße (pt)"
              data-cy={`field-fontsize-${key}`}
            />

            {/* Max length — ∞ signals "no limit" without extra chrome */}
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
              title="Maximale Zeichenanzahl (leer = unbegrenzt)"
              data-cy={`field-maxlength-${key}`}
            />

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
              <ToggleGroupItem value="left" className="h-7 w-7 p-0">
                <AlignLeft className="h-3 w-3" />
              </ToggleGroupItem>
              <ToggleGroupItem value="center" className="h-7 w-7 p-0">
                <AlignCenter className="h-3 w-3" />
              </ToggleGroupItem>
              <ToggleGroupItem value="right" className="h-7 w-7 p-0">
                <AlignRight className="h-3 w-3" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        );
      })}
    </div>
  );
}
