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
import { t } from "@/lib/i18n";
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
  { value: 0, label: t("bookSelect.renewalNone") },
  { value: 1, label: t("bookSelect.renewalCountFormat", { n: 1 }) },
  { value: 2, label: t("bookSelect.renewalCountFormat", { n: 2 }) },
  { value: 3, label: t("bookSelect.renewalCountFormat", { n: 3 }) },
  { value: 4, label: t("bookSelect.renewalCountFormat", { n: 4 }) },
  { value: 5, label: t("bookSelect.renewalCountFormat", { n: 5 }) },
];
