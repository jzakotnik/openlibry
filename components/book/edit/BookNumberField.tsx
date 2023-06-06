import { Grid, TextField, Typography } from "@mui/material";
import { translations } from "@/entities/fieldTranslations";

import * as React from "react";
import { styled } from "@mui/material/styles";
import Rating, { IconContainerProps } from "@mui/material/Rating";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";

const BookNumberField = (props: any): any => {
  const fieldType = props.fieldType;
  const editable = props.editable;
  const setBookData = props.setBookData;
  const book = props.book;
  return (
    <Grid item xs={12} sm={6}>
      <Typography component="legend">Verlängerungen</Typography>
      <Rating
        name="customized-10"
        value={(book as any)[fieldType]}
        disabled={!editable}
        max={5}
        onChange={(event: any) => {
          setBookData({ ...book, [fieldType]: event.target.value });
        }}
      />
    </Grid>
  );
};

export default BookNumberField;
