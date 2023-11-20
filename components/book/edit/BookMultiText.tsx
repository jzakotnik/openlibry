import { BookType } from "@/entities/BookType";
import { translations } from "@/entities/fieldTranslations";
import { TextField } from "@mui/material";

interface BookMultiTextPropsType {
  fieldType: string;
  editable: boolean;
  setBookData: any;
  book: BookType;
}

const BookMultiText = ({
  fieldType,
  editable,
  setBookData,
  book,
}: BookMultiTextPropsType): any => {
  return (
    <TextField
      id={fieldType}
      multiline
      maxRows={4}
      name={fieldType}
      label={(translations["books"] as any)[fieldType]}
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
