import { IconButton, Tooltip } from "@mui/material";

type SelectionActionsPropsType = {
  checked: any;
  action: any;
  actionTitle: string;
  icon: any;
};

export default function SelectionActions({
  checked,
  icon,
  action,
  actionTitle,
}: SelectionActionsPropsType) {
  const checkedItems = Object.values(checked).filter((item) => item != false);
  if (checkedItems.length > 0) {
    //console.log("Checked Items", checkedItems);
    return (
      <Tooltip title={actionTitle}>
        <IconButton
          type="button"
          sx={{ p: "10px" }}
          aria-label={actionTitle}
          onClick={action}
        >
          {icon}{" "}
        </IconButton>
      </Tooltip>
    );
  } else return <div />;
}
