import AddCircleIcon from "@mui/icons-material/AddCircle";
import {
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  FormControlLabel,
  TextField,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import * as React from "react";

export interface NewUserDialogProps {
  open: boolean;
  setOpen: any;
  maxUserID: number;
  onCreate: (idValue: number, idAuto: boolean) => void;
  //onCreate: (autoID: boolean, value: string) => void;
}

export default function NewUserDialog(props: NewUserDialogProps) {
  const { onCreate, open, maxUserID, setOpen } = props;
  const [idValue, setIdValue] = React.useState(maxUserID);
  const [idAuto, setIdAuto] = React.useState(true);

  const checkBoxLabel = { inputProps: { "aria-label": "Eigene ID verwenden" } };
  return (
    <Dialog
      onClose={() => setOpen(false)}
      open={open}
      sx={{ m: 2 }}
      fullWidth
      maxWidth="sm"
    >
      <DialogContent sx={{ display: "flex", flexDirection: "column", m: 2 }}>
        <TextField
          id="item-name"
          label="Nutzer ID"
          variant="standard"
          disabled={idAuto}
          value={idValue}
          onChange={(e) => {
            setIdValue(parseInt(e.target.value) ? parseInt(e.target.value) : 0);
          }}
        />
        <FormControlLabel
          control={
            <Checkbox
              id="item-description"
              inputProps={{ "aria-label": "controlled" }}
              checked={idAuto}
              onChange={(e) => {
                setIdAuto(e.target.checked);
              }}
            />
          }
          label="Automatische ID"
        />
      </DialogContent>
      <DialogActions>
        <Button
          startIcon={<AddCircleIcon />}
          variant="text"
          onClick={() => {
            //console.log("Create new user", idAuto, idValue);
            onCreate(idValue, idAuto);
          }}
        >
          Neuen User erzeugen
        </Button>
      </DialogActions>
    </Dialog>
  );
}
