import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookType } from "@/entities/BookType";
import { translations } from "@/entities/fieldTranslations";
import { t } from "@/lib/i18n";
import { Camera } from "lucide-react";
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
  /** If provided, renders a camera button inside the input (ISBN field only) */
  onCameraClick?: () => void;
};

const BookField = ({
  fieldType,
  editable,
  setBookData,
  book,
  variant = "text",
  autoFocus = false,
  onCameraClick,
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

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={fieldType} className="text-xs text-muted-foreground">
        {label}
      </Label>

      {variant === "textarea" ? (
        <Textarea
          data-cy={`book-${fieldType}-field`}
          id={fieldType}
          name={fieldType}
          value={value}
          disabled={!editable}
          rows={3}
          autoFocus={autoFocus}
          onChange={handleChange}
          className="resize-y min-h-[2.5rem]"
        />
      ) : onCameraClick ? (
        <div className="relative">
          <Input
            data-cy={`book-${fieldType}-field`}
            id={fieldType}
            name={fieldType}
            type={variant === "number" ? "number" : "text"}
            value={value}
            disabled={!editable}
            autoFocus={autoFocus}
            onChange={handleChange}
            className="pr-10"
          />
          <button
            type="button"
            onClick={onCameraClick}
            disabled={!editable}
            aria-label={t("bookEditForm.openCameraScanner")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Camera className="size-4" />
          </button>
        </div>
      ) : (
        <Input
          data-cy={`book-${fieldType}-field`}
          id={fieldType}
          name={fieldType}
          type={variant === "number" ? "number" : "text"}
          value={value}
          disabled={!editable}
          autoFocus={autoFocus}
          onChange={handleChange}
        />
      )}
    </div>
  );
};

export default BookField;
