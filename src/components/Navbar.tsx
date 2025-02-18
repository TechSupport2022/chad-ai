import React from 'react'
import MaxWidthWrapper from './MaxWidthWrapper'
import Link from 'next/link'
import { buttonVariants } from './ui/button'
import { LoginLink, RegisterLink } from '@kinde-oss/kinde-auth-nextjs/server'
import { ArrowRight } from 'lucide-react'

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

                     <Link href={'/sign-in'} className={buttonVariants({
                        variant: 'ghost',
                        size: 'sm', className: 'font-semibold'
                     })}>
                        Sign In
                     </Link>

                     <Link href={'/sign-up'}
                        className={buttonVariants({
                           size: 'sm',
                        })}>
                        Get started{' '}
                        <ArrowRight className='ml-1.5 h-5 w-5' />
                     </Link>
                  </>
               </div>
            </div>

         </MaxWidthWrapper>
      </nav>
   )
}

export default Navbar
