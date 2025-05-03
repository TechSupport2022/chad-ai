"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { DialogTitle } from '@radix-ui/react-dialog'

import Dropzone from "react-dropzone"
import { Cloud, File, Loader2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { useUploadThing } from '@/lib/uploadthing'
import { useToast } from '@/hooks/use-toast'
import { trpc } from '@/app/_trpc/client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'


const UploadDropzone = ({ token }: { token: string}) => {
   const router = useRouter()
   const { toast } = useToast()

   const [isUploading, setIsUploading] = useState<boolean>(false)
   const [uploadProgress, setUploadProgress] = useState<number>(0)

   // 👇 Get Clerk token

   console.log("CLERK TOKEN:.......", token)

   const { startUpload } = useUploadThing("PDFUploader1", {
      headers: {
         Authorization: `Bearer ${token}`,
      },
   });

   const { mutate: startPolling } = trpc.getFile.useMutation({
      onSuccess: (file) => {
         router.push(`/dashboard/${file.id}`)
      },
      retry: true,
      retryDelay: 500
   })

   const startSimulatedProgressFn = () => {
      setUploadProgress(0)

      const interval = setInterval(() => {
         setUploadProgress((prevProgress) => {
            if (prevProgress >= 95) {
               clearInterval(interval)
               return prevProgress
            }
            return prevProgress + 5
         })
      }, 500)

      return interval
   }

   return (
      <Dropzone
         accept={{ 'application/pdf': ['.pdf'] }}
         multiple={false}
         onDrop={async (acceptedFile) => {
            setIsUploading(true)

            const progressInterval = startSimulatedProgressFn()

            // IT DID CALL START UPLOAD SIMULATION PROGRESS
            console.log("STARTING UPLOAD SIMULATION PROGRESS")

            // handle file uploading
            console.log("UPLOADING ACCEPTED FILE: ", acceptedFile)


            ////////////////////////////////////////////////////////////////////////////////////////////////
            const res = await startUpload([acceptedFile[0]]);
            ////////////////////////////////////////////////////////////////////////////////////////////////


            console.log("res-111111111111111111111111111111111111111111111111111111111111111 here:....", res);

            if (!res) {
               toast({
                  title: "Something went wrong uploading",
                  description: "Please try again later.",
                  variant: "destructive"
               })
            }

            let key!: string
            // Add a guard clause to ensure res is defined
            if (Array.isArray(res) && res.length > 0) {
               const [fileResponse] = res; // Safely destructure here

               key = fileResponse?.key;

               if (!key) {
                  toast({
                     title: "Something went wrong uploading",
                     description: "Please try again later.",
                     variant: "destructive"
                  });
               } else {
                  console.log("File key:", key); // Use the key as needed
               }
            } else {
               toast({
                  title: "Something went wrong uploading",
                  description: "Please try again later.",
                  variant: "destructive"
               });

               console.log("res here:....", res);
            }


            clearInterval(progressInterval)
            setUploadProgress(100)

            console.log("This is the key:.........", key);

            console.log("Started POLINGGGGGGGGGGGGGG with KEY: ", key)

            if (key) {
               console.log("Starting polling with key:", key);
               startPolling({ key });
            } else {
               console.error("Upload failed, no key returned.");
            }


            // setIsUploading(false)
            console.log("This is the dragged and dropped file:.......", acceptedFile)
         }}>
         {({ getRootProps, getInputProps, acceptedFiles }) => (
            <div {...getRootProps()} className='border h-64 border-dashed border-gray-300 rounded-lg'>
               <div className='flex items-center justify-center h-full w-full'>
                  <label htmlFor='dropzone-file' className='flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100'>
                     <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                        <Cloud className='mb-2 text-sm text-zinc-700' />
                        <p className='mb-2 text-sm text-zinc-700'>
                           <span className='font-semibold'>
                              Click to upload
                           </span>{' '}
                           or drag and drop
                        </p>
                        <p className='text-xs text-zinc-500'>PDF (up to 4MB)</p>
                     </div>


                     {acceptedFiles && acceptedFiles[0] ? (
                        <div className='max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200'>
                           <div className='px-3 py-2 h-full grid place-items-center'>
                              <File className='h-4 w-4 text-blue-500' />
                           </div>
                           <div className='px-3 py-2 h-full text-sm truncate'>
                              {acceptedFiles[0].name}
                           </div>
                        </div>
                     ) : null}

                     {isUploading ? (
                        <div className='w-full mt-4 max-w-xs mx-auto'>
                           <Progress indicatorColor={
                              uploadProgress === 100 ? 'bg-green-200' : ''
                           } className='h-1 w-full bg-zinc-200' value={uploadProgress} />

                           {uploadProgress === 100 ? (
                              <div className='flex gap-1 items-center justify-center text-sm text-center pt-2'>
                                 <Loader2 className='h-3 w-3 animate-spin' /> Redirecting.....
                              </div>
                           ) : null}
                        </div>
                     ) : null}

                     {/* <input {...getInputProps()} type="file" id='dropzone-file' className='hidden' /> */}
                     <input
                        {...getInputProps()}
                        type="file"
                        id='dropzone-file'
                        style={{ opacity: 0, position: "absolute", width: "100%", height: "100%" }}
                     />

                  </label>
               </div>
            </div>
         )}
      </Dropzone>
   )
}

export default UploadDropzone