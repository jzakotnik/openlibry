import * as React from "react";

import QueueIcon from "@mui/icons-material/Queue";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { IconButton, Avatar, Typography } from "@mui/material";
import UpdateIcon from "@mui/icons-material/Update";
import TransferWithinAStationIcon from "@mui/icons-material/TransferWithinAStation";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";

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
  width: "100%",
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

  const RenewalCountAvatar = ({ count, status, overdue }: any) => {
    return status == "rented" && overdue ? (
      <Avatar sx={{ bgcolor: palette.error.main }} aria-label="avatar">
        {count}
      </Avatar>
    ) : (
      <Avatar sx={{ bgcolor: palette.info.main }} aria-label="avatar">
        {count}
      </Avatar>
    );
  };

  const DueDateIndicator = ({ book }: any) => {
    return book.rentalStatus != "available"
      ? book.dueDate?.toLocaleString()
      : null;
  };

  const StatusButtons = () => {
    return selectedBook.rentalStatus != "available" ? (
      <Grid
        item
        container
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
        xs={4}
      >
        <Grid item>
          <IconButton size="small" aria-label="weitergeben">
            <TransferWithinAStationIcon />
          </IconButton>{" "}
        </Grid>
        <Grid item>
          <IconButton size="small" aria-label="verlängern">
            <UpdateIcon />
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton size="small" aria-label="zurückgeben">
            <KeyboardReturnIcon />
          </IconButton>
        </Grid>
      </Grid>
    ) : (
      <Grid
        item
        container
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
        xs={4}
      >
        <Grid item>
          <IconButton size="small" aria-label="ausleihen">
            <BookmarkAddIcon />
          </IconButton>{" "}
        </Grid>
      </Grid>
    );
  };

  return (
    <Item sx={{ my: 0.5 }} key={book.id}>
      <Grid
        container
        item
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid
          item
          container
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
          xs={8}
        >
          <Grid item>
            <RenewalCountAvatar
              count={book.renewalCount}
              status={book.rentalStatus}
              overdue={overdueDays > 0}
            />
          </Grid>
          <Grid item>
            <Typography sx={{ mx: 2 }}>
              {book.title} <DueDateIndicator book={book} />
            </Typography>
          </Grid>
        </Grid>
        <StatusButtons />
      </Grid>
    </Item>
  );
}
