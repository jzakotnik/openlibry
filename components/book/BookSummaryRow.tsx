import {
  Avatar,
  Chip,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";

import { BookType } from "@/entities/BookType";
import palette from "@/styles/palette";
import CancelPresentationIcon from "@mui/icons-material/CancelPresentation";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

interface BookSummaryRowPropType {
  book: BookType;
  handleCopyBook: React.MouseEventHandler<HTMLButtonElement>;
}

interface BookTopicsPropType {
  topics: string;
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

  const BookTopics = ({ topics }: BookTopicsPropType) => {
    const topicsArray = topics.split(";");
    return (
      <div>
        {topicsArray
          .filter((t) => t.length > 0)
          .map((t) => (
            <Chip key={t} label={t} size="small" sx={{ mx: 0.2 }} />
          ))}{" "}
      </div>
    );
  };
  const bookTopics = "topics" in book && book.topics != null ? book.topics : "";

  return (
    <Paper elevation={2} sx={{ mx: 2, my: 0.2, width: "100%" }}>
      <Grid
        item
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
        key={book.id}
        width={"100%"}
      >
        {" "}
        <Grid item>
          <Avatar>
            <BookAvatarIcon b={book} />
          </Avatar>
        </Grid>
        <Grid item>
          <Tooltip title="Buch kopieren">
            <IconButton
              onClick={handleCopyBook}
              color="primary"
              sx={{ p: "10px" }}
              aria-label="new-copy-book"
            >
              <FileCopyIcon />
            </IconButton>
          </Tooltip>{" "}
        </Grid>
        <Grid item sx={{ mx: 1 }}>
          <Typography>{book.title}</Typography>
        </Grid>
        <Grid item sx={{ mx: 1 }}>
          <Typography variant="caption">{book.author} </Typography>
        </Grid>
        <Grid item sx={{ mx: 1 }}>
          <BookTopics topics={bookTopics} />
        </Grid>
      </Grid>{" "}
    </Paper>
  );
}
