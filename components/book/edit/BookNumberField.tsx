import { Grid, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { translations } from "@/entities/fieldTranslations";

import * as React from "react";

const BookNumberField = (props: any): any => {
  const fieldType = props.fieldType;
  const editable = props.editable;
  const setBookData = props.setBookData;
  const book = props.book;
  return (
    <Grid item xs={12} sm={6}>
      <FormControl fullWidth>
        <InputLabel id="renewal-count-label">Verlängerungen</InputLabel>
        <Select
          labelId="renewal-count-label"
          id="renewal-count-input"
          value={(book as any)[fieldType]}
          disabled={!editable}
          defaultValue={(book as any)[fieldType]}
          label="Verlängerungen"
          onChange={(event: any) => {
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
