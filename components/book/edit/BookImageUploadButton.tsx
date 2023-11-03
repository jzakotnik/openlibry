import { Button } from "@mui/material";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

const BookImageUploadButton = (props: any): any => {
  const onDrop = useCallback((acceptedFiles: any) => {
    const myFile = acceptedFiles[0];
    console.log("Received the file for book", myFile, props.book.id);
    //const reader = new FileReader();
    const formData = new FormData();
    formData.set("cover", myFile);
    //fetch API to save the file

    fetch(
      process.env.NEXT_PUBLIC_API_URL + "/api/book/cover/" + props.book.id,
      {
        method: "POST",
        headers: {
          "Content-length": myFile.size,
        },
        body: formData, // Here, stringContent or bufferContent would also work
      }
    )
      .then(function (res) {
        return res.json();
      })
      .then(function (json) {
        console.log(json);
      });
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Neues Bild </p>
      ) : (
        <Button type="button">Neues Bild</Button>
      )}
    </div>
  );
};

export default BookImageUploadButton;
