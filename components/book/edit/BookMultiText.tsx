import { translations } from "@/entities/fieldTranslations";
import { TextField } from "@mui/material";

const BookMultiText = (props: any): any => {
  const fieldType = props.fieldType;
  const editable = props.editable;
  const setBookData = props.setBookData;
  const book = props.book;
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
