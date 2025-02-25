import { NextRequest } from 'next/server';

export async function GET(
   request: NextRequest,
   { params }: { params: { fileId: string } }
): Promise<Response> {
   console.log("FILE API CALLED JUST NOW...........")
   const { fileId } = await params;

   
   // Construct the Uploadthing URL for the PDF file.
   // const fileUrl = `https://utfs.io/f/${fileId}`;
   const fileUrl = `https://kylwgfzugf.ufs.sh/f/${fileId}`;

   
   // Fetch the PDF file from Uploadthing.
   const response = await fetch(fileUrl);
   if (!response.ok) {
      return new Response('Error fetching file', { status: response.status });
   }

   
   // Create new headers overriding the disposition
   const headers = new Headers(response.headers);
   headers.set('Content-Disposition', 'inline;');
   headers.set('Content-Type', 'application/pdf');
   headers.set('X-Content-Type-Options', 'nosniff');

   // Return the modified response.
   return new Response(response.body, {
      headers,
      status: response.status,
   });
}

