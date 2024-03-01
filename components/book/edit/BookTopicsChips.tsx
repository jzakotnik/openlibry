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
  topics: Array<string>;
};

const parseTopics = (combined: string) => {
  const parsedTopics = combined.split(";").filter((t: string) => t.length > 0);
  return parsedTopics;
};

export default function BookTopicsChips({
  fieldType,
  editable,
  setBookData,
  book,
  topics,
}: BookTopicsChipsProps) {
  //const [bookTopics, setBookTopics] = useState(parseTopics(book.topics));

  //why was this there?
  //if (!book.topics) return <span></span>;

  const serializeTopics = (topics: string[]): string => {
    return topics.join(";");
  };

  // test topics
  //console.log("Topics for this book:", book.topics);
  //console.log("All topics", topics);

  const valHtml = parseTopics(book.topics!).map((option, index) => {
    // This is to handle new options added by the user (allowed by freeSolo prop).
    const label = option;
    return (
      <Chip
        key={label}
        label={label}
        variant={!editable ? "outlined" : "filled"}
        deleteIcon={<ClearIcon />}
        onDelete={() => {
          if (editable) {
            if (!book.topics) return; //no topics? then you can't delete any
            const newBookTopics = parseTopics(book.topics).filter(
              (entry) => entry !== option
            );
            setBookData({
              ...book,
              [fieldType]: serializeTopics(newBookTopics),
            });
          }
        }}
      />
    );
  });

  return (
    <span>
      <Autocomplete
        disabled={!editable}
        fullWidth
        multiple
        id="tags-standard"
        freeSolo
        filterSelectedOptions
        options={topics}
        onChange={(e, newValue: string[]) => {
          //setBookTopics(newValue);
          setBookData({ ...book, [fieldType]: serializeTopics(newValue) });
        }}
        getOptionLabel={(option) => option}
        renderTags={() => {
          return null;
        }}
        value={book.topics ? parseTopics(book.topics) : []}
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
    </span>
  );
}
