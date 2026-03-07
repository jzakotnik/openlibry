import { Check, Pencil, Plus } from "lucide-react";
import { KeyboardEvent, useEffect, useRef, useState } from "react";

export function InlineChipField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  formatDisplay,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  formatDisplay?: (v: string) => string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasValue = value !== undefined && value !== "" && value !== ";";

  useEffect(() => {
    if (isEditing) {
      setDraft(value === ";" ? "" : value);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [isEditing, value]);

  const commit = () => {
    onChange(draft);
    setIsEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  };

  if (isEditing) {
    return (
      <div className="inline-flex items-center gap-1 rounded-md border border-blue-300 bg-white px-2 py-1 shadow-sm ring-2 ring-blue-100">
        <span className="text-[10px] font-medium text-blue-600 shrink-0">
          {label}:
        </span>
        <input
          ref={inputRef}
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          placeholder={placeholder}
          className="w-24 min-w-0 bg-transparent text-xs outline-none placeholder:text-muted-foreground/60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            commit();
          }}
          className="shrink-0 text-blue-500 hover:text-blue-700"
        >
          <Check className="size-3" />
        </button>
      </div>
    );
  }

  if (hasValue) {
    return (
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="group inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
      >
        <span className="text-[10px] font-medium text-muted-foreground">
          {label}:
        </span>
        <span className="font-medium truncate max-w-[140px]">
          {formatDisplay ? formatDisplay(value) : value}
        </span>
        <Pencil className="size-2.5 text-muted-foreground/0 group-hover:text-blue-500 transition-colors shrink-0" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className="inline-flex items-center gap-1 rounded-md border border-dashed border-gray-300 bg-transparent px-2 py-1 text-xs text-muted-foreground hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
    >
      <Plus className="size-3" />
      {label}
    </button>
  );
}
