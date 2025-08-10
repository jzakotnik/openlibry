import { useState, type JSX } from "react";

import { Button, Container, Grid, TextField, Typography } from "@mui/material";
import React, { ChangeEvent, FormEvent } from "react";

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
  const handleFileChange = (fileIndex: any, event: any) => {
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = JSON.parse(e.target!.result as any);
        // Assign content to the right state based on file index
        if (fileIndex === 1) {
          setBiblio_copy(content);
          setActivityLog([
            ...activityLog,
            "Biblio Copy geladen - " + content[2].data.length + " Felder",
          ]);
        } else if (fileIndex === 2) {
          setUsers(content);
          setActivityLog([
            ...activityLog,
            "Members geladen - " + content[2].data.length + " Felder",
          ]);
        } else if (fileIndex === 3) {
          setBiblio(content);
          setActivityLog([
            ...activityLog,
            "Biblio geladen - " + content[2].data.length + " Felder",
          ]);
        } else if (fileIndex === 4) {
          setBiblio_hist(content);
          setActivityLog([
            ...activityLog,
            "Biblio History geladen - " + content[2].data.length + " Felder",
          ]);
        } else if (fileIndex === 5) {
          setFields(content);
          setActivityLog([
            ...activityLog,
            "Felder geladen - " + content[2].data.length + " Felder",
          ]);
        }
      };
      reader.readAsText(file);
    } else {
      alert("Kein JSON File?");
    }
  };

  const handleMigrateUsers = (event: any) => {
    event.preventDefault();
    /*console.log("File 1 content:", fileContent1);
    console.log("File 2 content:", fileContent2);
    console.log("File 3 content:", fileContent3);
    console.log("File 4 content:", fileContent4);
    */
    // Here you can do further processing with the uploaded JSON content

    /*setActivityLog([...activityLog, "Download gestartet.."]);
    var blob = new Blob([JSON.stringify(merged)], {
      type: "text/plain;charset=utf-8",
    });*/
    //saveAs(blob, "books_all.json");
    //executing API to create users
    console.log("Users to be imported", users);
    fetch(
      process.env.NEXT_PUBLIC_API_URL + "/api/openbiblioimport/migrateUsers",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(users),
      }
    )
      .then(function (res) {
        return res.json();
      })
      .then(function (json) {
        console.log(json);
        setActivityLog([...activityLog, JSON.stringify(json)]);
        //setLoadingImage(Math.floor(Math.random() * 10000));
      });

    console.log("Merged", merged);
  };

  const handleMigrateBooks = (event: any) => {
    event.preventDefault();

    const merged = {
      biblio_copy: biblio_copy,
      users: users,
      biblio: biblio,
      biblio_hist: biblio_hist,
      fields: fields,
    };
    /*setActivityLog([...activityLog, "Download gestartet.."]);
    var blob = new Blob([JSON.stringify(merged)], {
      type: "text/plain;charset=utf-8",
    });*/
    //saveAs(blob, "books_all.json");
    //executing API to create users
    console.log("Users to be imported", merged.users);
    fetch(
      process.env.NEXT_PUBLIC_API_URL + "/api/openbiblioimport/migrateBooks",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(merged),
      }
    )
      .then(function (res) {
        return res.json();
      })
      .then(function (json) {
        console.log(json);
        setActivityLog([...activityLog, JSON.stringify(json)]);
        //setLoadingImage(Math.floor(Math.random() * 10000));
      });

    console.log("Merged", merged);
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
        <Grid item xs={12}>
          <Button
            onClick={handleMigrateUsers}
            fullWidth
            variant="contained"
            color="primary"
          >
            User importieren
          </Button>
        </Grid>
        <Grid item xs={12}>
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
        {activityLog.reverse().map((a: string, i: number) => (
          <div key={i}>
            <Typography color={"black"}>{a.substring(0, 200)}</Typography>
          </div>
        ))}
      </Grid>
    </Container>
  );
}
