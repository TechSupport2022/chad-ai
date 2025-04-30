import { generateReactHelpers } from "@uploadthing/react";

import type { OurFileRouter } from "@/app/api/uploadthing/core";

// export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();
export const { useUploadThing, uploadFiles } = generateReactHelpers({
   url: "http://localhost:8080/api/uploadthing",
});