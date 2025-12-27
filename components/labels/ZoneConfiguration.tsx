/**
 * ZoneConfiguration Component
 * Configures a single zone (field, font size, alignment)
 */

import type { Alignment, FieldType, Zone } from "@/types/LabelTypes";
import { FIELD_DEFINITIONS, getFieldDefinition } from "@/types/LabelTypes";
import {
  Box,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";

interface ZoneConfigurationProps {
  zone: Zone;
  sectionType: "spine" | "back" | "single";
  orientation: "vertical" | "horizontal";
  onChange: (updatedZone: Zone) => void;
}

export const ZoneConfiguration: React.FC<ZoneConfigurationProps> = ({
  zone,
  sectionType,
  orientation,
  onChange,
}) => {
  const fieldDef = getFieldDefinition(zone.field || "none");

  // Filter fields recommended for this section
  const availableFields = FIELD_DEFINITIONS.filter((f) =>
    f.recommendedFor.includes(sectionType)
  );

  const handleFieldChange = (newField: FieldType) => {
    const newFieldDef = getFieldDefinition(newField);
    onChange({
      ...zone,
      field: newField === "none" ? null : newField,
      fontSize: newFieldDef.defaultFontSize,
      alignment: newField === "barcode" ? "center" : zone.alignment || "left",
    });
  };

  const handleFontSizeChange = (newSize: number) => {
    onChange({ ...zone, fontSize: newSize });
  };

  const handleAlignmentChange = (newAlignment: Alignment) => {
    onChange({ ...zone, alignment: newAlignment });
  };

  const handleMaxLengthChange = (newMaxLength: number) => {
    onChange({ ...zone, maxLength: newMaxLength || undefined });
  };

  return (
    <Box sx={{ mb: 2, p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}>
      <Typography variant="subtitle2" gutterBottom>
        Zone {zone.id.split("-")[1]} ({zone.heightPercent}% Höhe)
      </Typography>

      {/* Field Selection */}
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>Feld</InputLabel>
        <Select
          value={zone.field || "none"}
          label="Feld"
          onChange={(e) => handleFieldChange(e.target.value as FieldType)}
        >
          {availableFields.map((field) => (
            <MenuItem key={field.id} value={field.id}>
              {field.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {zone.field && zone.field !== "none" && (
        <>
          {/* Font Size */}
          {zone.field !== "barcode" && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Schriftgröße: {zone.fontSize || fieldDef.defaultFontSize}pt
              </Typography>
              <Slider
                value={zone.fontSize || fieldDef.defaultFontSize}
                min={fieldDef.minFontSize}
                max={fieldDef.maxFontSize}
                step={1}
                onChange={(_, value) => handleFontSizeChange(value as number)}
                valueLabelDisplay="auto"
                size="small"
              />
            </Box>
          )}

          {/* Alignment */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Ausrichtung
            </Typography>
            <RadioGroup
              row
              value={zone.alignment || "left"}
              onChange={(e) =>
                handleAlignmentChange(e.target.value as Alignment)
              }
            >
              {orientation === "horizontal" ? (
                <>
                  <FormControlLabel
                    value="left"
                    control={<Radio size="small" />}
                    label="Links"
                  />
                  <FormControlLabel
                    value="center"
                    control={<Radio size="small" />}
                    label="Mitte"
                  />
                  <FormControlLabel
                    value="right"
                    control={<Radio size="small" />}
                    label="Rechts"
                  />
                </>
              ) : (
                <>
                  <FormControlLabel
                    value="top"
                    control={<Radio size="small" />}
                    label="Oben"
                  />
                  <FormControlLabel
                    value="center"
                    control={<Radio size="small" />}
                    label="Mitte"
                  />
                  <FormControlLabel
                    value="bottom"
                    control={<Radio size="small" />}
                    label="Unten"
                  />
                </>
              )}
            </RadioGroup>
          </Box>

          {/* Max Length (for text fields) */}
          {zone.field !== "barcode" &&
            [
              "title",
              "subtitle",
              "author",
              "topics",
              "publisherName",
              "editionDescription",
            ].includes(zone.field) && (
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Max. Zeichen (optional)"
                value={zone.maxLength || ""}
                onChange={(e) =>
                  handleMaxLengthChange(parseInt(e.target.value))
                }
                helperText="Leer lassen für unbegrenzt"
                inputProps={{ min: 5, max: 100 }}
              />
            )}

          {/* Field Description */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1 }}
          >
            {fieldDef.description}
          </Typography>
        </>
      )}
    </Box>
  );
};
