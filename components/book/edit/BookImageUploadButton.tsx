import { PhotoCamera } from "@mui/icons-material";
import { IconButton, Stack } from "@mui/material";
import Resizer from "react-image-file-resizer";

const BookImageUploadButton = (props: any): any => {
  const resizeFile = (file: any) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        600,
        300,
        "JPEG",
        90,
        0,
        (uri) => {
          resolve(uri);
        },
        "blob",
        200,
        200
      );
    });
  const handleChange = (event: any) => {
    //console.log("Received the file for book", event, props.book.id);

    //const reader = new FileReader();
    const { book, setLoadingImage } = props;
    const formData = new FormData();
    const file = event.target.files[0];

    //resize image to thumbnail size to save space
    const result = resizeFile(event.target.files[0]).then((img: any) => {
      //console.log("Resized image", img);
      formData.set("cover", img);
      //fetch API to save the newFile

      fetch(process.env.NEXT_PUBLIC_API_URL + "/api/book/cover/" + book.id, {
        method: "POST",
        headers: {
          "Content-length": file.size,
        },
        body: formData, // Here, stringContent or bufferContent would also work
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (json) {
          //console.log(json);
          setLoadingImage(Math.floor(Math.random() * 10000));
        });
    });

    //resize image file
  };

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <IconButton
        color="primary"
        aria-label="upload picture"
        component="label"
        onInput={handleChange}
      >
        <PhotoCamera />
        <input
          id="upload-image"
          hidden
          accept="image/*;capture=camera"
          type="file"
        />
      </IconButton>
    </Stack>
  );
};

export default BookImageUploadButton;
