import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";

export const DemoUploadButton = generateUploadButton({
  url: "http://localhost:8080/api/uploadthing",
});
// ...
