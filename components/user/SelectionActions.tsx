type SelectionActionsPropsType = {
  checked: any;
};

export default function SelectionActions({
  checked,
}: SelectionActionsPropsType) {
  if (!Object.values(checked).every((item) => item === false)) {
    return "Klasse erhöhen";
  }
}
