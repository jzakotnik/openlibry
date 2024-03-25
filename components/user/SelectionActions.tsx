import PlusOneIcon from "@mui/icons-material/PlusOne";
import { IconButton, Tooltip } from "@mui/material";

type SelectionActionsPropsType = {
  checked: any;
  increaseGrade: any;
};

export default function SelectionActions({
  checked,
  increaseGrade,
}: SelectionActionsPropsType) {
  const checkedItems = Object.values(checked).filter((item) => item != false);
  if (checkedItems.length > 0) {
    //console.log("Checked Items", checkedItems);
    return (
      <Tooltip title="Klasse erhöhen">
        <IconButton
          type="button"
          sx={{ p: "10px" }}
          aria-label="klasse erhöhen"
          onClick={increaseGrade}
        >
          <PlusOneIcon />
        </IconButton>
      </Tooltip>
    );
  } else return <div />;
}
