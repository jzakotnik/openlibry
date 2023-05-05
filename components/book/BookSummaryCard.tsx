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
import { BookType } from "@/entities/BookType";

import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import palette from "@/styles/palette";

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
  rentals: Array<any>;
}

export default function BookSummaryCard({
  book,
  rentals,
}: BookSummaryCardPropType) {
  const selectedBook = book;
  return (
    <Card sx={{ minWidth: 275 }}>
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

        <Typography>Ausgeliehen an</Typography>
        {rentals.length == 0 ? (
          <Typography color={palette.success.main}>Keine</Typography>
        ) : (
          <Typography>Ausgeliehen an </Typography>
        )}
      </CardContent>
      <CardActions>
        <Link href={"/book/" + book.id} passHref>
          <Button size="small">Editieren</Button>
        </Link>
      </CardActions>
    </Card>
  );
}
