/**
 * SectionConfiguration Component
 * Configures all zones in a section (spine or back)
 */

import type { Section, Zone } from "@/entities/LabelTypes";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { Box, Button, Divider, Paper, Typography } from "@mui/material";
import React from "react";
import { ZoneConfiguration } from "./ZoneConfiguration";

interface SectionConfigurationProps {
  section: Section;
  sectionType: "spine" | "back" | "single";
  title: string;
  onChange: (updatedSection: Section) => void;
}

export const SectionConfiguration: React.FC<SectionConfigurationProps> = ({
  section,
  sectionType,
  title,
  onChange,
}) => {
  const handleZoneChange = (index: number, updatedZone: Zone) => {
    const newZones = [...section.zones];
    newZones[index] = updatedZone;
    onChange({ ...section, zones: newZones });
  };

  const handleAddZone = () => {
    const currentTotal = section.zones.reduce(
      (sum, z) => sum + z.heightPercent,
      0
    );
    const remainingPercent = 100 - currentTotal;

    if (remainingPercent < 10) {
      alert(
        "Nicht genug Platz für eine weitere Zone. Reduzieren Sie zunächst die Höhe bestehender Zonen."
      );
      return;
    }

    const newZone: Zone = {
      id: `zone-${section.zones.length + 1}`,
      heightPercent: Math.min(20, remainingPercent),
      field: null,
      fontSize: 10,
      alignment: section.orientation === "horizontal" ? "left" : "top",
    };

    onChange({ ...section, zones: [...section.zones, newZone] });
  };

  const handleRemoveZone = (index: number) => {
    if (section.zones.length <= 1) {
      alert("Mindestens eine Zone muss vorhanden sein.");
      return;
    }

    const newZones = section.zones.filter((_, i) => i !== index);

    // Redistribute percentages
    const totalPercent = newZones.reduce((sum, z) => sum + z.heightPercent, 0);
    const adjustment = (100 - totalPercent) / newZones.length;
    newZones.forEach((z) => {
      z.heightPercent = Math.round(z.heightPercent + adjustment);
    });

    onChange({ ...section, zones: newZones });
  };

  const redistributeZones = () => {
    const equalPercent = Math.floor(100 / section.zones.length);
    const remainder = 100 - equalPercent * section.zones.length;

    const newZones = section.zones.map((zone, index) => ({
      ...zone,
      heightPercent:
        index === section.zones.length - 1
          ? equalPercent + remainder
          : equalPercent,
    }));

    onChange({ ...section, zones: newZones });
  };

  const totalPercent = section.zones.reduce(
    (sum, z) => sum + z.heightPercent,
    0
  );

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">{title}</Typography>
        <Typography
          variant="body2"
          color={totalPercent !== 100 ? "error" : "text.secondary"}
        >
          Gesamt: {totalPercent}%
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Breite: {section.widthMm}mm | Orientierung:{" "}
        {section.orientation === "vertical" ? "Vertikal" : "Horizontal"}
      </Typography>

      <Divider sx={{ mb: 2 }} />

      {/* Zones */}
      {section.zones.map((zone, index) => (
        <Box key={zone.id} sx={{ position: "relative" }}>
          <ZoneConfiguration
            zone={zone}
            sectionType={sectionType}
            orientation={section.orientation}
            onChange={(updated) => handleZoneChange(index, updated)}
          />
          {section.zones.length > 1 && (
            <Button
              size="small"
              color="error"
              startIcon={<RemoveIcon />}
              onClick={() => handleRemoveZone(index)}
              sx={{ position: "absolute", top: 8, right: 8 }}
            >
              Entfernen
            </Button>
          )}
        </Box>
      ))}

      {/* Controls */}
      <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={handleAddZone}
          variant="outlined"
        >
          Zone hinzufügen
        </Button>
        <Button size="small" onClick={redistributeZones} variant="outlined">
          Gleichmäßig verteilen
        </Button>
      </Box>

      {totalPercent !== 100 && (
        <Typography
          variant="caption"
          color="error"
          sx={{ display: "block", mt: 1 }}
        >
          Warnung: Die Zonenhöhen müssen zusammen 100% ergeben.
        </Typography>
      )}
    </Paper>
  );
};
