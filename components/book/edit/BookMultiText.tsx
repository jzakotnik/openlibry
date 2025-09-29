import { BookType } from "@/entities/BookType";
import { translations } from "@/entities/fieldTranslations";
import { TextField } from "@mui/material";
import { Dispatch } from "react";

interface BookMultiTextPropsType {
  fieldType: string;
  editable: boolean;
  setBookData: Dispatch<BookType>;
  book: BookType;
}

const BookMultiText = ({
  fieldType,
  editable,
  setBookData,
  book,
}: BookMultiTextPropsType) => {
  return (
    <TextField
      id={fieldType}
      multiline
      maxRows={4}
      name={fieldType}
      label={(translations["books"] as any)[fieldType]}
      InputLabelProps={{ shrink: true }}//because of autofill function
      defaultValue={(book as any)[fieldType]}
      disabled={!editable}
      fullWidth
      variant="standard"
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        setBookData({ ...book, [fieldType]: event.target.value });
      }}
    />
  );
};

export default BookMultiText;
