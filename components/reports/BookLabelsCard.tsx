import {
  Autocomplete,
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";

import router from "next/router";

type BookLabelCardProps = {
  title: string;
  subtitle: string;
  unit: string;
  link: string;
  startLabel: number;
  setStartLabel: any;
  startId: number;
  setStartId: any;
  endId: number;
  setEndId?: any;
  totalNumber: number;
  idFilter: number;
  setIdFilter: any;
  topicsFilter: any;
  setTopicsFilter: any;
  allTopics: any;
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
  startId,
  setStartId,
  endId,
  setEndId,
  topicsFilter,
  setTopicsFilter,
  allTopics,
}: BookLabelCardProps) {
  const cardHeight = 210;

  const getBookUrl = (() => {
    return "/?" + (startLabel > 0 ? ("start=0" +
      "&end=" +
      Math.floor(startLabel!)) : '') +
      (startId > 0 || endId > 0 ? "&startId=" + startId + "&endId=" + endId : '')
      +
      (idFilter ? "&id=" + idFilter : "") +
      (topicsFilter ? "&topic=" + topicsFilter.topic : "")

  });


  return (
    <Card variant="outlined" sx={{ minWidth: 275, minHeight: cardHeight }}>
      <CardContent>
        <Typography variant="h5" component="div">
          {title}
        </Typography>

        <TextField
          id="outlined-number"
          label="Anzahl (neueste) Etiketten"
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
        <Grid
          container
          direction="row"
          alignItems="left"
          justifyContent="left"
          spacing={3}
        >
          <Grid item xs={6} md={6} lg={5} sx={{}}>
            <TextField
              id="idRangeFrom"
              label="Von ID"
              key="idRangeFrom"
              type="number"
              value={startId}
              // error={startLabel! > totalNumber}
              // helperText={
              //   startLabel! > totalNumber ? "So viele gibt es nicht?" : ""
              // }
              onChange={(e: any) => {
                setStartId(parseInt(e.target.value));
              }}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ mt: 5 }}
            />
          </Grid>
          <Grid item xs={6} md={6} lg={5} sx={{}}>
            <TextField
              id="idRangeTo"
              label="Bis ID"
              key="idRangeTo"
              type="number"
              value={endId}
              // error={startLabel! > totalNumber}
              // helperText={
              //   startLabel! > totalNumber ? "So viele gibt es nicht?" : ""
              // }
              onChange={(e: any) => {
                setEndId(parseInt(e.target.value));
              }}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ mt: 5 }}
            />

          </Grid>
        </Grid>

        <TextField
          id="outlined-number"
          label="Etikett für MedienID:"
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
          getOptionLabel={(option: any) => `${option.topic} (${option.count})`} // Display topic and count concatenated
          options={allTopics}
          onChange={(event: any, newValue: string | null) => {
            setTopicsFilter(newValue);
          }}
          value={topicsFilter} // Set the selected value based on the topic
          isOptionEqualToValue={(option, value) => option === value} // Compare by topic
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
          onClick={() => {
            //console.log("Rendering API pdf", topicsFilter);
            window.open(
              link + getBookUrl()
              , "_blank");
          }}
        >
          Erzeuge PDF
        </Button>
        <Button
          size="small"
          onClick={() => {
            //console.log("Rendering API pdf", topicsFilter);
            router.push(
              "reports/print" + getBookUrl()
            );
          }}
        >
          Überspringe Label
        </Button>
      </CardActions>
    </Card>
  );
}
