/**
 * Dropdown to select a label template.
 * Shows template name and assigned sheet config.
 */

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LabelTemplate } from "@/lib/labels/types";

interface TemplateSelectorProps {
  templates: LabelTemplate[];
  value: string;
  onChange: (templateId: string) => void;
  loading?: boolean;
  /** Hide the label above the dropdown (for inline/header usage) */
  hideLabel?: boolean;
}

export default function TemplateSelector({
  templates,
  value,
  onChange,
  loading,
  hideLabel,
}: TemplateSelectorProps) {
  return (
    <div className={hideLabel ? "" : "space-y-1.5"}>
      {!hideLabel && (
        <Label htmlFor="template-selector">Etikettenvorlage</Label>
      )}
      <Select value={value} onValueChange={onChange} disabled={loading}>
        <SelectTrigger id="template-selector" data-cy="template-selector">
          <SelectValue placeholder="Vorlage auswählen…" />
        </SelectTrigger>
        <SelectContent>
          {templates.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              {template.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
