import {
  IconButton,
  InputBase,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

import Grid from "@mui/material/Grid";

interface BookSearchBarPropType {
  handleInputChange: React.ChangeEventHandler<
    HTMLTextAreaElement | HTMLInputElement
  >;
  bookSearchInput: string;
  searchResultNumber: number;
}

export default function PublicBookSearchBar({
  handleInputChange,
  bookSearchInput,
  searchResultNumber,
}: BookSearchBarPropType) {
  return (
    <Grid
      container
      direction="row"
      alignItems="center"
      justifyContent="center"
      sx={{ px: 10, my: 5 }}
    >
      <Grid item>
        <Paper
          component="form"
          sx={{
            p: "2px 4px",
            display: "flex",
            alignItems: "center",
            width: 400,
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            value={bookSearchInput}
            onChange={handleInputChange}
            placeholder="Buch suchen.."
            inputProps={{ "aria-label": "search books" }}
            data-cy="rental_input_searchbook"
          />
          <Tooltip title="Suche">
            <IconButton type="button" sx={{ p: "10px" }} aria-label="search">
              <SearchIcon />
            </IconButton>
          </Tooltip>

          <Typography variant="caption">{searchResultNumber}</Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}
