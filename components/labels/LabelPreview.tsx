/**
 * LabelPreview Component
 * Visual preview of configured label with sample data
 */

import {
  getFieldValue,
  SAMPLE_BOOKS,
  type SampleBookData,
} from "@/lib/utils/labelConfigUtils";
import type { LabelConfig, LabelTemplate } from "@/types/LabelTypes";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Typography,
} from "@mui/material";
import React from "react";

interface LabelPreviewProps {
  config: LabelConfig;
  template: LabelTemplate;
}

export const LabelPreview: React.FC<LabelPreviewProps> = ({
  config,
  template,
}) => {
  const [selectedBook, setSelectedBook] = React.useState<SampleBookData>(
    SAMPLE_BOOKS[0]
  );
  const [scale, setScale] = React.useState<number>(2);

  const labelWidthPx = template.label.width * scale;
  const labelHeightPx = template.label.height * scale;

  const renderZoneContent = (
    field: string | null,
    fontSize: number = 10,
    alignment: string = "left",
    maxLength?: number,
    orientation: "horizontal" | "vertical" = "horizontal"
  ) => {
    if (!field) return null;

    let value = getFieldValue(selectedBook, field as any);

    // Truncate if maxLength specified
    if (maxLength && value.length > maxLength) {
      value = value.substring(0, maxLength) + "...";
    }

    // Special rendering for barcode
    if (field === "barcode") {
      return (
        <Box sx={{ textAlign: "center", py: 0.5 }}>
          <svg width="100%" height="40" style={{ maxWidth: "80%" }}>
            {/* Simple barcode representation */}
            {Array.from({ length: 20 }, (_, i) => (
              <rect
                key={i}
                x={`${i * 5}%`}
                y="0"
                width={i % 3 === 0 ? "3%" : "2%"}
                height="30"
                fill="black"
              />
            ))}
          </svg>
          <Typography
            variant="caption"
            sx={{ fontSize: fontSize * scale * 0.6 }}
          >
            {value}
          </Typography>
        </Box>
      );
    }

    const textAlign =
      alignment === "center"
        ? "center"
        : alignment === "right"
        ? "right"
        : "left";

    if (orientation === "vertical") {
      // Vertical text (rotated)
      return (
        <Box
          sx={{
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            height: "100%",
            display: "flex",
            alignItems:
              alignment === "top"
                ? "flex-start"
                : alignment === "bottom"
                ? "flex-end"
                : "center",
            justifyContent: "center",
            fontSize: fontSize * scale * 0.8,
            fontFamily: "Arial, sans-serif",
            fontWeight: field === "callNumber" ? 600 : 400,
            px: 0.5,
          }}
        >
          {value}
        </Box>
      );
    }

    return (
      <Typography
        sx={{
          fontSize: fontSize * scale * 0.8,
          textAlign,
          fontFamily: "Arial, sans-serif",
          fontWeight: field === "callNumber" ? 600 : 400,
          px: 1,
          py: 0.5,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: field === "barcode" ? "normal" : "nowrap",
        }}
      >
        {value}
      </Typography>
    );
  };

  const renderSection = (
    sectionType: "spine" | "back",
    widthMm: number,
    orientation: "horizontal" | "vertical"
  ) => {
    const section =
      sectionType === "spine" ? config.sections.spine : config.sections.back;
    if (!section) return null;

    const widthPx = widthMm * scale;

    return (
      <Box
        sx={{
          width: widthPx,
          height: labelHeightPx,
          border: "1px solid #ccc",
          backgroundColor: "#fff",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {section.zones.map((zone, index) => {
          const heightPx = (zone.heightPercent / 100) * labelHeightPx;

          return (
            <Box
              key={zone.id}
              sx={{
                height: heightPx,
                borderBottom:
                  index < section.zones.length - 1
                    ? "1px dashed #e0e0e0"
                    : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {renderZoneContent(
                zone.field,
                zone.fontSize,
                zone.alignment,
                zone.maxLength,
                orientation
              )}
            </Box>
          );
        })}

        {/* Section label overlay */}
        <Typography
          variant="caption"
          sx={{
            position: "absolute",
            top: 2,
            left: 2,
            fontSize: 8,
            color: "#999",
            backgroundColor: "rgba(255,255,255,0.8)",
            padding: "1px 3px",
            borderRadius: 0.5,
          }}
        >
          {sectionType === "spine" ? "Rücken" : "Rückseite"}
        </Typography>
      </Box>
    );
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Vorschau
      </Typography>

      {/* Controls */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, flexDirection: "column" }}>
        <FormControl size="small" fullWidth>
          <InputLabel>Testbuch</InputLabel>
          <Select
            value={selectedBook.id}
            label="Testbuch"
            onChange={(e) => {
              const book = SAMPLE_BOOKS.find((b) => b.id === e.target.value);
              if (book) setSelectedBook(book);
            }}
          >
            {SAMPLE_BOOKS.map((book) => (
              <MenuItem key={book.id} value={book.id}>
                {book.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box>
          <Typography variant="body2" gutterBottom>
            Skalierung: {scale}x
          </Typography>
          <Slider
            value={scale}
            min={1}
            max={4}
            step={0.5}
            marks
            onChange={(_, value) => setScale(value as number)}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>
      </Box>

      {/* Label Preview */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          p: 2,
          backgroundColor: "#f5f5f5",
          borderRadius: 1,
          overflow: "auto",
        }}
      >
        <Box sx={{ display: "flex", position: "relative" }}>
          {/* Spine section (if wraparound) */}
          {config.sections.spine &&
            renderSection(
              "spine",
              config.sections.spine.widthMm,
              config.sections.spine.orientation
            )}

          {/* Back section */}
          {config.sections.back &&
            renderSection(
              "back",
              config.sections.back.widthMm,
              config.sections.back.orientation
            )}

          {/* Fold line indicator for wraparound */}
          {config.type === "wraparound" && config.sections.spine && (
            <Box
              sx={{
                position: "absolute",
                left: config.sections.spine.widthMm * scale,
                top: -20,
                height: labelHeightPx + 40,
                width: 2,
                backgroundColor: "rgba(255, 0, 0, 0.3)",
                pointerEvents: "none",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  position: "absolute",
                  top: -20,
                  left: -30,
                  fontSize: 10,
                  color: "red",
                  whiteSpace: "nowrap",
                }}
              >
                ← Faltkante
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Dimensions Info */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 2, textAlign: "center" }}
      >
        Label: {template.label.width}mm × {template.label.height}mm
        {config.type === "wraparound" &&
          config.sections.spine &&
          config.sections.back && (
            <>
              {" "}
              | Rücken: {config.sections.spine.widthMm}mm | Rückseite:{" "}
              {config.sections.back.widthMm}mm
            </>
          )}
      </Typography>
    </Paper>
  );
};
