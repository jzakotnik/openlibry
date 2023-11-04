import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Avatar, IconButton } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
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
  returnBook: any;
}

export default function BookSummaryCard({
  book,
  returnBook,
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
        <img
          src={process.env.NEXT_PUBLIC_API_URL + "/api/images/" + book.id}
          width={320}
          height={200}
          alt=""
          style={{ objectFit: "cover" }}
        />
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
