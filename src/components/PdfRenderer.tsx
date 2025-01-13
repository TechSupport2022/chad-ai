"use client"

import { useToast } from '@/hooks/use-toast';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { Document, Page, pdfjs } from "react-pdf"
import { useResizeDetector } from "react-resize-detector"

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Button } from './ui/button';
import { Input } from './ui/input';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
   'pdfjs-dist/build/pdf.worker.min.mjs',
   import.meta.url,
).toString();


interface PDFRendererProps {
   url: string;
}
const PdfRenderer = ({ url }: PDFRendererProps) => {
   const [pdfBlob, setPdfBlob] = useState<string | null>(null);

   const { toast } = useToast()

   const { width, ref } = useResizeDetector()

   const [numPages, setNumPages] = useState<number>()
   const [currPage, setCurrPage] = useState<number>(1)

   useEffect(() => {
      const fetchPDF = async () => {
         try {
            const response = await fetch('https://utfs.io/f/K4uCpPvVyUchQnmhyAayK0UvhVFxYprdJCbLDgnIoRjm1l3X');
            if (!response.ok) throw new Error('Failed to fetch PDF');
            const blob = await response.blob();
            setPdfBlob(URL.createObjectURL(blob));
         } catch (error) {
            console.error(error);
         }
      };

      fetchPDF();
   }, []);

   return (
      <div className='w-full bg-white rounded-md shadow flex flex-col items-center'>
         <div className='h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2'>
            <div className='flex items-center gap-1.5'>
               <Button variant={'ghost'} aria-label='previous page'
                  disabled={currPage <= 1}
                  onClick={() => {
                     setCurrPage((prev) => (prev - 1 > 1 ? prev-- : 1))
                  }}>
                  <ChevronDown className='h-4 w-4' />
               </Button>

               <div className='flex items-center gap-1.5'>
                  <Input className="w-12 h-7" defaultValue={1} />
                  <p className='text-zinc-700 text-sm space-x-1'>
                     <span>/</span>
                     <span>{numPages ?? 'x'}</span>
                  </p>
               </div>

               <Button
                  variant={'ghost'}
                  aria-label='previous page'
                  disabled={numPages === undefined || numPages === currPage}
                  onClick={() => {
                     setCurrPage((prev) => prev + 1 > numPages! ? numPages! : prev++)
                  }}
               >
                  <ChevronUp className='h-4 w-4' />
               </Button>
            </div>
         </div>

         <div className='flex-1 w-full max-h-screen'>
            <div ref={ref}>
               <Document
                  className='max-h-full'
                  file={url}
                  loading={
                     <div className='flex justify-center'>
                        <Loader2 />
                     </div>
                  }
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  onLoadError={() =>
                     toast({
                        title: 'Error loading',
                        description: 'Please try again later.',
                        variant: 'destructive'
                     })
                  }
               >
                  <Page width={width ? width : 1} pageNumber={currPage} />
               </Document>
            </div>
         </div>
      </div>
   )
}

export default PdfRenderer
