import * as React from "react";
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
}

export default function BookSummaryCard({ book }: BookSummaryCardPropType) {
  const selectedBook = book;
  return (
    <Card
      raised
      sx={{
        maxWidth: 280,
        minWidth: 275,
        margin: "0 auto",
        padding: "0.1em",
      }}
    >
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: palette.info.main }} aria-label="avatar">
            B
          </Avatar>
        }
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title={selectedBook.title.substring(0, 20) + "..."}
        subheader={"Nr. " + selectedBook.id}
      />
      <CardMedia
        component="img"
        height="100"
        image={"/coverimages/" + book.id + ".jpg"}
        alt="Buch Cover"
        sx={{ padding: "1em 1em 0 1em", objectFit: "contain" }}
      />
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {"Nr. " +
            selectedBook.id +
            ", " +
            "Klasse " +
            selectedBook.author +
            ", " +
            selectedBook.title}
        </Typography>
        <Typography variant="h5" component="div">
          {selectedBook.title + +", " + selectedBook.subtitle}
        </Typography>
      </CardContent>
      <CardActions>
        <Link href={"/book/" + book.id} passHref>
          <Button size="small">Editieren</Button>
        </Link>
      </CardActions>
    </Card>
  );
}
