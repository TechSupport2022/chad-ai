'use client'

import React from 'react'
import Messages from './Messages'
import ChatInput from './ChatInput'
import { trpc } from '@/app/_trpc/client'

interface ChatWrapperProps {
   fileId: string;
   isSubscribed: boolean;
}

const ChatWrapper = ({ fileId, isSubscribed }: ChatWrapperProps) => {

   const { data }: any = trpc.getFileUploadtStatus.useQuery({ fileId }, {
      retry: true,
      retryDelay: 500,
      refetchInterval: () => {
         return data?.status === "SUCCESS" ||
         data?.status === "FAILED" ?
         false : 500;
      }
   })

   console.log("This is data and fileId:........", data, fileId)

   // if (queryData?.status === "SUCCESS") {
   //    console.log("File upload successful!");
   // } else if (queryData?.status === "FAILED") {
   //    console.log("File upload failed.");
   // }




   return (
      <div className='relative min-h-full bg-zinc-50 flex divide-y flex-col divide-zinc-200 justify-between gap-2'>
         <div className='flex-1 justify-between flex flex-col mb-28'>
            <Messages />
         </div>

         <ChatInput />
      </div>
   )
}

export default ChatWrapper
