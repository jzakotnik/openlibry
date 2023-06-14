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
import Image from "next/image";
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
  returnBook: any;
  hasImage: boolean;
}

export default function BookSummaryCard({
  book,
  returnBook,
  hasImage,
}: BookSummaryCardPropType) {
  const [src, setSrc] = useState("/coverimages/default.png");

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
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title={"Buch id " + selectedBook.id}
      />
      <CardMedia sx={{ position: "relative" }}>
        {hasImage ? (
          <Image
            src={"/coverimages/" + book.id + ".jpg"}
            width={320}
            height={200}
            priority={false}
            alt=""
            style={{ objectFit: "cover" }}
          />
        ) : (
          <Image
            src={"/coverimages/default.png"}
            width={320}
            height={200}
            priority={false}
            alt=""
            style={{ objectFit: "cover" }}
          />
        )}
      </CardMedia>
      <CardContent>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          {selectedBook.title}
        </Typography>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {selectedBook.author}
        </Typography>
      </CardContent>
      <CardActions>
        <Link href={"/book/" + book.id} passHref>
          <Button size="small">Editieren</Button>
        </Link>
        {book.rentalStatus != "available" ? (
          <Button size="small" onClick={returnBook}>
            Abgeben
          </Button>
        ) : null}
      </CardActions>
    </Card>
  );
}
