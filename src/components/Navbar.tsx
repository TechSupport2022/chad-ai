import React from 'react'
import MaxWidthWrapper from './MaxWidthWrapper'
import Link from 'next/link'
import { buttonVariants } from './ui/button'
import { LoginLink } from '@kinde-oss/kinde-auth-nextjs/server'

const Navbar = () => {
   return (
      <nav className='sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all'>
         <MaxWidthWrapper>
            <div className='flex h-14 items-center justify-between border-b border-r-zinc-200'>
               <Link href={'/'} className='flex z-40 font-semibold'>
                  <span>Chad.</span>
               </Link>

               {/* todo: add mobile navbar */}

               <div className='hidden items-center space-x-4 sm:flex'>
                  <>
                     <Link href={'/pricing'} className={buttonVariants({
                        variant: 'ghost',
                        size: 'sm', className: 'font-semibold'
                     })}>Pricing</Link>

                     <LoginLink className={buttonVariants({
                        variant: 'ghost',
                        size: 'sm', className: 'font-semibold'
                     })}>
                        Sign In
                     </LoginLink>
                  </>
               </div>
            </div>

         </MaxWidthWrapper>
      </nav>
   )
}

export default Navbar
