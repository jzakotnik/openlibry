import { Grid, TextField } from "@mui/material";
import { translations } from "@/entities/fieldTranslations";

const BookTextField = (props: any): any => {
  const fieldType = props.fieldType;
  const editable = props.editable;
  const setBookData = props.setBookData;
  const book = props.book;
  return (
    <Grid item xs={12} sm={6}>
      <TextField
        id={fieldType}
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
    </Grid>
  );
};

export default BookTextField;
