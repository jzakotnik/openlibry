/**
 * LabelConfigurationPage
 * Main page for configuring label layouts with server-side file management
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
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SaveIcon from "@mui/icons-material/Save";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";

interface SavedFile {
  filename: string;
  name: string;
  templateId: string;
  type: string;
  modified: string;
  size: number;
  error?: string;
}

export const LabelConfigurationPage: React.FC = () => {
  const [templates, setTemplates] = useState<LabelTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [currentTemplate, setCurrentTemplate] = useState<LabelTemplate | null>(
    null
  );
  const [config, setConfig] = useState<LabelConfig | null>(null);
  const [configName, setConfigName] = useState<string>("Standardkonfiguration");
  const [currentFilename, setCurrentFilename] = useState<string>("");

  // Saved files
  const [savedFiles, setSavedFiles] = useState<SavedFile[]>([]);

  // Dialogs
  const [saveDialogOpen, setSaveDialogOpen] = useState<boolean>(false);
  const [filesDialogOpen, setFilesDialogOpen] = useState<boolean>(false);

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

  // Load saved files on mount
  useEffect(() => {
    loadSavedFiles();
  }, []);

  // Load template and create default config
  useEffect(() => {
    if (selectedTemplateId) {
      // Check if this is a saved file (format: "file:filename.json")
      if (selectedTemplateId.startsWith("file:")) {
        const filename = selectedTemplateId.substring(5); // Remove "file:" prefix
        handleLoadFile(filename);
      } else {
        // It's a template ID - load default config
        const template = templates.find((t) => t.id === selectedTemplateId);
        if (template) {
          setCurrentTemplate(template);
          setConfig(createDefaultConfig(template));
          setConfigName(`${template.name} - Standard`);
          setCurrentFilename("");
        }
      }
    }
  }, [selectedTemplateId]);

  // Load saved files from server
  const loadSavedFiles = async () => {
    try {
      const response = await fetch("/api/label-configs/files");
      if (response.ok) {
        const files = await response.json();
        setSavedFiles(files);
      }
    } catch (error) {
      console.error("Failed to load saved files:", error);
    }
  };

  const handleTemplateChange = (value: string) => {
    setSelectedTemplateId(value);
  };

  // Reset to default configuration
  const handleResetConfig = () => {
    if (currentTemplate) {
      setConfig(createDefaultConfig(currentTemplate));
      setConfigName(`${currentTemplate.name} - Standard`);
      setCurrentFilename("");
      setSnackbar({
        open: true,
        message: "Konfiguration zurückgesetzt",
        severity: "success",
      });
    }
  };

  // Load file from server
  const handleLoadFile = async (filename: string) => {
    try {
      const response = await fetch(`/api/label-configs/files/${filename}`);
      if (response.ok) {
        const data = await response.json();

        // Find the template for this config
        const template = templates.find((t) => t.id === data.config.templateId);
        if (!template) {
          setSnackbar({
            open: true,
            message: "Vorlage für diese Konfiguration nicht gefunden",
            severity: "error",
          });
          return;
        }

        // Set everything together to avoid triggering multiple useEffects
        setCurrentTemplate(template);
        setConfig(data.config);
        setConfigName(data.config.name);
        setCurrentFilename(filename);

        setSnackbar({
          open: true,
          message: `Geladen: ${filename}`,
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Load error:", error);
      setSnackbar({
        open: true,
        message: "Fehler beim Laden",
        severity: "error",
      });
    }
  };

  // Delete file from server
  const handleDeleteFile = async (filename: string) => {
    if (!confirm(`Datei "${filename}" wirklich löschen?`)) return;

    try {
      const response = await fetch(`/api/label-configs/files/${filename}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Datei gelöscht",
          severity: "success",
        });

        // Reload file list
        loadSavedFiles();

        // Clear if current file was deleted
        if (currentFilename === filename) {
          setCurrentFilename("");
          if (currentTemplate) {
            setConfig(createDefaultConfig(currentTemplate));
          }
        }
      }
    } catch (error) {
      console.error("Delete error:", error);
      setSnackbar({
        open: true,
        message: "Fehler beim Löschen",
        severity: "error",
      });
    }
  };

  // Save to server folder
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

  // Confirm save to server
  const handleConfirmSave = async () => {
    if (!config) return;

    try {
      // Update config with current name
      const updatedConfig = {
        ...config,
        name: configName,
        modified: new Date().toISOString(),
      };

      // Generate filename if new, or use existing
      let filename = currentFilename;
      if (!filename) {
        filename = generateConfigFileName(config.templateId, configName);
      }

      const response = await fetch("/api/label-configs/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename,
          config: updatedConfig,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentFilename(data.filename);
        setSaveDialogOpen(false);
        setSnackbar({
          open: true,
          message: `Gespeichert: ${data.filename}`,
          severity: "success",
        });

        // Reload file list
        loadSavedFiles();
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      console.error("Save error:", error);
      setSnackbar({
        open: true,
        message: "Fehler beim Speichern",
        severity: "error",
      });
    }
  };

  // Export current config as download
  const handleExportAsDownload = () => {
    if (!config) return;

    const json = serializeConfig(config);
    const filename = generateConfigFileName(config.templateId, configName);

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSnackbar({
      open: true,
      message: `Exportiert: ${filename}`,
      severity: "success",
    });
  };

  return (
    <Container maxWidth={false} sx={{ py: 4, px: 3 }}>
      {/* Template Selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Etikettenprodukt / Gespeicherte Konfiguration</InputLabel>
          <Select
            value={selectedTemplateId}
            label="Etikettenprodukt / Gespeicherte Konfiguration"
            onChange={(e) => handleTemplateChange(e.target.value)}
          >
            {templates.flatMap((template) => {
              // Find saved configs for this template
              const configsForTemplate = savedFiles.filter(
                (f) => f.templateId === template.id
              );

              // Return array of MenuItems instead of Fragment
              return [
                // Default template option
                <MenuItem key={template.id} value={template.id}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1">
                        <strong>{template.name}</strong> -{" "}
                        {template.label.width}×{template.label.height}mm
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Standard-Konfiguration (
                        {Math.floor(
                          template.sheet.rows * template.sheet.columns
                        )}{" "}
                        pro Blatt)
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>,

                // Saved configurations for this template
                ...configsForTemplate.map((file) => (
                  <MenuItem
                    key={file.filename}
                    value={`file:${file.filename}`}
                    sx={{ pl: 4 }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2">↳ {file.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Gespeichert:{" "}
                          {new Date(file.modified).toLocaleDateString("de-DE")}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                )),
              ];
            })}
          </Select>
        </FormControl>

        {/* Manage files button - icon only, below dropdown */}
        {savedFiles.length > 0 && (
          <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
            <IconButton
              size="small"
              onClick={() => setFilesDialogOpen(true)}
              title="Konfigurationen verwalten"
            >
              <FolderOpenIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

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
                {/* Current file indicator */}
                {currentFilename && (
                  <Alert severity="info" sx={{ mb: 1 }}>
                    Bearbeite: {currentFilename}
                  </Alert>
                )}

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

                {/* Action Buttons */}
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  fullWidth
                >
                  {currentFilename
                    ? "Konfiguration aktualisieren"
                    : "Als neue Datei speichern"}
                </Button>

                <Button
                  variant="outlined"
                  size="medium"
                  startIcon={<RestartAltIcon />}
                  onClick={handleResetConfig}
                  fullWidth
                >
                  Zurücksetzen
                </Button>

                <Button
                  variant="outlined"
                  size="medium"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportAsDownload}
                  fullWidth
                >
                  Als Download exportieren
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
        <DialogTitle>
          {currentFilename
            ? "Konfiguration aktualisieren"
            : "Neue Konfiguration speichern"}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Konfigurationsname"
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            sx={{ mt: 2 }}
            helperText={
              currentFilename
                ? `Datei: ${currentFilename}`
                : "Dateiname wird automatisch generiert"
            }
          />
          {!currentFilename && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Wird gespeichert als:{" "}
              {generateConfigFileName(config?.templateId || "", configName)}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Abbrechen</Button>
          <Button
            onClick={handleConfirmSave}
            variant="contained"
            startIcon={<SaveIcon />}
          >
            {currentFilename ? "Aktualisieren" : "Speichern"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* All Files Dialog */}
      <Dialog
        open={filesDialogOpen}
        onClose={() => setFilesDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Gespeicherte Konfigurationen verwalten</DialogTitle>
        <DialogContent>
          {savedFiles.length === 0 ? (
            <Alert severity="info">Keine Konfigurationen gespeichert.</Alert>
          ) : (
            <Box>
              {templates.map((template) => {
                const filesForTemplate = savedFiles.filter(
                  (f) => f.templateId === template.id
                );
                if (filesForTemplate.length === 0) return null;

                return (
                  <Box key={template.id} sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      {template.name}
                    </Typography>
                    {filesForTemplate.map((file, index) => (
                      <Box key={file.filename}>
                        {index > 0 && <Divider sx={{ my: 1 }} />}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            py: 1,
                          }}
                        >
                          <Box>
                            <Typography variant="body1">
                              {file.name}
                              {file.filename === currentFilename && (
                                <Chip
                                  label="Aktuell"
                                  size="small"
                                  color="primary"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {file.filename} •{" "}
                              {new Date(file.modified).toLocaleString("de-DE")}
                            </Typography>
                          </Box>
                          <Box>
                            <Button
                              size="small"
                              onClick={() => {
                                setSelectedTemplateId(`file:${file.filename}`);
                                setFilesDialogOpen(false);
                              }}
                            >
                              Laden
                            </Button>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteFile(file.filename)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                );
              })}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilesDialogOpen(false)}>Schließen</Button>
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
