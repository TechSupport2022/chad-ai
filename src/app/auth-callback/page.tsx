import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const page = () => {
   const router = useRouter()

   const searchParams = useSearchParams()
   const origin = searchParams.get('origin')


    
   
}

export default page
