import {
  Autocomplete,
  Button,
  Card,
  CardActions,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";
import router from "next/router";

type BookLabelCardProps = {
  title: string;
  subtitle: string;
  unit: string;
  link: string;
  startLabel?: number;
  setStartLabel?: any;
  totalNumber: number;
  idFilter: number;
  setIdFilter: any;
  topicsFilter: string;
  setTopicsFilter: any;
  allTopics: Array<string>;
};

export default function BookLabelCard({
  title,
  subtitle,
  link,
  startLabel,
  totalNumber,
  setStartLabel,
  idFilter,
  setIdFilter,
  topicsFilter,
  setTopicsFilter,
  allTopics,
}: BookLabelCardProps) {
  const cardHeight = 210;

  return (
    <Card variant="outlined" sx={{ minWidth: 275, minHeight: cardHeight }}>
      <CardContent>
        <Typography variant="h5" component="div">
          {title}
        </Typography>

        <TextField
          id="outlined-number"
          label="Anzahl Etiketten"
          key="book_report_number_input"
          type="number"
          value={startLabel}
          error={startLabel! > totalNumber}
          helperText={
            startLabel! > totalNumber ? "So viele gibt es nicht?" : ""
          }
          onChange={(e: any) => {
            setStartLabel(parseInt(e.target.value));
          }}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ mt: 5 }}
        />
        <TextField
          id="outlined-number"
          label="Mediennummer"
          key="book_report_id_input"
          type="number"
          value={idFilter}
          onChange={(e: any) => {
            setIdFilter(parseInt(e.target.value));
          }}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ mt: 5 }}
        />

        <Autocomplete
          freeSolo
          id="controlled-demo"
          value={topicsFilter}
          options={allTopics}
          onChange={(event: any, newValue: string | null) => {
            setTopicsFilter(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Schlagwort Filter"
              variant="standard"
            />
          )}
        />

        <Typography variant="body2">{subtitle}</Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          onClick={() =>
            router.push(
              link +
                "/?start=0" +
                "&end=" +
                Math.floor(startLabel!) +
                (idFilter ? "&id=" + idFilter : "") +
                (topicsFilter ? "&topic=" + topicsFilter : "")
            )
          }
        >
          Erzeuge PDF
        </Button>
      </CardActions>
    </Card>
  );
}
