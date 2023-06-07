import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { translations } from "@/entities/fieldTranslations";

import * as React from "react";

const BookStatusDropdown = (props: any): any => {
  const fieldType = props.fieldType;
  const editable = props.editable;
  const setBookData = props.setBookData;
  const book = props.book;
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
          onChange={(event: any) => {
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
