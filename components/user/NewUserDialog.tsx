import {
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import * as React from "react";

export interface NewUserDialogProps {
  open: boolean;

  onClose: (idValue: number, idAuto: boolean) => void;
  //onCreate: (autoID: boolean, value: string) => void;
}

export default function NewUserDialog(props: NewUserDialogProps) {
  const { onClose, open } = props;
  const [idValue, setIdValue] = React.useState(500);
  const [idAuto, setIdAuto] = React.useState(true);

  const handleClose = () => {
    onClose(idValue, idAuto);
  };

  const handleCreateClick = (autoID: boolean, customID: string) => {
    // onCreate(autoID, customID);
  };
  const checkBoxLabel = { inputProps: { "aria-label": "Eigene ID verwenden" } };
  return (
    <Dialog open={open} sx={{ m: 2 }}>
      <DialogTitle sx={{ m: 2 }}>Nutzer ID festlegen</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", m: 2 }}>
        <TextField
          id="item-name"
          label="Nutzer ID"
          variant="standard"
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
          variant="text"
          onClick={() => {
            //console.log("Create new user", idAuto, idValue);
            onClose(idValue, idAuto);
          }}
        >
          Neuen User erzeugen
        </Button>
      </DialogActions>
    </Dialog>
  );
}
