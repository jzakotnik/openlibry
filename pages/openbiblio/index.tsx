import { Button, Container, Grid, TextField, Typography } from "@mui/material";
import React, { ChangeEvent, FormEvent, useState, type JSX } from "react";

interface ActivityLog {
  map(arg0: (a: any, i: number) => JSX.Element): React.ReactNode;
}

interface Props {
  activityLog: ActivityLog;
  handleFileChange: (id: number, event: ChangeEvent<HTMLInputElement>) => void;
  handleMigrateUsers: (event: FormEvent<HTMLFormElement>) => void;
  handleMigrateBooks: (event: FormEvent<HTMLFormElement>) => void;
}

export default function MergeFiles() {
  // State to store the file contents
  const [biblio_copy, setBiblio_copy] = useState(null);
  const [users, setUsers] = useState(null);
  const [biblio, setBiblio] = useState(null);
  const [biblio_hist, setBiblio_hist] = useState(null);
  const [fields, setFields] = useState(null);
  const [merged, setMerged] = useState("");
  const [activityLog, setActivityLog] = useState(["Migration engine ready.."]);

  // Handler for file change events
  const handleFileChange = (
    fileIndex: number,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
          const recordCount = content[2]?.data?.length || 0;

          // Assign content to the right state based on file index
          switch (fileIndex) {
            case 1:
              setBiblio_copy(content);
              setActivityLog((prev) => [
                ...prev,
                `Biblio Copy geladen - ${recordCount} Felder`,
              ]);
              break;
            case 2:
              setUsers(content);
              setActivityLog((prev) => [
                ...prev,
                `Members geladen - ${recordCount} Felder`,
              ]);
              break;
            case 3:
              setBiblio(content);
              setActivityLog((prev) => [
                ...prev,
                `Biblio geladen - ${recordCount} Felder`,
              ]);
              break;
            case 4:
              setBiblio_hist(content);
              setActivityLog((prev) => [
                ...prev,
                `Biblio History geladen - ${recordCount} Felder`,
              ]);
              break;
            case 5:
              setFields(content);
              setActivityLog((prev) => [
                ...prev,
                `Felder geladen - ${recordCount} Felder`,
              ]);
              break;
          }
        } catch (error) {
          console.error("Failed to parse JSON:", error);
          alert("Fehler beim Lesen der JSON-Datei");
        }
      };
      reader.readAsText(file);
    } else {
      alert("Kein JSON File?");
    }
  };

  const handleMigrateUsers = async (event: FormEvent) => {
    event.preventDefault();

    if (!users) {
      alert("Bitte zuerst Members-Datei hochladen");
      return;
    }

    console.log("Users to be imported", users);

    try {
      const response = await fetch("/api/openbiblioimport/migrateUsers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(users),
      });

      const json = await response.json();
      console.log(json);
      setActivityLog((prev) => [...prev, JSON.stringify(json)]);
    } catch (error) {
      console.error("Migration failed:", error);
      setActivityLog((prev) => [...prev, `Fehler: ${error}`]);
    }
  };

  const handleMigrateBooks = async (event: FormEvent) => {
    event.preventDefault();

    if (!biblio_copy || !users || !biblio || !biblio_hist || !fields) {
      alert("Bitte alle Dateien hochladen bevor die Migration gestartet wird");
      return;
    }

    const merged = {
      biblio_copy: biblio_copy,
      users: users,
      biblio: biblio,
      biblio_hist: biblio_hist,
      fields: fields,
    };

    console.log("Merged data to be imported", merged);

    try {
      const response = await fetch("/api/openbiblioimport/migrateBooks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(merged),
      });

      const json = await response.json();
      console.log(json);
      setActivityLog((prev) => [...prev, JSON.stringify(json)]);
    } catch (error) {
      console.error("Migration failed:", error);
      setActivityLog((prev) => [...prev, `Fehler: ${error}`]);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" color={"black"} gutterBottom>
        Biblio Copy
      </Typography>
      <TextField
        type="file"
        onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange(1, e)}
        fullWidth
        InputLabelProps={{
          shrink: true,
        }}
        variant="outlined"
      />
      <Typography variant="h5" color={"black"} gutterBottom>
        Members
      </Typography>
      <TextField
        type="file"
        onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange(2, e)}
        fullWidth
        InputLabelProps={{
          shrink: true,
        }}
        variant="outlined"
      />
      <Typography variant="h5" color={"black"} gutterBottom>
        Biblio
      </Typography>
      <TextField
        type="file"
        onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange(3, e)}
        fullWidth
        InputLabelProps={{
          shrink: true,
        }}
        variant="outlined"
      />
      <Typography variant="h5" color={"black"} gutterBottom>
        Biblio History
      </Typography>
      <TextField
        type="file"
        onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange(4, e)}
        fullWidth
        InputLabelProps={{
          shrink: true,
        }}
        variant="outlined"
      />
      <Typography variant="h5" color={"black"} gutterBottom>
        Fields
      </Typography>
      <TextField
        type="file"
        onChange={(e: ChangeEvent<HTMLInputElement>) => handleFileChange(5, e)}
        fullWidth
        InputLabelProps={{
          shrink: true,
        }}
        variant="outlined"
      />
      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        <Grid size={{ xs: 12 }}>
          <Button
            onClick={handleMigrateUsers}
            fullWidth
            variant="contained"
            color="primary"
          >
            User importieren
          </Button>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Button
            onClick={handleMigrateBooks}
            fullWidth
            variant="contained"
            color="primary"
          >
            Bücher importieren
          </Button>
        </Grid>
      </Grid>
      <Grid>
        {[...activityLog].reverse().map((a: string, i: number) => (
          <div key={i}>
            <Typography color={"black"}>{a.substring(0, 200)}</Typography>
          </div>
        ))}
      </Grid>
    </Container>
  );
}
