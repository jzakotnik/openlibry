/* eslint-disable no-use-before-define */
import React, { useState } from "react";

import RemoveIcon from "@mui/icons-material/Remove";
import ClearIcon from "@mui/icons-material/Clear";

import { Autocomplete, Chip, TextField, Grid } from "@mui/material";

const parseTopics = (combined: string) => {
  return combined.split(";");
};

export default function BookTopicsChips(props: any) {
  const fieldType = props.fieldType;
  const editable = props.editable;
  const setBookData = props.setBookData;
  const book = props.book;
  const topics = props.topics;
  const [val, setVal] = useState(parseTopics(book.topics));

  // test topics

  const valHtml = val.map((option, index) => {
    // This is to handle new options added by the user (allowed by freeSolo prop).
    const label = option;
    return (
      <Chip
        key={label}
        label={label}
        deleteIcon={<ClearIcon />}
        onDelete={() => {
          setVal(val.filter((entry) => entry !== option));
        }}
      />
    );
  });

  return (
    <Grid item xs={12} sm={6}>
      <Autocomplete
        enabled={!editable}
        fullWidth
        multiple
        id="tags-standard"
        freeSolo
        filterSelectedOptions
        options={topics}
        onChange={(e, newValue: any) => setVal(newValue)}
        getOptionLabel={(option) => option}
        renderTags={() => {}}
        value={val}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            placeholder="Schlagwörter"
            margin="normal"
            fullWidth
          />
        )}
      />
      <div className="selectedTags">{valHtml}</div>
    </Grid>
  );
}
