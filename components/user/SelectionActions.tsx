import { IconButton, Tooltip } from "@mui/material";

type SelectionActionsPropsType = {
  checked: any;
  increaseGrade: any;
  icon: any;
};

export default function SelectionActions({
  checked,
  icon,
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
          {icon}{" "}
        </IconButton>
      </Tooltip>
    );
  } else return <div />;
}
