import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookType } from "@/entities/BookType";
import { translations } from "@/entities/fieldTranslations";
import { Dispatch } from "react";

type SelectOption = {
  value: string | number;
  label: string;
};

type BookSelectProps = {
  fieldType: string;
  editable: boolean;
  setBookData: Dispatch<BookType>;
  book: BookType;
  label: string;
  options: SelectOption[];
};

const BookSelect = ({
  fieldType,
  editable,
  setBookData,
  book,
  label,
  options,
}: BookSelectProps) => {
  const value = String((book as any)[fieldType] ?? "");

  const handleChange = (raw: string) => {
    const parsed =
      typeof options[0]?.value === "number" ? Number(raw) : raw;
    setBookData({ ...book, [fieldType]: parsed });
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={`book-${fieldType}-select`}
        className="text-xs text-muted-foreground"
      >
        {label}
      </Label>
      <Select
        value={value}
        onValueChange={handleChange}
        disabled={!editable}
      >
        <SelectTrigger id={`book-${fieldType}-select`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={String(opt.value)}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BookSelect;

// ─────────────────────────────────────────────────────────────────────────────
// Pre-built option sets for common use
// ─────────────────────────────────────────────────────────────────────────────

export const rentalStatusOptions: SelectOption[] = [
  "available",
  "rented",
  "broken",
  "presentation",
  "ordered",
  "lost",
  "remote",
].map((s) => ({
  value: s,
  label: (translations as any)["rentalStatus"][s],
}));

export const renewalCountOptions: SelectOption[] = [
  { value: 0, label: "Nicht verlängert" },
  { value: 1, label: "1x verlängert" },
  { value: 2, label: "2x verlängert" },
  { value: 3, label: "3x verlängert" },
  { value: 4, label: "4x verlängert" },
  { value: 5, label: "5x verlängert" },
];
