import { BookType } from "@/entities/BookType";
import { PhotoCamera } from "@mui/icons-material";
import { IconButton, Stack } from "@mui/material";
import { ChangeEvent, useCallback } from "react";
import Resizer from "react-image-file-resizer";

interface BookImageUploadButtonProps {
  book: BookType;
  setLoadingImage: (value: number) => void;
}

const BookImageUploadButton = ({
  book,
  setLoadingImage,
}: BookImageUploadButtonProps) => {
  const resizeFile = (file: File): Promise<Blob> =>
    new Promise((resolve, reject) => {
      Resizer.imageFileResizer(
        file,
        600,
        300,
        "JPEG",
        90,
        0,
        (uri) => {
          resolve(uri as Blob);
        },
        "blob",
        200,
        200
      );
    });

  const handleChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !book.id) return;

      try {
        // Resize image to thumbnail size to save space
        const resizedImage = await resizeFile(file);

        const formData = new FormData();
        formData.set("cover", resizedImage);

        // Fetch API to save the file
        const response = await fetch(`/api/book/cover/${book.id}`, {
          method: "POST",
          headers: {
            "Content-Length": file.size.toString(),
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const json = await response.json();
        console.log("Upload successful:", json);

        // Trigger image reload with random number
        setLoadingImage(Math.floor(Math.random() * 10000));
      } catch (error) {
        console.error("Error uploading image:", error);
        // TODO: Show user-friendly error message (e.g., with a toast/snackbar)
      }
    },
    [book.id, setLoadingImage]
  );

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <IconButton color="primary" aria-label="upload picture" component="label">
        <PhotoCamera />
        <input
          id="upload-image"
          hidden
          accept="image/*"
          type="file"
          onChange={handleChange}
        />
      </IconButton>
    </Stack>
  );
};

export default BookImageUploadButton;
