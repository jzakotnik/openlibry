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
import { CARD_HEIGHT, TopicCount } from "./cardConstants";

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
      variant="outlined"
      sx={{ minWidth: 275, minHeight: CARD_HEIGHT }}
      data-cy="user-labels-card"
    >
      <CardContent>
        <Typography variant="h5" component="div" data-cy="user-labels-title">
          {title}
        </Typography>

        <TextField
          id="outlined-number"
          label="Anzahl Etiketten"
          key="book_report_number_input"
          type="number"
          value={startLabel}
          error={startLabel > totalNumber}
          helperText={startLabel > totalNumber ? "So viele gibt es nicht?" : ""}
          onChange={(e: any) => {
            setStartLabel(parseInt(e.target.value));
          }}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ mt: 5 }}
          data-cy="user-labels-count-input"
        />
        <Grid
          container
          direction="row"
          alignItems="left"
          justifyContent="left"
          spacing={3}
        >
          <Grid size={{ xs: 6, md: 6, lg: 5 }}>
            <TextField
              id="idUserRangeFrom"
              label="Von ID"
              key="idUserRangeFrom"
              type="number"
              value={startUserId}
              onChange={(e: any) => {
                setStartUserId(parseInt(e.target.value));
              }}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ mt: 5 }}
              data-cy="user-labels-start-id"
            />
          </Grid>
          <Grid size={{ xs: 6, md: 6, lg: 5 }}>
            <TextField
              id="idUserRangeTo"
              label="Bis ID"
              key="idUserRangeTo"
              type="number"
              value={endUserId}
              onChange={(e: any) => {
                setEndUserId(parseInt(e.target.value));
              }}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ mt: 5 }}
              data-cy="user-labels-end-id"
            />
          </Grid>
        </Grid>
        <TextField
          id="outlined-user-number"
          label="Etikett für UserID:"
          key="user_report_id_input"
          type="number"
          value={idUserFilter}
          onChange={(e: any) => {
            setIdUserFilter(parseInt(e.target.value));
          }}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ mt: 5 }}
          data-cy="user-labels-user-id-filter"
        />

        <Autocomplete
          freeSolo
          id="schoolgrades"
          getOptionLabel={(option: any) => `${option.topic} (${option.count})`}
          options={allTopics}
          onChange={(_event: any, newValue: any) => {
            setTopicsFilter(newValue);
          }}
          value={topicsFilter}
          isOptionEqualToValue={(option, value) => option === value}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Schlagwort Filter"
              variant="standard"
              data-cy="user-labels-schoolgrade-filter"
            />
          )}
        />

        <Typography variant="body2" data-cy="user-labels-subtitle">
          {subtitle}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          onClick={() => window.open(link + getUserUrl(), "_blank")}
          data-cy="user-labels-generate-button"
        >
          Erzeuge PDF
        </Button>
      </CardActions>
    </Card>
  );
}
