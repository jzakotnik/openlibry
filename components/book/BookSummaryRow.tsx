import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import { IconButton, Avatar } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import { BookType } from "@/entities/BookType";

import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import palette from "@/styles/palette";
import { CardHeader, CardMedia } from "@mui/material";
import CancelPresentationIcon from "@mui/icons-material/CancelPresentation";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

interface BookSummaryRowPropType {
  book: BookType;
}

export default function BookSummaryRow({ book }: BookSummaryRowPropType) {
  const selectedBook = book;

  const getAvatarIcon = (b: BookType) => {
    return b.rentalStatus == "rented" ? (
      <Avatar sx={{ bgcolor: palette.error.main }} aria-label="avatar">
        <CancelPresentationIcon />
      </Avatar>
    ) : (
      <Avatar sx={{ bgcolor: palette.info.main }} aria-label="avatar">
        <TaskAltIcon />
      </Avatar>
    );
  };

  return <Paper>{selectedBook.title}</Paper>;
}
