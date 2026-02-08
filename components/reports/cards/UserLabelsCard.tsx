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
import {
  cardAccentSx,
  cardActionButtonSx,
  cardBaseSx,
  cardInputSx,
  TopicCount,
} from "./cardConstants";
import palette from "@/styles/palette";

type UserLabelsCardProps = {
  title: string;
  subtitle: string;
  link: string;
  startLabel: number;
  setStartLabel: (value: number) => void;
  totalNumber: number;
  startUserId: number;
  setStartUserId: (value: number) => void;
  endUserId: number;
  setEndUserId: (value: number) => void;
  idUserFilter: number;
  setIdUserFilter: (value: number) => void;
  topicsFilter: TopicCount | null;
  setTopicsFilter: (value: TopicCount | null) => void;
  allTopics: TopicCount[];
};

export default function UserLabelsCard({
  title,
  subtitle,
  link,
  startLabel,
  totalNumber,
  setStartLabel,
  idUserFilter,
  setIdUserFilter,
  startUserId,
  setStartUserId,
  endUserId,
  setEndUserId,
  topicsFilter,
  setTopicsFilter,
  allTopics,
}: UserLabelsCardProps) {
  const getUserUrl = () => {
    return (
      "/?" +
      (startLabel > 0 ? "start=0" + "&end=" + Math.floor(startLabel) : "") +
      (startUserId > 0 || endUserId > 0
        ? "&startId=" + startUserId + "&endId=" + endUserId
        : "") +
      (idUserFilter > 0 ? "&id=" + idUserFilter : "") +
      (topicsFilter ? "&schoolGrade=" + topicsFilter.topic : "")
    );
  };

  return (
    <Card
      sx={{ ...cardBaseSx, minHeight: "auto" }}
      data-cy="user-labels-card"
    >
      <Box sx={cardAccentSx(palette.secondary.main)} />
      <CardContent sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: 600, color: palette.text.secondary, mb: 0.5 }}
          data-cy="user-labels-title"
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: palette.text.disabled, lineHeight: 1.5, mb: 2 }}
        >
          {subtitle}
        </Typography>

        <Stack spacing={2}>
          {/* Section: Count */}
          <TextField
            id="user-label-count"
            label="Anzahl Etiketten"
            key="book_report_number_input"
            type="number"
            size="small"
            fullWidth
            value={startLabel}
            error={startLabel > totalNumber}
            helperText={
              startLabel > totalNumber ? "So viele gibt es nicht?" : ""
            }
            onChange={(e: any) => {
              setStartLabel(parseInt(e.target.value));
            }}
            InputLabelProps={{ shrink: true }}
            sx={cardInputSx}
            data-cy="user-labels-count-input"
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
                id="idUserRangeFrom"
                label="Von ID"
                key="idUserRangeFrom"
                type="number"
                size="small"
                fullWidth
                value={startUserId}
                onChange={(e: any) => {
                  setStartUserId(parseInt(e.target.value));
                }}
                InputLabelProps={{ shrink: true }}
                sx={cardInputSx}
                data-cy="user-labels-start-id"
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                id="idUserRangeTo"
                label="Bis ID"
                key="idUserRangeTo"
                type="number"
                size="small"
                fullWidth
                value={endUserId}
                onChange={(e: any) => {
                  setEndUserId(parseInt(e.target.value));
                }}
                InputLabelProps={{ shrink: true }}
                sx={cardInputSx}
                data-cy="user-labels-end-id"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 0.5 }} />

          {/* Section: Filters */}
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
            id="user-label-single-id"
            label="Etikett für UserID"
            key="user_report_id_input"
            type="number"
            size="small"
            fullWidth
            value={idUserFilter}
            onChange={(e: any) => {
              setIdUserFilter(parseInt(e.target.value));
            }}
            InputLabelProps={{ shrink: true }}
            sx={cardInputSx}
            data-cy="user-labels-user-id-filter"
          />

          <Autocomplete
            freeSolo
            id="schoolgrades"
            getOptionLabel={(option: any) =>
              `${option.topic} (${option.count})`
            }
            options={allTopics}
            onChange={(_event: any, newValue: any) => {
              setTopicsFilter(newValue);
            }}
            value={topicsFilter}
            isOptionEqualToValue={(option, value) => option === value}
            size="small"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Klassen Filter"
                variant="outlined"
                sx={cardInputSx}
                data-cy="user-labels-schoolgrade-filter"
              />
            )}
          />
        </Stack>
      </CardContent>
      <CardActions sx={{ px: 3, pb: 2 }}>
        <Button
          size="small"
          onClick={() => window.open(link + getUserUrl(), "_blank")}
          sx={cardActionButtonSx}
          data-cy="user-labels-generate-button"
        >
          Erzeuge PDF
        </Button>
      </CardActions>
    </Card>
  );
}
