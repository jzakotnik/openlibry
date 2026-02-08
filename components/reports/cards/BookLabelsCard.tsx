import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import router from "next/router";
import {
  cardAccentSx,
  cardActionButtonSx,
  cardBaseSx,
  cardInputSx,
} from "./cardConstants";
import palette from "@/styles/palette";

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
  const getBookUrl = () => {
    return (
      "/?" +
      (startLabel > 0 ? "start=0&end=" + Math.floor(startLabel!) : "") +
      (startId > 0 || endId > 0
        ? "&startId=" + startId + "&endId=" + endId
        : "") +
      (idFilter ? "&id=" + idFilter : "") +
      (topicsFilter ? "&topic=" + topicsFilter.topic : "")
    );
  };

  return (
    <Card
      sx={{ ...cardBaseSx, minHeight: "auto" }}
      data-cy="book-labels-card"
    >
      <Box sx={cardAccentSx(palette.info.main)} />
      <CardContent sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: 600, color: palette.text.secondary, mb: 0.5 }}
          data-cy="book-labels-title"
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: palette.text.disabled, lineHeight: 1.5, mb: 2 }}
        >
          {subtitle}
        </Typography>

        {/* Section: Count filter */}
        <Stack spacing={2}>
          <TextField
            id="book-label-count"
            label="Anzahl (neueste) Etiketten"
            key="book_report_number_input"
            type="number"
            size="small"
            fullWidth
            value={startLabel}
            error={startLabel! > totalNumber}
            helperText={
              startLabel! > totalNumber ? "So viele gibt es nicht?" : ""
            }
            onChange={(e: any) => {
              setStartLabel(parseInt(e.target.value));
            }}
            InputLabelProps={{ shrink: true }}
            sx={cardInputSx}
            data-cy="book-labels-count-input"
          />

          <Divider sx={{ my: 0.5 }} />

          {/* Section: ID Range */}
          <Typography
            variant="caption"
            sx={{
              color: palette.text.disabled,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontSize: "0.6875rem",
            }}
          >
            ID-Bereich
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField
                id="idRangeFrom"
                label="Von ID"
                key="idRangeFrom"
                type="number"
                size="small"
                fullWidth
                value={startId}
                onChange={(e: any) => {
                  setStartId(parseInt(e.target.value));
                }}
                InputLabelProps={{ shrink: true }}
                sx={cardInputSx}
                data-cy="book-labels-start-id"
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                id="idRangeTo"
                label="Bis ID"
                key="idRangeTo"
                type="number"
                size="small"
                fullWidth
                value={endId}
                onChange={(e: any) => {
                  setEndId(parseInt(e.target.value));
                }}
                InputLabelProps={{ shrink: true }}
                sx={cardInputSx}
                data-cy="book-labels-end-id"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 0.5 }} />

          {/* Section: Single ID + Topic filter */}
          <Typography
            variant="caption"
            sx={{
              color: palette.text.disabled,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontSize: "0.6875rem",
            }}
          >
            Filter
          </Typography>
          <TextField
            id="book-label-single-id"
            label="Etikett für MedienID"
            key="book_report_id_input"
            type="number"
            size="small"
            fullWidth
            value={idFilter}
            onChange={(e: any) => {
              setIdFilter(parseInt(e.target.value));
            }}
            InputLabelProps={{ shrink: true }}
            sx={cardInputSx}
            data-cy="book-labels-id-filter"
          />

          <Autocomplete
            freeSolo
            id="controlled-demo"
            getOptionLabel={(option: any) =>
              `${option.topic} (${option.count})`
            }
            options={allTopics}
            onChange={(_event: any, newValue: string | null) => {
              setTopicsFilter(newValue);
            }}
            value={topicsFilter}
            isOptionEqualToValue={(option, value) => option === value}
            size="small"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Schlagwort Filter"
                variant="outlined"
                sx={cardInputSx}
                data-cy="book-labels-topic-filter"
              />
            )}
          />
        </Stack>
      </CardContent>
      <CardActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button
          size="small"
          onClick={() => {
            window.open(link + getBookUrl(), "_blank");
          }}
          sx={cardActionButtonSx}
          data-cy="book-labels-pdf-button"
        >
          Erzeuge PDF
        </Button>
        <Button
          size="small"
          onClick={() => {
            router.push("reports/print" + getBookUrl());
          }}
          sx={{
            ...cardActionButtonSx,
            color: palette.text.disabled,
          }}
          data-cy="book-labels-skip-button"
        >
          Überspringe Label
        </Button>
      </CardActions>
    </Card>
  );
}
