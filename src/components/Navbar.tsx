import React from 'react'
import MaxWidthWrapper from './MaxWidthWrapper'
import Link from 'next/link'
import { buttonVariants } from './ui/button'
import { ArrowRight } from 'lucide-react'
import MobileNav from './MobileNav'
import { currentUser } from '@clerk/nextjs/server'
import UserAccountNav from './UserAccountNav'

const Navbar = async () => {
   const authUser = await currentUser()

   return (
      <nav className='sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all'>
         <MaxWidthWrapper>
            <div className='flex h-14 items-center justify-between border-b border-zinc-200'>
               <Link href={'/'} className='flex z-40 font-semibold'>
                  <span>Chad.</span>
               </Link>

               <MobileNav isAuth={!!authUser} />
               {/* todo: add mobile navbar */}

               <div className='hidden items-center space-x-4 sm:flex'>
                  {!authUser ? (
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
                  ) : (
                     <>
                        <Link
                           href='/dashboard'
                           className={buttonVariants({
                              variant: 'ghost',
                              size: 'sm',
                           })}>
                           Dashboard
                        </Link>

                        <UserAccountNav
                           name={
                              !authUser.firstName || !authUser.lastName
                                 ? 'Your Account'
                                 : `${authUser.firstName} ${authUser.lastName}`
                           }
                           email={authUser.emailAddresses[0].emailAddress ?? ''}
                           imageUrl={authUser.imageUrl ?? ''}
                        />
                     </>
                  )}



               </div>
            </div>

         </MaxWidthWrapper>
      </nav>
   )
}

export default Navbar
