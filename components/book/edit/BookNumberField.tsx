import { BookType } from "@/entities/BookType";
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { Dispatch } from "react";

type BookNumberFieldProps = {
  fieldType: string;
  editable: boolean;
  setBookData: Dispatch<BookType>;
  book: BookType;
};

const BookNumberField = ({
  fieldType,
  editable,
  setBookData,
  book,
}: BookNumberFieldProps) => {
  return (
    <Grid size={{ xs: 12, sm: 6 }} >
      <FormControl fullWidth>
        <InputLabel id="renewal-count-label">Verlängerungen</InputLabel>
        <Select
          labelId="renewal-count-label"
          id="renewal-count-input"
          value={(book as any)[fieldType]}
          disabled={!editable}
          defaultValue={(book as any)[fieldType]}
          label="Verlängerungen"
          onChange={(event: SelectChangeEvent) => {
            setBookData({ ...book, [fieldType]: event.target.value });
          }}
        >
          <MenuItem value={0}>Nicht verlängert</MenuItem>
          <MenuItem value={1}>1x verlängert</MenuItem>
          <MenuItem value={2}>2x verlängert</MenuItem>
          <MenuItem value={3}>3x verlängert</MenuItem>
          <MenuItem value={4}>4x verlängert</MenuItem>
          <MenuItem value={5}>5x verlängert</MenuItem>
        </Select>
      </FormControl>
    </Grid>
  );
};

export default BookNumberField;
