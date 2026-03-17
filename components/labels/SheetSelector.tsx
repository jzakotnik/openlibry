/**
 * Dropdown to select a sticker sheet configuration.
 * Shows product name, label dimensions, and labels per sheet.
 */

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SheetConfig } from "@/lib/labels/types";

interface SheetSelectorProps {
  sheets: SheetConfig[];
  value: string;
  onChange: (sheetId: string) => void;
  loading?: boolean;
}

export default function SheetSelector({
  sheets,
  value,
  onChange,
  loading,
}: SheetSelectorProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="sheet-selector">Etikettenbogen</Label>
      <Select value={value} onValueChange={onChange} disabled={loading}>
        <SelectTrigger id="sheet-selector" data-cy="sheet-selector">
          <SelectValue placeholder="Bogen auswählen…" />
        </SelectTrigger>
        <SelectContent>
          {sheets
            .filter((sheet) => sheet.label && sheet.grid)
            .map((sheet) => {
              const label = `${sheet.name} — ${sheet.label.width}×${sheet.label.height}mm, ${sheet.labelsPerSheet}/Blatt`;
              return (
                <SelectItem key={sheet.id} value={sheet.id}>
                  {label}
                </SelectItem>
              );
            })}
        </SelectContent>
      </Select>
    </div>
  );
}
