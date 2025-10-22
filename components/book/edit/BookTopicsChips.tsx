/* eslint-disable no-use-before-define */

import { BookType } from "@/entities/BookType";
import ClearIcon from "@mui/icons-material/Clear";

import { Autocomplete, Chip, TextField } from "@mui/material";
import { Dispatch } from "react";

type BookTopicsChipsProps = {
  fieldType: string;
  editable: boolean;
  setBookData: Dispatch<BookType>;
  book: BookType;
  topics: string[] | string | undefined | null;
};

function parseTopics(topics: string[] | string | undefined | null): string[] {
  if (Array.isArray(topics)) return topics;
  if (typeof topics === "string") {
    // Split by semicolon, trim spaces
    return topics.split(";").map(t => t.trim()).filter(Boolean);
  }
  return [];
}

export default function BookTopicsChips({
  fieldType,
  editable,
  setBookData,
  book,
  topics,
}: BookTopicsChipsProps) {
  // Autocomplete options: all available topics (split by semicolon)
  const autocompleteOptions = parseTopics(topics);

  // Chips: book's current topics (split by semicolon)
  const currentBookTopics = parseTopics(book.topics);


  const serializeTopics = (topics: string[]): string => {
    return topics.join(";");
  };

  const valHtml = currentBookTopics.map((option, index) => (
    <Chip
      key={option}
      label={option}
      variant={!editable ? "outlined" : "filled"}
      deleteIcon={<ClearIcon />}
      onDelete={() => {
        if (editable) {
          const newBookTopics = currentBookTopics.filter(entry => entry !== option);
          setBookData({ ...book, [fieldType]: serializeTopics(newBookTopics) });
        }
      }}
    />
  ));

  return (
    <span>
      <Autocomplete
        disabled={!editable}
        fullWidth
        multiple
        id="tags-standard"
        freeSolo
        filterSelectedOptions
        options={autocompleteOptions}
        onChange={(e, newValue: string[]) => {
          setBookData({ ...book, [fieldType]: serializeTopics(newValue) });
        }}
        getOptionLabel={option => option}
        renderTags={() => null}
        value={currentBookTopics}
        renderInput={params => (
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
    </span>
  );
}