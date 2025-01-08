"use client"

import React, { useEffect, useState } from 'react'
import { Document, Page, pdfjs } from "react-pdf"

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
   'pdfjs-dist/build/pdf.worker.min.mjs',
   import.meta.url,
).toString();


interface PDFRendererProps {
   url: string;
}
const PdfRenderer = ({ url }: PDFRendererProps) => {
   console.log(`PDFRenderer url is hereee........: ${url}`);
   const [pdfBlob, setPdfBlob] = useState<string | null>(null);

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
            <div className='flex items-center gap-1.5'></div>
         </div>

         <div className='flex-1 w-full max-h-screen'>
            <div>
               {/* <Document className='max-h-full' file={'/pd.pdf'}> */}
               <Document className='max-h-full' file={url}>
                  <Page pageNumber={1} />
               </Document>
            </div>
         </div>
      </div>
   )
}

export default PdfRenderer
