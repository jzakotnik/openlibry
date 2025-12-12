import ClearIcon from "@mui/icons-material/Clear";
import { IconButton, InputAdornment, TextField, Tooltip } from "@mui/material";
import { RefObject } from "react";

interface SearchInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onKeyUp?: (e: React.KeyboardEvent) => void;
  onClear?: () => void;
  icon: React.ReactNode;
  accentColor?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  autoFocus?: boolean;
  dataCy?: string;
}

export default function SearchInput({
  placeholder,
  value,
  onChange,
  onKeyUp,
  onClear,
  icon,
  accentColor = "#12556F",
  inputRef,
  autoFocus = false,
  dataCy,
}: SearchInputProps) {
  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    onChange("");
    onClear?.();
  };

  return (
    <TextField
      fullWidth
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyUp={onKeyUp}
      inputRef={inputRef}
      autoFocus={autoFocus}
      data-cy={dataCy}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start" sx={{ color: accentColor }}>
              {icon}
            </InputAdornment>
          ),
          endAdornment: value ? (
            <InputAdornment position="end">
              <Tooltip title="Suche löschen">
                <IconButton edge="end" onMouseDown={handleClear} size="small">
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ) : null,
        },
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "14px",
          background: "rgba(255, 255, 255, 0.8)",
          boxShadow: "inset 0 2px 4px rgba(18, 85, 111, 0.06)",
          transition: "all 0.2s",
          "& fieldset": {
            borderColor: "transparent",
            borderWidth: "2px",
          },
          "&:hover fieldset": {
            borderColor: `${accentColor}40`,
          },
          "&.Mui-focused fieldset": {
            borderColor: accentColor,
            boxShadow: `0 0 0 4px ${accentColor}20`,
          },
        },
        "& .MuiInputBase-input": {
          padding: "14px 14px 14px 0",
          fontSize: "15px",
        },
      }}
    />
  );
}
