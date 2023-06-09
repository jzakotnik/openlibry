/* eslint-disable no-use-before-define */
import React, { useState } from "react";

import ClearIcon from "@mui/icons-material/Clear";

import { Autocomplete, Chip, TextField, Grid } from "@mui/material";

const parseTopics = (combined: string) => {
  const parsedTopics = combined.split(";").filter((t: string) => t.length > 0);
  return parsedTopics;
};

export default function BookTopicsChips(props: any) {
  const fieldType = props.fieldType;
  const editable = props.editable;
  const setBookData = props.setBookData;
  const book = props.book;
  const topics = props.topics;
  //const [bookTopics, setBookTopics] = useState(parseTopics(book.topics));

  const serializeTopics = (topics: string[]): string => {
    return topics.join(";");
  };

  // test topics
  console.log("Topics for this book:", book.topics);
  console.log("All topics", topics);
  const valHtml = parseTopics(book.topics).map((option, index) => {
    // This is to handle new options added by the user (allowed by freeSolo prop).
    const label = option;
    return (
      <Chip
        key={label}
        label={label}
        deleteIcon={<ClearIcon />}
        onDelete={() => {
          if (editable) {
            const newBookTopics = parseTopics(book.topics).filter(
              (entry) => entry !== option
            );
            setBookData({
              ...book,
              [fieldType]: serializeTopics(newBookTopics),
            });
            //setBookTopics(newBookTopics);
          }
        }}
      />
    );
  });

  return (
    <Grid item xs={12} sm={6}>
      <Autocomplete
        disabled={!editable}
        fullWidth
        multiple
        id="tags-standard"
        freeSolo
        filterSelectedOptions
        options={topics}
        onChange={(e, newValue: any) => {
          //setBookTopics(newValue);
          setBookData({ ...book, [fieldType]: serializeTopics(newValue) });
        }}
        getOptionLabel={(option) => option}
        renderTags={() => {
          return null;
        }}
        value={parseTopics(book.topics)}
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
