/* eslint-disable no-use-before-define */
import React, { useState } from "react";

import ClearIcon from "@mui/icons-material/Clear";
import { BookType } from "@/entities/BookType";

import { Autocomplete, Chip, TextField, Grid } from "@mui/material";

interface RentalSearchBarPropType {
  books: Array<BookType>;
}

export default function RentalSearchBar({ books }: RentalSearchBarPropType) {
  const [searchContent, setSearchContent] = useState([]);

  const valHtml = searchContent.map((option, index) => {
    // This is to handle new options added by the user (allowed by freeSolo prop).
    const label = option;
    return (
      <Chip
        key={label}
        label={label}
        variant={"outlined"}
        deleteIcon={<ClearIcon />}
        onDelete={() => {
          const newSearchContent = searchContent.filter(
            (entry) => entry !== option
          );
          setSearchContent(newSearchContent);
        }}
      />
    );
  });

  return (
    <span>
      <Autocomplete
        fullWidth
        multiple
        id="search-standard"
        freeSolo
        filterSelectedOptions
        options={["test1", "test2"]}
        onChange={(e, newValue: any) => {
          //setBookTopics(newValue);
          setSearchContent([...searchContent, newValue]);
        }}
        getOptionLabel={(option) => option}
        renderTags={() => {
          return null;
        }}
        value={searchContent}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            placeholder="Suchtext"
            margin="normal"
            fullWidth
          />
        )}
      />
      <div className="selectedTags">{valHtml}</div>
    </span>
  );
}
