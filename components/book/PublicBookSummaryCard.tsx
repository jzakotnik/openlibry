import { BookType } from "@/entities/BookType";
import { translations } from "@/entities/fieldTranslations";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Avatar, Collapse, IconButton } from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { useState } from "react";

import palette from "@/styles/palette";
import { CardMedia } from "@mui/material";
import Image from "next/image";

import CancelPresentationIcon from "@mui/icons-material/CancelPresentation";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { CardActions, CardHeader } from "@mui/material";
import { styled } from "@mui/material/styles";

const bull = (
  <Box
    component="span"
    sx={{ display: "inline-block", mx: "2px", transform: "scale(0.8)" }}
  >
    •
  </Box>
);
const ExpandMore = styled((props: any) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: expand ? "rotate(180deg)" : "rotate(0deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

interface PublicBookSummaryCardPropType {
  book: BookType;
}

export default function PublicBookSummaryCard({
  book,
}: PublicBookSummaryCardPropType) {
  const [src, setSrc] = useState("/coverimages/default.jpg");
  const [expanded, setExpanded] = useState(false);
  const handleExpandClick = () => setExpanded(!expanded);

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
      <CardMedia sx={{ position: "relative", width: 320, height: 200 }}>
        <Image
          src={`${process.env.NEXT_PUBLIC_API_URL}/api/images/${book.id}`}
          alt={book?.title ?? "Book cover"}
          width={320}
          height={200}
          style={{ objectFit: "cover" }}
        />
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
      <CardActions disableSpacing>
        <ExpandMore
          expand={expanded ? 1 : 0}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          {" "}
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>{" "}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          {book.rentalStatus && (
            <Typography paragraph>
              <strong>Ausleihstatus:</strong>{" "}
              {(translations as any)["rentalStatus"][book.rentalStatus]}
            </Typography>
          )}
          {book.author && (
            <Typography paragraph>
              <strong>Autor:</strong> {book.author}
            </Typography>
          )}
          {book.subtitle && (
            <Typography paragraph>
              <strong>Untertitel:</strong> {book.subtitle}
            </Typography>
          )}
          {book.publisherDate && (
            <Typography paragraph>
              <strong>Publikationsdatum:</strong> {book.publisherDate}
            </Typography>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
}
