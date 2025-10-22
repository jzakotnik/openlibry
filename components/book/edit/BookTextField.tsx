import { BookType } from "@/entities/BookType";
import { translations } from "@/entities/fieldTranslations";
import { TextField } from "@mui/material";
import { Dispatch } from "react";

type BookTextFieldProps = {
  fieldType: string;
  editable: boolean;
  setBookData: Dispatch<BookType>;
  book: BookType;
};

const BookTextField = ({
  fieldType,
  editable,
  setBookData,
  book,
}: BookTextFieldProps) => {
  return (
    <TextField
      id={fieldType}
      name={fieldType}
      label={(translations["books"] as any)[fieldType]}
      InputLabelProps={{ shrink: true }} // Switch off label floating because of autofill function
      //defaultValue={(book as any)[fieldType]}
      value={(book as any)[fieldType] ?? ""}
      disabled={!editable}
      fullWidth
      variant="standard"
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        setBookData({ ...book, [fieldType]: event.target.value });
      }}
    />
  );
};

export default BookTextField;
