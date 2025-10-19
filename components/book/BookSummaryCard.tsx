import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Avatar, IconButton, Tooltip } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { BookType } from "@/entities/BookType";

import palette from "@/styles/palette";
import CancelPresentationIcon from "@mui/icons-material/CancelPresentation";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { CardHeader, CardMedia } from "@mui/material";

const bull = (
  <Box
    component="span"
    sx={{ display: "inline-block", mx: "2px", transform: "scale(0.8)" }}
  >
    •
  </Box>
);

interface BookSummaryCardPropType {
  book: BookType;
  returnBook: React.MouseEventHandler<HTMLButtonElement>;
  showDetailsControl?: boolean;
}

export default function BookSummaryCard({
  book,
  returnBook,
  showDetailsControl = true,
}: BookSummaryCardPropType) {
  const [src, setSrc] = useState("/coverimages/default.jpg");

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

  return (
    <Card
      raised
      key={book.id}
      sx={{
        maxWidth: 280,
        minWidth: 275,
        margin: "0 auto",
        padding: "0.1em",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
      }}
    >
      <CardHeader
        avatar={getAvatarIcon(selectedBook)}
        action={
          <Link href={"/book/" + book.id} passHref>
            <Tooltip title="Details für das Buch">
              <IconButton aria-label="settings">
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
          </Link>
        }
        title={"Buch id " + selectedBook.id}
      />
      <CardMedia sx={{ position: "relative", width: 320, height: 200 }}>
        <Link
          href={`/book/${book.id}`}
          aria-label={`Open ${book.title ?? "book"}`}
        >
          <Image
            src={`/api/images/${book.id}`} // or `${process.env.NEXT_PUBLIC_API_URL}/api/images/${book.id}`
            alt={book.title ?? "Book cover"}
            fill
            sizes="(max-width: 600px) 100vw, 320px"
            style={{ objectFit: "cover" }}
            // priority // <- uncomment if above the fold
          />
        </Link>
      </CardMedia>
      <CardContent>
        <Typography
          variant="h5"
          color="text.secondary"
          data-cy="book_title"
          gutterBottom
        >
          {selectedBook.title}
        </Typography>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {selectedBook.author}
        </Typography>
      </CardContent>
      {showDetailsControl ? (
        <CardActions>
          <Link href={"/book/" + book.id} passHref>
            <Tooltip title="Details für das Buch">
              <Button size="small" data-cy="book_card_editbutton">
                Details
              </Button>
            </Tooltip>
          </Link>
          <Link href={"/reports/print?id=" + book.id} passHref>
            <Tooltip title="Buchlabel drucken">
              <Button size="small" data-cy="book_card_editbutton">
                Drucken
              </Button>
            </Tooltip>
          </Link>
          {book.rentalStatus != "available" ? (
            <Button size="small" onClick={returnBook}>
              Abgeben
            </Button>
          ) : null}
        </CardActions>
      ) : null}
    </Card>
  );
}
