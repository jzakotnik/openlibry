import { Button } from "@mui/material";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

const BookImageUploadButton = (props: any): any => {
  const onDrop = useCallback((acceptedFiles: any) => {
    const myFile = acceptedFiles[0];
    console.log("Received the file for book", myFile, props.book.id);
    //const reader = new FileReader();
    const { book, setLoadingImage } = props;
    const formData = new FormData();

    formData.set("cover", myFile);
    //fetch API to save the file

    fetch(process.env.NEXT_PUBLIC_API_URL + "/api/book/cover/" + book.id, {
      method: "POST",
      headers: {
        "Content-length": myFile.size,
      },
      body: formData, // Here, stringContent or bufferContent would also work
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (json) {
        console.log(json);
        setLoadingImage(Math.floor(Math.random() * 10000));
      });
  }, []);
  //console.log("Triggered file drop button");
  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    noClick: true,
    noKeyboard: true,
    onDrop,
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Neues Bild </p>
      ) : (
        <Button type="button" onClick={open}>
          Neues Bild
        </Button>
      )}
    </div>
  );
};

export default BookImageUploadButton;
