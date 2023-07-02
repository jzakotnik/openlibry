import * as React from "react";
import { useState } from "react";

import QueueIcon from "@mui/icons-material/Queue";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { IconButton, Avatar, Typography } from "@mui/material";

import { BookType } from "@/entities/BookType";

import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import palette from "@/styles/palette";
import { CardHeader, CardMedia } from "@mui/material";
import CancelPresentationIcon from "@mui/icons-material/CancelPresentation";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { styled } from "@mui/material/styles";
import { calculateOverdue } from "@/utils/calculateOverdue";

interface BookSummaryRowPropType {
  book: BookType;
}

interface RenewalCountAvatarPropType {
  count: number;
  status: string;
}

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export default function BookRentalRow({ book }: BookSummaryRowPropType) {
  const selectedBook = book;
  const overdueDays =
    book.rentalStatus != "available" //available books cannot be overdue
      ? calculateOverdue(book.dueDate as Date)
      : 0;
  console.log("Overdue book", book.id, overdueDays);

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

  const RenewalCountAvatar = ({ count, status }: any) => {
    return status == "rented" ? (
      <Avatar sx={{ bgcolor: palette.error.main }} aria-label="avatar">
        {count}
      </Avatar>
    ) : (
      <Avatar sx={{ bgcolor: palette.info.main }} aria-label="avatar">
        {count}
      </Avatar>
    );
  };

  return (
    <Item sx={{ my: 0.5 }} key={book.id}>
      <Grid
        container
        direction="row"
        justifyContent="left"
        alignItems="center"
        sx={{ mx: 1 }}
      >
        <Grid item>
          <RenewalCountAvatar
            count={book.renewalCount}
            status={book.rentalStatus}
          />
        </Grid>
        <Grid item>
          <Typography sx={{ mx: 2 }}>
            {book.title},{book.rentalStatus}, {book.dueDate?.toLocaleString()}
          </Typography>
        </Grid>
        <Grid item>
          <Button>Zurückgeben</Button>
        </Grid>
        <Grid item>
          <Button>Verlängern</Button>
        </Grid>
        <Grid item>
          <Button>Weitergeben</Button>
        </Grid>
      </Grid>
    </Item>
  );
}
