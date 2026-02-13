import { BookType } from "@/entities/BookType";
import { translations } from "@/entities/fieldTranslations";
import { Dispatch } from "react";

type BookFieldProps = {
  fieldType: string;
  editable: boolean;
  setBookData: Dispatch<BookType>;
  book: BookType;
  /** "text" (default), "textarea", or "number" */
  variant?: "text" | "textarea" | "number";
  /** Auto-focus this field on mount */
  autoFocus?: boolean;
};

const BookField = ({
  fieldType,
  editable,
  setBookData,
  book,
  variant = "text",
  autoFocus = false,
}: BookFieldProps) => {
  const label = (translations["books"] as any)[fieldType] ?? fieldType;
  const value = (book as any)[fieldType] ?? "";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const newValue =
      variant === "number" ? parseInt(e.target.value) : e.target.value;
    setBookData({ ...book, [fieldType]: newValue });
  };

  const baseInputClasses = [
    "w-full bg-transparent text-sm text-gray-900 placeholder-gray-400",
    "border-0 border-b border-gray-300",
    "focus:border-b-2 focus:outline-none transition-colors duration-150",
    "py-1.5 px-0",
    !editable && "text-gray-500 cursor-not-allowed border-gray-200",
  ]
    .filter(Boolean)
    .join(" ");

  // Focus ring color via inline style to match palette
  const focusStyle = editable ? { borderBottomColor: undefined } : {};

  return (
    <div className="relative pt-4" data-cy={`book-${fieldType}-field`}>
      <label
        htmlFor={fieldType}
        className="absolute top-0 left-0 text-xs font-medium text-gray-500 select-none"
      >
        {label}
      </label>

      {variant === "textarea" ? (
        <textarea
          id={fieldType}
          name={fieldType}
          value={value}
          disabled={!editable}
          rows={3}
          autoFocus={autoFocus}
          onChange={handleChange}
          className={`${baseInputClasses} resize-y min-h-[2.5rem]`}
          style={focusStyle}
        />
      ) : (
        <input
          id={fieldType}
          name={fieldType}
          type={variant === "number" ? "number" : "text"}
          value={value}
          disabled={!editable}
          autoFocus={autoFocus}
          onChange={handleChange}
          className={baseInputClasses}
          style={focusStyle}
        />
      )}
    </div>
  );
};

export default BookField;
