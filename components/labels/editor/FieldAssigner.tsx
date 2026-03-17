/**
 * Field assignment controls for the template editor.
 *
 * Four rows — one per field zone (spine, horizontal1–3).
 * Each row has a content dropdown, font size input, and alignment toggle.
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
  spine: "Buchrücken",
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
    <div className="space-y-4">
      <Label>Feldzuordnung</Label>
      {fieldKeys.map((key) => {
        const field = fields[key];
        const isBarcode = field.content === "barcode";

        return (
          <div
            key={key}
            className="grid grid-cols-[120px_1fr_70px_auto] items-center gap-2"
          >
            {/* Zone label */}
            <span className="text-sm font-medium text-muted-foreground">
              {FIELD_LABELS[key]}
            </span>

            {/* Content dropdown */}
            <Select
              value={field.content}
              onValueChange={(value) =>
                onChange(key, {
                  ...field,
                  content: value as LabelFieldContent,
                  // Auto-set font size to 0 for barcode
                  fontSizeMax:
                    value === "barcode" ? 0 : field.fontSizeMax || 10,
                })
              }
            >
              <SelectTrigger className="h-8" data-cy={`field-content-${key}`}>
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
            <Input
              type="number"
              min={4}
              max={28}
              className="h-8 text-center"
              value={isBarcode ? "" : field.fontSizeMax}
              onChange={(e) =>
                onChange(key, {
                  ...field,
                  fontSizeMax: parseInt(e.target.value) || 10,
                })
              }
              disabled={isBarcode}
              placeholder={isBarcode ? "–" : "pt"}
              title="Maximale Schriftgröße (pt)"
              data-cy={`field-fontsize-${key}`}
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
              <ToggleGroupItem value="left" className="h-8 w-8 p-0">
                <AlignLeft className="h-3.5 w-3.5" />
              </ToggleGroupItem>
              <ToggleGroupItem value="center" className="h-8 w-8 p-0">
                <AlignCenter className="h-3.5 w-3.5" />
              </ToggleGroupItem>
              <ToggleGroupItem value="right" className="h-8 w-8 p-0">
                <AlignRight className="h-3.5 w-3.5" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        );
      })}
    </div>
  );
}
