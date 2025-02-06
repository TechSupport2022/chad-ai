import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { uploadStatus } from "@prisma/client";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { pc } from "@/lib/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
// import { TransformersEmbeddings } from 'langchain/embeddings/hf';
import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf';



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
         const authUser = await getUser()

         console.log("user from uploadthing log:...", authUser);

         // If you throw, the authUser will not be able to upload
         if (!authUser || !authUser.id) throw new UploadThingError("Unauthorized");

         // Whatever is returned here is accessible in onUploadComplete as `metadata`
         return { authUserId: authUser.id };
      })
      .onUploadComplete(async ({ metadata, file }) => {
         // This code RUNS ON YOUR SERVER after upload
         console.log("Upload complete for userId:", metadata.authUserId);

         console.log("file url", file.url);

         const createdFile = await db.file.create({
            data: {
               key: file.key,
               name: file.name,
               userAuthId: metadata.authUserId,
               url: `https://utfs.io/f/${file.key}`,
               uploadStatus: "PROCESSING"
            }
         })

         try {
            const response = await fetch(`https://utfs.io/f/${file.key}`)
            const blob = await response.blob()

            const loader = new PDFLoader(blob)

            const pageLevelDocs = await loader.load()

            const pagesAmt = pageLevelDocs.length;

            // vectorize and index entire document
            // @ts-ignore
            const pineconeIndex = pc.Index(process.env.PINECONE_INDEX)

            // const embeddings = new OpenAIEmbeddings({
            //    // openAIApiKey: process.env.OPEN_AI_API_KEY,
            // })

            // Initialize Transformer embeddings instead of OpenAI
            const embeddings = new HuggingFaceInferenceEmbeddings({
               apiKey: process.env.HUGGINGFACE_API_KEY, // You'll need this
               model: "sentence-transformers/all-mpnet-base-v2"
            });

            await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
               pineconeIndex,
               namespace: createdFile.id,
               maxConcurrency: 5
            })

            await db.file.update({
               data: {
                  uploadStatus: "SUCCESS"
               },
               where: {
                  id: createdFile.id
               }
            })
         } catch (err) {
            console.error(err)
            await db.file.update({
               data: {
                  uploadStatus: "FAILED"
               },
               where: {
                  id: createdFile.id
               }
            })
         }

         // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
         // return { uploadedBy: metadata.userId };
      }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
