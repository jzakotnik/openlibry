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
  const value = (book as any)[fieldType] ?? "";

  return (
    <div className="relative pt-4">
      <label
        htmlFor={`book-${fieldType}-select`}
        className="absolute top-0 left-0 text-xs font-medium text-gray-500 select-none"
      >
        {label}
      </label>
      <select
        id={`book-${fieldType}-select`}
        value={value}
        disabled={!editable}
        onChange={(e) => {
          const raw = e.target.value;
          // Keep the value type consistent: if options use numbers, parse it
          const parsed =
            typeof options[0]?.value === "number" ? Number(raw) : raw;
          setBookData({ ...book, [fieldType]: parsed });
        }}
        className={[
          "w-full bg-transparent text-sm text-gray-900",
          "border-0 border-b border-gray-300",
          "focus:border-b-2 focus:outline-none transition-colors duration-150",
          "py-1.5 px-0 appearance-none cursor-pointer",
          "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')]",
          "bg-[length:12px] bg-[right_4px_center] bg-no-repeat",
          !editable && "text-gray-500 cursor-not-allowed border-gray-200",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
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
