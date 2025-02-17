"use client"

export const dynamic = 'force-dynamic';

import React, { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '../_trpc/client'
import { Loader2 } from 'lucide-react'

const AuthCallbackContent = () => {
   const router = useRouter()

   const searchParams = useSearchParams()

   const origin = searchParams.get('origin')

   // const { data } = trpc.hello.useQuery({ text: "Hello TRPC!" })


   // Call the TRPC query with retry options
   const { data, error } = trpc.authCallback.useQuery(undefined, {
      retry: true,
      retryDelay: 500,
   });

   useEffect(() => {
      // Handle successful authentication
      if (data?.success) {
         router.push(origin ? `/${origin}` : '/dashboard');
      }

      // Handle unauthorized access
      if (error?.data?.code === 'UNAUTHORIZED') {
         router.push('/sign-in');
      }

      // Optionally, handle loading state and prevent infinite redirects
      if (error && !data) {
         // Log or handle the error state, maybe show an error message
         console.error('Authentication failed:', error);
      }
   }, [data, error, origin, router]);


   return (
      <div className='w-full mt-24 flex justify-center'>
         <div className='flex flex-col items-center gap-2'>
            <Loader2 className='h-8 w-8 animate-spin text-zinc-800' />
            <h3 className='font-semibold text-xl'>
               Setting up your account...
            </h3>
            <p>You will be redirected automatically.</p>
         </div>
      </div>
   )




}

export default AuthCallbackContent
