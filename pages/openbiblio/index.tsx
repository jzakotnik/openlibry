import { useState } from "react";

export default function MergeFiles() {
  // State to store the file contents
  const [fileContent1, setFileContent1] = useState(null);
  const [fileContent2, setFileContent2] = useState(null);
  const [fileContent3, setFileContent3] = useState(null);
  const [fileContent4, setFileContent4] = useState(null);

  // Handler for file change events
  const handleFileChange = (fileIndex: any, event: any) => {
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = JSON.parse(e.target!.result as any);
        // Assign content to the right state based on file index
        if (fileIndex === 1) setFileContent1(content);
        else if (fileIndex === 2) setFileContent2(content);
        else if (fileIndex === 3) setFileContent3(content);
        else if (fileIndex === 4) setFileContent4(content);
      };
      reader.readAsText(file);
    } else {
      alert("Please upload a JSON file.");
    }
  };

  // Handler for form submission
  const handleSubmit = (event: any) => {
    event.preventDefault();
    console.log("File 1 content:", fileContent1);
    console.log("File 2 content:", fileContent2);
    console.log("File 3 content:", fileContent3);
    console.log("File 4 content:", fileContent4);
    // Here you can do further processing with the uploaded JSON content
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          onChange={(e) => handleFileChange(1, e)}
          accept="application/json"
        />
        <input
          type="file"
          onChange={(e) => handleFileChange(2, e)}
          accept="application/json"
        />
        <input
          type="file"
          onChange={(e) => handleFileChange(3, e)}
          accept="application/json"
        />
        <input
          type="file"
          onChange={(e) => handleFileChange(4, e)}
          accept="application/json"
        />
        <button type="submit">Submit</button>
      </form>
      {fileContent1 && <pre>{JSON.stringify(fileContent1, null, 2)}</pre>}
      {fileContent2 && <pre>{JSON.stringify(fileContent2, null, 2)}</pre>}
      {fileContent3 && <pre>{JSON.stringify(fileContent3, null, 2)}</pre>}
      {fileContent4 && <pre>{JSON.stringify(fileContent4, null, 2)}</pre>}
    </div>
  );
}
