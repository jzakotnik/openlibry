import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
} from "@mui/material";
import React, { useEffect } from "react";

interface RentSearchParamsType {
  overdue: boolean;
  grade: string[];
  setUserSearchInput: any;
}

export default function RentSearchParams({
  overdue,
  grade,
  setUserSearchInput,
}: RentSearchParamsType) {
  console.log("Search params", overdue, grade);
  const [isOverdue, setIsOverdue] = React.useState(overdue);
  const [selectedGrade, setSelectedGrade] = React.useState<string>(grade[0]);
  const [updatedSearchString, setUpdatedSearchString] =
    React.useState<string>("");

  useEffect(() => {
    setUserSearchInput(
      (isOverdue ? "fällig? " : " ") +
        (selectedGrade != "" ? "klasse?" + selectedGrade : " ")
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- useState setter is stable
  }, [isOverdue, selectedGrade]);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsOverdue(event.target.checked);
  };

  const handleDropdownChange = (event: any) => {
    setSelectedGrade(event.target.value as string);
  };

  return (
    <Paper>
      {" "}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          p: 2,
          width: "100%",
        }}
      >
        <FormControlLabel
          control={
            <Checkbox checked={isOverdue} onChange={handleCheckboxChange} />
          }
          label="Überfällig"
        />
        <FormControl sx={{ mt: 2, minWidth: 120 }}>
          <InputLabel id="grade-label">Klasse</InputLabel>
          <Select
            labelId="grade-label"
            id="grade"
            value={selectedGrade}
            onChange={handleDropdownChange}
            label="Klasse"
          >
            {grade.map((g, index) => (
              <MenuItem key={index} value={g}>
                {g}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
}
