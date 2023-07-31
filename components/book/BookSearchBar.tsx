import * as React from "react";
import { useState } from "react";

import Button from "@mui/material/Button";
import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import AccountCircle from "@mui/icons-material/AccountCircle";
import UserAdminList from "@/components/user/UserAdminList";
import { Paper, InputBase, Divider, IconButton } from "@mui/material";

import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import DirectionsIcon from "@mui/icons-material/Directions";
import QueueIcon from "@mui/icons-material/Queue";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";

import { BookType } from "@/entities/BookType";

import Grid from "@mui/material/Grid";

interface BookSearchBarPropType {
  handleInputChange: any;
  handleNewBook: any;
  bookSearchInput: any;
  toggleView: any;
  detailView: boolean;
}

export default function BookSearchBar({
  handleInputChange,
  handleNewBook,
  bookSearchInput,
  toggleView,
  detailView,
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
          <IconButton sx={{ p: "10px" }} aria-label="menu" onClick={toggleView}>
            {detailView ? <GridViewIcon /> : <ViewListIcon />}
          </IconButton>
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            value={bookSearchInput}
            onChange={handleInputChange}
            placeholder="Buch suchen.."
            inputProps={{ "aria-label": "search books" }}
          />
          <IconButton type="button" sx={{ p: "10px" }} aria-label="search">
            <SearchIcon />
          </IconButton>
          <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
          <IconButton
            color="primary"
            sx={{ p: "10px" }}
            aria-label="new-book"
            onClick={handleNewBook}
          >
            <QueueIcon />
          </IconButton>
        </Paper>
      </Grid>
    </Grid>
  );
}
