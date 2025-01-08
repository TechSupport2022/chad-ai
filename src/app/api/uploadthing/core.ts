import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { uploadStatus } from "@prisma/client";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
   // Define as many FileRoutes as you like, each with a unique routeSlug
   PDFUploader: f({
      pdf: {
         /**
          * For full list of options and defaults, see the File Route API reference
          * @see https://docs.uploadthing.com/file-routes#route-config
          */
         maxFileSize: "4MB",
         maxFileCount: 1,
      },
   })
      // Set permissions and file types for this FileRoute
      .middleware(async ({ req }) => {
         // This code runs on your server before upload
         const { getUser } = getKindeServerSession();
         const user = await getUser()

         console.log("user from uploadthing log:...", user);

         // If you throw, the user will not be able to upload
         if (!user || !user.id) throw new UploadThingError("Unauthorized");

         // Whatever is returned here is accessible in onUploadComplete as `metadata`
         return { userId: user.id };
      })
      .onUploadComplete(async ({ metadata, file }) => {
         // This code RUNS ON YOUR SERVER after upload
         console.log("Upload complete for userId:", metadata.userId);

         console.log("file url", file.url);

         const createdFile = await db.file.create({
            data: {
               key: file.key,
               name: file.name,
               userId: metadata.userId,
               url: `https://utfs.io/f/${file.key}`,
               uploadStatus: "PROCESSING"
            }
         })

         // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
         // return { uploadedBy: metadata.userId };
      }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
