import React from 'react'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import Dashboard from '@/components/Dashboard'
import { currentUser } from '@clerk/nextjs/server'



const Page = async () => {
   const authUser = await currentUser()
   console.log("this is the user ID: app/dashboard ", authUser?.id)

   if (!authUser || !authUser.id) redirect('/auth-callback?origin=dashboard')

   const dbUser = await db.user.findFirst({
      where: {
         authId: authUser.id,
      }
   })

   if (!dbUser) redirect('/auth-callback?origin=dashboard')

   return (
      <Dashboard />
   )
}

export default Page
