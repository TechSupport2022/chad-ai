'use client'

import {
   ChevronDown,
   ChevronUp,
   Loader2,
   RotateCw,
   Search,
} from 'lucide-react'
import { Document, Page, pdfjs } from 'react-pdf'

import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { useToast } from "@/hooks/use-toast"

import { useResizeDetector } from 'react-resize-detector'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useEffect, useState } from 'react'

import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from './ui/dropdown-menu'

import SimpleBar from 'simplebar-react'
// import PdfFullscreen from './PdfFullscreen'
import PdfFullscreen from './PdfFullscreen'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
   'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
   import.meta.url,
).toString();



interface PdfRendererProps {
   url?: string,
   file_key: string
}

const PdfRenderer = ({ file_key }: PdfRendererProps) => {
   const { toast } = useToast()

   const [blobUrl, setBlobUrl] = useState<string>();
   const [numPages, setNumPages] = useState<number>()
   const [currPage, setCurrPage] = useState<number>(1)
   const [scale, setScale] = useState<number>(1)
   const [rotation, setRotation] = useState<number>(0)
   const [renderedScale, setRenderedScale] = useState<
      number | null
   >(null)

   const isLoading = renderedScale !== scale

   const CustomPageValidator = z.object({
      page: z.string().refine((num) => {
         if (!numPages) return true; // Skip range check until PDF is loaded
         const pageNum = Number(num);
         return pageNum > 0 && pageNum <= numPages;
      }, {
         message: `Page number must be between 1 and ${numPages || '?'}`,
      }),
   });

   type TCustomPageValidator = z.infer<typeof CustomPageValidator>

   const {
      register,
      handleSubmit,
      formState: { errors },
      setValue,
   } = useForm<TCustomPageValidator>({
      defaultValues: {
         page: '1',
      },
      resolver: zodResolver(CustomPageValidator),
   })

   console.log("THIS IS THE ERRORS FOUND IN PDFRENDERER", errors)

   const { width, ref } = useResizeDetector()

   const handlePageSubmit = ({
      page,
   }: TCustomPageValidator) => {
      setCurrPage(Number(page))
      setValue('page', String(page))
   }

   const file_url = `/api/pdf-proxy/${file_key}?mrreal=illustration`;
   useEffect(() => {
      async function fetchPDF() {
         try {
            console.log("Fetching from:", file_url);
            const response = await fetch(file_url, {
               headers: { 'X-Requested-With': 'XMLHttpRequest' },
            });

            console.log("Response status:", response.status);
            if (!response.ok) {
               const text = await response.text();
               console.error("Error response text:", text);
               throw new Error('Error fetching PDF: ' + response.status);
            }
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            console.log("Created blob URL:", objectUrl);
            setBlobUrl(objectUrl);
         } catch (error) {
            console.error("fetchPDF error:", error);
            if (!blobUrl) {
               toast({
                  title: "PDF Not Loading",
                  description:
                     "It seems a download manager (like IDM) might be intercepting the file. Please disable it or whitelist this site to view the PDF properly.",
                  variant: "destructive",
               });
            }
         }
      }
      fetchPDF();
   }, [file_url]);




   return (
      <div className='w-full bg-white rounded-md shadow flex flex-col items-center'>
         <div className='h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2'>
            <div className='flex items-center gap-1.5'>
               <Button
                  disabled={currPage <= 1}
                  onClick={() => {
                     setCurrPage((prev) =>
                        prev - 1 > 1 ? prev - 1 : 1
                     )
                     setValue('page', String(currPage - 1))
                  }}
                  variant='ghost'
                  aria-label='previous page'>
                  <ChevronDown className='h-4 w-4' />
               </Button>

               <div className='flex items-center gap-1.5'>
                  <Input
                     {...register('page')}
                     className={cn(
                        'w-12 h-8',
                        errors.page && 'focus-visible:ring-red-500'
                     )}
                     onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                           handleSubmit(handlePageSubmit)()
                        }
                     }}
                  />
                  <p className='text-zinc-700 text-sm space-x-1'>
                     <span>/</span>
                     <span>{numPages ?? 'x'}</span>
                  </p>
               </div>

               <Button
                  disabled={
                     numPages === undefined ||
                     currPage === numPages
                  }
                  onClick={() => {
                     setCurrPage((prev) =>
                        prev + 1 > numPages! ? numPages! : prev + 1
                     )
                     setValue('page', String(currPage + 1))
                  }}
                  variant='ghost'
                  aria-label='next page'>
                  <ChevronUp className='h-4 w-4' />
               </Button>
            </div>

            <div className='space-x-2'>
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button
                        className='gap-1.5'
                        aria-label='zoom'
                        variant='ghost'>
                        <Search className='h-4 w-4' />
                        {scale * 100}%
                        <ChevronDown className='h-3 w-3 opacity-50' />
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                     <DropdownMenuItem
                        onSelect={() => setScale(1)}>
                        100%
                     </DropdownMenuItem>
                     <DropdownMenuItem
                        onSelect={() => setScale(1.5)}>
                        150%
                     </DropdownMenuItem>
                     <DropdownMenuItem
                        onSelect={() => setScale(2)}>
                        200%
                     </DropdownMenuItem>
                     <DropdownMenuItem
                        onSelect={() => setScale(2.5)}>
                        250%
                     </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>

               <Button
                  onClick={() => setRotation((prev) => prev + 90)}
                  variant='ghost'
                  aria-label='rotate 90 degrees'>
                  <RotateCw className='h-4 w-4' />
               </Button>

               <PdfFullscreen fileUrl={blobUrl!} />
            </div>
         </div>

         <div className='flex-1 w-full max-h-screen'>
            <SimpleBar
               autoHide={false}
               className='max-h-[calc(100vh-10rem)]'>
               <div ref={ref}>
                  <Document
                     loading={
                        <div className='flex justify-center'>
                           <Loader2 className='my-24 h-6 w-6 animate-spin' />
                        </div>
                     }
                     onLoadError={(error) => {
                        console.error("Error loading PDF:", error);
                        toast({
                           title: 'Error loading PDF',
                           description: 'Please try again later',
                           variant: 'destructive',
                        })
                     }}
                     onLoadSuccess={({ numPages }) =>
                        setNumPages(numPages)
                     }
                     file={blobUrl}
                     className='max-h-full'>
                     {isLoading && renderedScale ? (
                        <Page
                           width={width ? width : 1}
                           pageNumber={currPage}
                           scale={scale}
                           rotate={rotation}
                           key={'@' + renderedScale}
                        />
                     ) : null}

                     <Page
                        className={cn(isLoading ? 'hidden' : '')}
                        width={width ? width : 1}
                        pageNumber={currPage}
                        scale={scale}
                        rotate={rotation}
                        key={'@' + scale}
                        loading={
                           <div className='flex justify-center'>
                              <Loader2 className='my-24 h-6 w-6 animate-spin' />
                           </div>
                        }
                        onRenderSuccess={() =>
                           setRenderedScale(scale)
                        }
                     />
                  </Document>
               </div>
            </SimpleBar>
         </div>
      </div>
   )
}

export default PdfRenderer
