import { BookType } from "@/entities/BookType";
import { translations } from "@/entities/fieldTranslations";
import { TextField } from "@mui/material";
import { Dispatch } from "react";

type BookTextFieldProps = {
  fieldType: string;
  editable: boolean;
  setBookData: Dispatch<BookType>;
  book: BookType;
  /** Optional: Auto-focus this field on mount */
  autoFocus?: boolean;
};

const BookTextField = ({
  fieldType,
  editable,
  setBookData,
  book,
  autoFocus = false,
}: BookTextFieldProps) => {
  return (
    <TextField
      id={fieldType}
      name={fieldType}
      label={(translations["books"] as any)[fieldType]}
      InputLabelProps={{ shrink: true }} // Switch off label floating because of autofill function
      value={(book as any)[fieldType] ?? ""}
      disabled={!editable}
      fullWidth
      variant="standard"
      autoFocus={autoFocus}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        setBookData({ ...book, [fieldType]: event.target.value });
      }}
      data-cy={`book-${fieldType}-field`}
    />
  );
};

export default BookTextField;
