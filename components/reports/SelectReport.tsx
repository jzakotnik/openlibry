import * as React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

interface SelectReportType {
  reportType: string;
  handleReportType: any;
}

export default function SelectReport({
  reportType,
  handleReportType,
}: SelectReportType) {
  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="report-select-label">Art</InputLabel>
        <Select
          labelId="report-select-label"
          id="report-select-label"
          value={reportType}
          label="Report"
          onChange={handleReportType}
        >
          <MenuItem value="user">Nutzerinnen</MenuItem>
          <MenuItem value="books">Bücher</MenuItem>
          <MenuItem value="rentals">Leihstatus</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
