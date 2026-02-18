import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookType } from "@/entities/BookType";
import { translations } from "@/entities/fieldTranslations";
import {
  convertDateToDayString,
  convertStringToDay,
} from "@/lib/utils/dateutils";
import { Dispatch } from "react";

type BookDateFieldProps = {
  fieldType: string;
  editable: boolean;
  setBookData: Dispatch<BookType>;
  book: BookType;
};

/**
 * Convert the app's internal date string to HTML date input format (YYYY-MM-DD).
 * Falls back to empty string if the value is invalid.
 */
const toInputDate = (value: string | null | undefined): string => {
  if (!value) return "";
  try {
    const d = convertStringToDay(value);
    return d.isValid() ? d.format("YYYY-MM-DD") : "";
  } catch {
    return "";
  }
};

/**
 * Convert HTML date input value (YYYY-MM-DD) back to the app's internal format.
 */
const fromInputDate = (htmlValue: string): string => {
  if (!htmlValue) return "";
  try {
    return convertDateToDayString(new Date(htmlValue));
  } catch {
    return htmlValue;
  }
};

const BookDateField = ({
  fieldType,
  editable,
  setBookData,
  book,
}: BookDateFieldProps) => {
  const label = (translations["books"] as any)[fieldType] ?? fieldType;
  const rawValue = (book as any)[fieldType];
  const inputValue = toInputDate(rawValue);

  return (
    <div
      className="flex flex-col gap-1.5"
      data-cy={`book_${fieldType}_datepicker`}
    >
      <Label
        htmlFor={`date-${fieldType}`}
        className="text-xs text-muted-foreground"
      >
        {label}
      </Label>
      <Input
        id={`date-${fieldType}`}
        type="date"
        value={inputValue}
        disabled={!editable}
        onChange={(e) => {
          const val = e.target.value;
          if (!val) return;
          setBookData({
            ...book,
            [fieldType]: fromInputDate(val),
          });
        }}
      />
    </div>
  );
};

export default BookDateField;
