/* eslint-disable no-use-before-define */
import React, { useEffect, useState } from "react";

import ClearIcon from "@mui/icons-material/Clear";
import { BookType } from "@/entities/BookType";
import { UserType } from "@/entities/UserType";

import { Autocomplete, Chip, TextField, Grid } from "@mui/material";

interface RentalSearchBarPropType {
  books: Array<BookType>;
  users: Array<UserType>;
}

export default function RentalSearchBar({
  books,
  users,
}: RentalSearchBarPropType) {
  const [searchContent, setSearchContent] = useState([]);
  const [searchOptions, setSearchOptions] = useState([]);

  useEffect(() => {
    const options: any = [];
    users.map((u) => {
      options.push({
        label: u.lastName + ", " + u.firstName,
        type: "user",
        key: u.id,
        id: u.id,
      });
    });

    setSearchOptions(options);
  }, []);

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
        disableClearable
        freeSolo
        filterSelectedOptions
        options={searchOptions.map((s) => s)}
        onChange={(e, newValue: any) => {
          //setBookTopics(newValue);
          //setSearchContent([...searchContent, newValue]);
        }}
        renderTags={() => {
          return null;
        }}
        value={searchContent}
        renderOption={(props, option) => {
          return (
            <li {...props} key={option.id}>
              {option.label}
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Nutzersuche"
            InputProps={{
              ...params.InputProps,
              type: "search",
            }}
          />
        )}
      />
      <div className="selectedTags">{valHtml}</div>
    </span>
  );
}
