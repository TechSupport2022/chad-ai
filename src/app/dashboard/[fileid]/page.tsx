import ChatWrapper from '@/components/chat/ChatWrapper'
import PdfRenderer from '@/components/PdfRenderer'
import { db } from '@/db'
import { currentUser } from '@clerk/nextjs/server'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { notFound, redirect } from 'next/navigation'
import React from 'react'


interface PageProps {
   params: {
      fileid: string
   }
}
const page = async ({ params }: PageProps) => {
   const { fileid } = await params;
   const authUser = await currentUser();

   if (!authUser || !authUser.id) redirect(`/auth-callback?origin=dashboard/${fileid}`)

   // make db call
   const file = await db.file.findFirst({
      where: {
         userAuthId: authUser.id,
         id: fileid
      }
   })

   console.log("THIS IS THE FILE:////", file)

   const plan = {
      isSubscribed: true
   }

   if (!file) {
      console.log("FILE NOT FOUND: ", file)
      notFound()
   }
   return (
      <div className='flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]'>
         <div className='mx-auto w-full max-w-8xl grow lg:flex xl:px-2'>
            {/* Left sidebar & main wrapper */}
            <div className='flex-1 xl:flex'>
               <div className='px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6'>
                  {/* Main area */}
                  <PdfRenderer url={file.url} />
               </div>
            </div>

            <div className='shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0'>
               <ChatWrapper isSubscribed={plan.isSubscribed} fileId={file.id} />
            </div>
         </div>
      </div>
   )
}

export default page
