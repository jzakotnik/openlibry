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
    <div className="relative pt-4" data-cy={`book_${fieldType}_datepicker`}>
      <label
        htmlFor={`date-${fieldType}`}
        className="absolute top-0 left-0 text-xs font-medium text-gray-500 select-none"
      >
        {label}
      </label>
      <input
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
        className={[
          "w-full bg-transparent text-sm text-gray-900",
          "border-0 border-b border-gray-300",
          "focus:border-b-2 focus:outline-none transition-colors duration-150",
          "py-1.5 px-0",
          !editable && "text-gray-500 cursor-not-allowed border-gray-200",
        ]
          .filter(Boolean)
          .join(" ")}
      />
    </div>
  );
};

export default BookDateField;
