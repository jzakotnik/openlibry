import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

import QueueIcon from "@mui/icons-material/Queue";
import { Avatar, IconButton, Tooltip } from "@mui/material";
import { useRouter } from "next/router";

import { BookType } from "@/entities/BookType";

import palette from "@/styles/palette";
import CancelPresentationIcon from "@mui/icons-material/CancelPresentation";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

interface BookSummaryRowPropType {
  book: BookType;
  handleCopyBook: React.MouseEventHandler<HTMLButtonElement>;
}

interface BookAvatarIconPropType {
  b: BookType;
}

export default function BookSummaryRow({
  book,
  handleCopyBook,
}: BookSummaryRowPropType) {
  const selectedBook = book;
  const router = useRouter();

  const BookAvatarIcon = ({ b }: BookAvatarIconPropType) => {
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
        <Tooltip title="Buch kopieren">
          <IconButton
            onClick={handleCopyBook}
            color="primary"
            sx={{ p: "10px" }}
            aria-label="new-copy-book"
          >
            <QueueIcon />
          </IconButton>
        </Tooltip>
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
