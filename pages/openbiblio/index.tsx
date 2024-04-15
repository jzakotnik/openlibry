import { saveAs } from "file-saver";
import { useState } from "react";

export default function MergeFiles() {
  // State to store the file contents
  const [biblio_copy, setBiblio_copy] = useState(null);
  const [users, setUsers] = useState(null);
  const [biblio, setBiblio] = useState(null);
  const [biblio_hist, setBiblio_hist] = useState(null);
  const [fields, setFields] = useState(null);
  const [merged, setMerged] = useState("");
  const [activityLog, setActivityLog] = useState(["Merge ready to go.."]);

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

  // Handler for form submission
  const handleSubmit = (event: any) => {
    event.preventDefault();
    /*console.log("File 1 content:", fileContent1);
    console.log("File 2 content:", fileContent2);
    console.log("File 3 content:", fileContent3);
    console.log("File 4 content:", fileContent4);
    */
    // Here you can do further processing with the uploaded JSON content
    const merged = {
      biblio_copy: biblio_copy,
      users: users,
      biblio: biblio,
      biblio_hist: biblio_hist,
      fields: fields,
    };
    setActivityLog([...activityLog, "Download gestartet.."]);
    var blob = new Blob([JSON.stringify(merged)], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(blob, "books_all.json");

    console.log("Merged", merged);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        Biblio Copy<br></br>
        <input
          type="file"
          onChange={(e) => handleFileChange(1, e)}
          accept="application/json"
        />
        <br />
        Members<br></br>
        <input
          type="file"
          onChange={(e) => handleFileChange(2, e)}
          accept="application/json"
        />
        <br />
        Biblio<br></br>
        <input
          type="file"
          onChange={(e) => handleFileChange(3, e)}
          accept="application/json"
        />
        <br />
        Biblio History<br></br>
        <input
          type="file"
          onChange={(e) => handleFileChange(4, e)}
          accept="application/json"
        />
        <br />
        Fields<br></br>
        <input
          type="file"
          onChange={(e) => handleFileChange(5, e)}
          accept="application/json"
        />
        <br />
        <button type="submit">Merge starten..</button>
      </form>
      {activityLog.map((a: any, i: number) => {
        return (
          <div key={i}>
            <pre>{a}</pre>
          </div>
        );
      })}
    </div>
  );
}
