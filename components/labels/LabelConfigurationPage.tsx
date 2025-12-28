/**
 * LabelConfigurationPage
 * Main page for configuring label layouts
 */

import { LabelPreview } from "@/components/labels/LabelPreview";
import { SectionConfiguration } from "@/components/labels/SectionConfiguration";
import type { LabelConfig, LabelTemplate } from "@/entities/LabelTypes";
import {
  createDefaultConfig,
  generateConfigFileName,
  serializeConfig,
  validateConfig,
} from "@/lib/utils/labelConfigUtils";
import DownloadIcon from "@mui/icons-material/Download";
import SaveIcon from "@mui/icons-material/Save";
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";

export const LabelConfigurationPage: React.FC = () => {
  const [templates, setTemplates] = useState<LabelTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [currentTemplate, setCurrentTemplate] = useState<LabelTemplate | null>(
    null
  );
  const [config, setConfig] = useState<LabelConfig | null>(null);
  const [configName, setConfigName] = useState<string>("Standardkonfiguration");
  const [saveDialogOpen, setSaveDialogOpen] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Load templates from public folder
  useEffect(() => {
    fetch("/labels/label-templates.json")
      .then((res) => res.json())
      .then((data) => setTemplates(data.templates))
      .catch((err) => {
        console.error("Failed to load templates:", err);
        setSnackbar({
          open: true,
          message: "Fehler beim Laden der Vorlagen",
          severity: "error",
        });
      });
  }, []);

  // Load template and create default config
  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find((t) => t.id === selectedTemplateId);
      if (template) {
        setCurrentTemplate(template);
        setConfig(createDefaultConfig(template));
        setConfigName(`${template.name} - Standard`);
      }
    }
  }, [selectedTemplateId]);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };

  const handleSave = () => {
    if (!config) return;

    const validation = validateConfig(config);
    if (!validation.valid) {
      setSnackbar({
        open: true,
        message: `Fehler: ${validation.errors.join(", ")}`,
        severity: "error",
      });
      return;
    }

    setSaveDialogOpen(true);
  };

  const handleConfirmSave = () => {
    if (!config) return;

    // Update config with name and timestamp
    const updatedConfig: LabelConfig = {
      ...config,
      name: configName,
      modified: new Date().toISOString(),
    };

    // Serialize to JSON
    const json = serializeConfig(updatedConfig);
    const filename = generateConfigFileName(config.templateId, configName);

    // Download as file
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setConfig(updatedConfig);
    setSaveDialogOpen(false);
    setSnackbar({
      open: true,
      message: `Konfiguration gespeichert: ${filename}`,
      severity: "success",
    });
  };

  return (
    <Container maxWidth={false} sx={{ py: 4, px: 3 }}>
      {/* Template Selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Etikettenprodukt</InputLabel>
          <Select
            value={selectedTemplateId}
            label="Etikettenprodukt"
            onChange={(e) => handleTemplateChange(e.target.value)}
          >
            {templates.map((template) => (
              <MenuItem key={template.id} value={template.id}>
                {template.name} - {template.label.width}×{template.label.height}
                mm ({Math.floor(
                  template.sheet.rows * template.sheet.columns
                )}{" "}
                pro Blatt)
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {currentTemplate && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {currentTemplate.description}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Blattgröße: {currentTemplate.sheet.width}×
              {currentTemplate.sheet.height}mm (A4) | Labels pro Blatt:{" "}
              {currentTemplate.sheet.rows * currentTemplate.sheet.columns}
            </Typography>
          </Box>
        )}
      </Paper>

      {config && currentTemplate && (
        <>
          <Grid container spacing={3}>
            {/* Left Panel: Configuration */}
            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Spine Section */}
                {config.sections.spine && (
                  <SectionConfiguration
                    section={config.sections.spine}
                    sectionType="spine"
                    title="Rücken (Vertikal)"
                    onChange={(updated) =>
                      setConfig({
                        ...config,
                        sections: { ...config.sections, spine: updated },
                      })
                    }
                  />
                )}

                {/* Back Section */}
                {config.sections.back && (
                  <SectionConfiguration
                    section={config.sections.back}
                    sectionType={
                      config.type === "wraparound" ? "back" : "single"
                    }
                    title={
                      config.type === "wraparound"
                        ? "Rückseite (Horizontal)"
                        : "Label (Horizontal)"
                    }
                    onChange={(updated) =>
                      setConfig({
                        ...config,
                        sections: { ...config.sections, back: updated },
                      })
                    }
                  />
                )}

                {/* Save Button */}
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  fullWidth
                >
                  Konfiguration speichern
                </Button>
              </Box>
            </Grid>

            {/* Right Panel: Preview - fills remaining space */}
            <Grid size={{ xs: 12, md: 8, lg: 9 }}>
              <Box
                sx={{
                  position: "sticky",
                  top: 16,
                  height: "calc(100vh - 80px)",
                  minHeight: 600,
                }}
              >
                <LabelPreview config={config} template={currentTemplate} />
              </Box>
            </Grid>
          </Grid>
        </>
      )}

      {/* Save Dialog */}
      <Dialog
        open={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Konfiguration speichern</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Konfigurationsname"
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            sx={{ mt: 2 }}
            helperText="Dieser Name wird im Dateinamen verwendet"
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Dateiname:{" "}
            {generateConfigFileName(config?.templateId || "", configName)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Abbrechen</Button>
          <Button
            onClick={handleConfirmSave}
            variant="contained"
            startIcon={<DownloadIcon />}
          >
            Herunterladen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};
