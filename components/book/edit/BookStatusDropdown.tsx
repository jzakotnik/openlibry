import { BookType } from "@/entities/BookType";
import { translations } from "@/entities/fieldTranslations";
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { Dispatch } from "react";

type BookTextFieldProps = {
  fieldType: string;
  editable: boolean;
  setBookData: Dispatch<BookType>;
  book: BookType;
};

const BookStatusDropdown = ({
  fieldType,
  editable,
  setBookData,
  book,
}: BookTextFieldProps) => {
  //use these statusses for the book with according translations

  const status = [
    "available",
    "rented",
    "broken",
    "presentation",
    "ordered",
    "lost",
    "remote",
  ];

  return (
    <Grid item xs={12} sm={6}>
      <FormControl fullWidth>
        <InputLabel id="book-status-label">Status</InputLabel>
        <Select
          labelId="book-status-label"
          id="book-status"
          value={(book as any)[fieldType]}
          disabled={!editable}
          defaultValue={(book as any)[fieldType]}
          label="Status"
          onChange={(event: SelectChangeEvent<HTMLInputElement>) => {
            setBookData({ ...book, [fieldType]: event.target.value });
          }}
        >
          {status.map((s: string) => {
            return (
              <MenuItem key={s} value={s}>
                {(translations as any)["rentalStatus"][s]}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </Grid>
  );
};

export default BookStatusDropdown;
