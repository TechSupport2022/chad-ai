import React from 'react'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/db'


const Page = async () => {
   const { getUser } = getKindeServerSession()
   const user = await getUser()

   if(!user || !user.id) redirect('/auth-callback?origin=dashboard')

   const dbUser = await db.user.findFirst({
      where: {
         id: user.id,
      }
   })

   if(!dbUser) redirect('/auth-callback?origin=dashboard')
   return (
      <div>
         hello{user.email}
         {user.family_name} {user.given_name} {user.id} {user.phone_number} {user.picture} {user.properties?.state_region} {user.username}
         
      </div>
   )
}

export default Page
