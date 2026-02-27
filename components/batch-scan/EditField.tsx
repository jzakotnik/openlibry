import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EditField({
  label,
  value,
  onChange,
  required = false,
  error = false,
  errorText,
  type = "text",
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  error?: boolean;
  errorText?: string;
  type?: string;
  multiline?: boolean;
}) {
  const id = `edit-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className="border-input placeholder:text-muted-foreground flex w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] resize-y aria-invalid:border-destructive"
          aria-invalid={error || undefined}
        />
      ) : (
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error || undefined}
        />
      )}
      {error && errorText && (
        <p className="text-xs text-destructive">{errorText}</p>
      )}
    </div>
  );
}
