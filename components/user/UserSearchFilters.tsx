import palette from "@/styles/palette";
import { FilterList, RestartAlt, School, Warning } from "@mui/icons-material";
import {
  alpha,
  Box,
  Chip,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  ToggleButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

interface UserSearchFiltersProps {
  grades: string[];
  onFilterChange: (filterString: string) => void;
}

export default function UserSearchFilters({
  grades,
  onFilterChange,
}: UserSearchFiltersProps) {
  const [isOverdue, setIsOverdue] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<string>("");

  // Update parent when filters change
  useEffect(() => {
    const parts: string[] = [];
    if (isOverdue) parts.push("fällig?");
    if (selectedGrade) parts.push(`klasse?${selectedGrade}`);
    onFilterChange(parts.join(" "));
  }, [isOverdue, selectedGrade, onFilterChange]);

  const handleGradeChange = (event: SelectChangeEvent<string>) => {
    setSelectedGrade(event.target.value);
  };

  const handleReset = () => {
    setIsOverdue(false);
    setSelectedGrade("");
  };

  const hasActiveFilters = isOverdue || selectedGrade !== "";

  // Sort grades naturally (1, 2, 3... not 1, 10, 2...)
  const sortedGrades = [...grades].sort((a, b) => {
    const numA = parseInt(a);
    const numB = parseInt(b);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });

  return (
    <Box>
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <FilterList sx={{ fontSize: 18, color: palette.primary.main }} />
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, color: palette.primary.main }}
          >
            Filter
          </Typography>
          {hasActiveFilters && (
            <Chip
              label="Aktiv"
              size="small"
              sx={{
                height: 18,
                fontSize: "0.65rem",
                bgcolor: alpha(palette.primary.main, 0.15),
                color: palette.primary.main,
              }}
            />
          )}
        </Stack>

        {hasActiveFilters && (
          <Tooltip title="Filter zurücksetzen">
            <Chip
              icon={<RestartAlt sx={{ fontSize: 16 }} />}
              label="Zurücksetzen"
              size="small"
              onClick={handleReset}
              sx={{
                height: 24,
                fontSize: "0.7rem",
                cursor: "pointer",
                bgcolor: alpha(palette.text.secondary, 0.08),
                "&:hover": {
                  bgcolor: alpha(palette.text.secondary, 0.15),
                },
              }}
            />
          </Tooltip>
        )}
      </Stack>

      {/* Filter Options */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        {/* Overdue Toggle */}
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mb: 0.75,
              color: palette.text.secondary,
              fontWeight: 500,
            }}
          >
            Status
          </Typography>
          <ToggleButton
            value="overdue"
            selected={isOverdue}
            onChange={() => setIsOverdue(!isOverdue)}
            sx={{
              width: "100%",
              py: 1,
              px: 2,
              borderRadius: 2,
              border: `1px solid ${alpha(palette.primary.main, 0.2)}`,
              textTransform: "none",
              justifyContent: "flex-start",
              gap: 1,
              bgcolor: isOverdue
                ? alpha(palette.warning.main, 0.12)
                : "transparent",
              borderColor: isOverdue
                ? palette.warning.main
                : alpha(palette.primary.main, 0.2),
              color: isOverdue ? palette.warning.main : palette.text.secondary,
              "&:hover": {
                bgcolor: isOverdue
                  ? alpha(palette.warning.main, 0.18)
                  : alpha(palette.primary.main, 0.05),
              },
              "&.Mui-selected": {
                bgcolor: alpha(palette.warning.main, 0.12),
                "&:hover": {
                  bgcolor: alpha(palette.warning.main, 0.18),
                },
              },
            }}
          >
            <Warning sx={{ fontSize: 18 }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Nur überfällige
            </Typography>
          </ToggleButton>
        </Box>

        {/* Grade Dropdown */}
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mb: 0.75,
              color: palette.text.secondary,
              fontWeight: 500,
            }}
          >
            Klasse
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={selectedGrade}
              onChange={handleGradeChange}
              displayEmpty
              startAdornment={
                <School
                  sx={{
                    fontSize: 18,
                    color: selectedGrade
                      ? palette.primary.main
                      : palette.text.disabled,
                    mr: 1,
                  }}
                />
              }
              sx={{
                borderRadius: 2,
                bgcolor: selectedGrade
                  ? alpha(palette.primary.main, 0.06)
                  : "transparent",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: selectedGrade
                    ? palette.primary.main
                    : alpha(palette.primary.main, 0.2),
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: alpha(palette.primary.main, 0.4),
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: palette.primary.main,
                },
              }}
            >
              <MenuItem value="">
                <Typography
                  variant="body2"
                  sx={{ color: palette.text.disabled }}
                >
                  Alle Klassen
                </Typography>
              </MenuItem>
              {sortedGrades.map((grade) => (
                <MenuItem key={grade} value={grade}>
                  <Typography variant="body2">Klasse {grade}</Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Stack>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: "wrap" }}>
          {isOverdue && (
            <Chip
              label="Überfällig"
              size="small"
              onDelete={() => setIsOverdue(false)}
              sx={{
                bgcolor: alpha(palette.warning.main, 0.12),
                color: palette.warning.main,
                "& .MuiChip-deleteIcon": {
                  color: palette.warning.main,
                  "&:hover": {
                    color: palette.warning.main,
                  },
                },
              }}
            />
          )}
          {selectedGrade && (
            <Chip
              label={`Klasse ${selectedGrade}`}
              size="small"
              onDelete={() => setSelectedGrade("")}
              sx={{
                bgcolor: alpha(palette.primary.main, 0.12),
                color: palette.primary.main,
                "& .MuiChip-deleteIcon": {
                  color: palette.primary.main,
                  "&:hover": {
                    color: palette.primary.dark,
                  },
                },
              }}
            />
          )}
        </Stack>
      )}
    </Box>
  );
}
