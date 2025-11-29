import { BookType } from "@/entities/BookType";
import { translations } from "@/entities/fieldTranslations";
import { TextField } from "@mui/material";
import { Dispatch } from "react";

type BookPagesFieldProps = {
  fieldType: string;
  editable: boolean;
  setBookData: Dispatch<BookType>;
  book: BookType;
};

const BookPagesField = ({
  fieldType,
  editable,
  setBookData,
  book,
}: BookPagesFieldProps) => {
  return (
    <TextField
      id={fieldType}
      name={fieldType}
      label={(translations["books"] as any)[fieldType]}
      defaultValue={(book as any)[fieldType]}
      disabled={!editable}
      fullWidth
      type="number"
      variant="standard"
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        const pageNumber = parseInt(event.target.value);

        //console.log("Saving ", pageNumber);
        setBookData({
          ...book,
          [fieldType]: pageNumber,
        });
      }}
      data-cy={`book-${fieldType}-field`}
    />
  );
};

export default BookPagesField;
