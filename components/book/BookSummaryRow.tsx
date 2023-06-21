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
import SearchIcon from "@mui/icons-material/Search";
import ListItemButton from "@mui/material/ListItemButton";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";

import QueueIcon from "@mui/icons-material/Queue";
import Paper from "@mui/material/Paper";
import { IconButton, Avatar } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import { useRouter } from "next/router";

import { BookType } from "@/entities/BookType";

import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import palette from "@/styles/palette";
import { CardHeader, CardMedia } from "@mui/material";
import CancelPresentationIcon from "@mui/icons-material/CancelPresentation";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

interface BookSummaryRowPropType {
  book: BookType;
  handleCopyBook: any;
}

export default function BookSummaryRow({
  book,
  handleCopyBook,
}: BookSummaryRowPropType) {
  const selectedBook = book;
  const router = useRouter();

  const BookAvatarIcon = ({ b }: any) => {
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

  return (
    <ListItem
      key={book.id}
      secondaryAction={
        <IconButton
          onClick={handleCopyBook}
          color="primary"
          sx={{ p: "10px" }}
          aria-label="new-copy-book"
        >
          <QueueIcon />
        </IconButton>
      }
    >
      {" "}
      <ListItemButton>
        <ListItemAvatar>
          <Avatar>
            <BookAvatarIcon b={book} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={book.title} secondary={book.author} />{" "}
      </ListItemButton>
    </ListItem>
  );
}
