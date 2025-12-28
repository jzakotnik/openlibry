/**
 * LabelPreview Component
 * Visual preview of configured label with sample data
 */

import type { LabelConfig, LabelTemplate } from "@/entities/LabelTypes";
import {
  getFieldValue,
  SAMPLE_BOOKS,
  type SampleBookData,
} from "@/lib/utils/labelConfigUtils";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";

interface LabelPreviewProps {
  config: LabelConfig;
  template: LabelTemplate;
}

export const LabelPreview: React.FC<LabelPreviewProps> = ({
  config,
  template,
}) => {
  const [selectedBook, setSelectedBook] = useState<SampleBookData>(
    SAMPLE_BOOKS[0]
  );
  const [scale, setScale] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate total label dimensions in mm
  const totalLabelWidthMm =
    (config.sections.spine?.widthMm || 0) +
    (config.sections.back?.widthMm || 0);
  const totalLabelHeightMm = template.label.height;

  // Auto-calculate scale to fit container
  useEffect(() => {
    const calculateScale = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth - 64;
      const containerHeight = containerRef.current.clientHeight - 64;

      if (containerWidth <= 0 || containerHeight <= 0) return;

      const scaleX = containerWidth / totalLabelWidthMm;
      const scaleY = containerHeight / totalLabelHeightMm;

      // Use the smaller scale to fit both dimensions
      const fitScale = Math.min(scaleX, scaleY);
      setScale(Math.max(fitScale, 1));
    };

    calculateScale();

    const resizeObserver = new ResizeObserver(calculateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [totalLabelWidthMm, totalLabelHeightMm]);

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
    <Paper
      elevation={2}
      sx={{
        p: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h6" gutterBottom>
        Vorschau
      </Typography>

      {/* Controls */}
      <Box sx={{ mb: 2 }}>
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
      </Box>

      {/* Label Preview */}
      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
          backgroundColor: "#f5f5f5",
          borderRadius: 1,
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        <Box sx={{ display: "flex", position: "relative" }}>
          {config.sections.spine &&
            renderSection(
              "spine",
              config.sections.spine.widthMm,
              config.sections.spine.orientation
            )}

          {config.sections.back &&
            renderSection(
              "back",
              config.sections.back.widthMm,
              config.sections.back.orientation
            )}

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
          )}{" "}
        | Skalierung: {scale.toFixed(1)}x
      </Typography>
    </Paper>
  );
};
