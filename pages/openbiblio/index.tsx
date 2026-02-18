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
  const [biblio_copy, setBiblio_copy] = useState(null);
  const [users, setUsers] = useState(null);
  const [biblio, setBiblio] = useState(null);
  const [biblio_hist, setBiblio_hist] = useState(null);
  const [fields, setFields] = useState(null);
  const [merged, setMerged] = useState("");
  const [activityLog, setActivityLog] = useState(["Migration engine ready.."]);

  const handleFileChange = (
    fileIndex: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
          const recordCount = content[2]?.data?.length || 0;

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
        headers: { "Content-Type": "application/json" },
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
      biblio_copy,
      users,
      biblio,
      biblio_hist,
      fields,
    };

    console.log("Merged data to be imported", merged);

    try {
      const response = await fetch("/api/openbiblioimport/migrateBooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  const fileFields = [
    { index: 1, label: "Biblio Copy" },
    { index: 2, label: "Members" },
    { index: 3, label: "Biblio" },
    { index: 4, label: "Biblio History" },
    { index: 5, label: "Fields" },
  ];

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {fileFields.map(({ index, label }) => (
        <div key={index} className="mb-4">
          <h2 className="text-lg font-semibold text-foreground mb-1">
            {label}
          </h2>
          <input
            type="file"
            accept="application/json"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleFileChange(index, e)
            }
            className="
              w-full text-sm text-foreground
              file:mr-3 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-medium
              file:bg-primary file:text-white
              file:cursor-pointer
              hover:file:bg-primary-dark
              border border-gray-200 rounded-md p-1
            "
          />
        </div>
      ))}

      <div className="flex flex-col gap-3 mt-6">
        <button
          type="button"
          onClick={handleMigrateUsers}
          className="
            w-full py-2.5 px-4 text-sm font-medium text-white
            bg-primary rounded-lg
            hover:bg-primary-dark transition-colors
            cursor-pointer
          "
        >
          User importieren
        </button>
        <button
          type="button"
          onClick={handleMigrateBooks}
          className="
            w-full py-2.5 px-4 text-sm font-medium text-white
            bg-primary rounded-lg
            hover:bg-primary-dark transition-colors
            cursor-pointer
          "
        >
          Bücher importieren
        </button>
      </div>

      <div className="mt-6 space-y-1">
        {[...activityLog].reverse().map((a: string, i: number) => (
          <p key={i} className="text-sm text-foreground truncate">
            {a.substring(0, 200)}
          </p>
        ))}
      </div>
    </div>
  );
}
