import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";

import "react-loading-skeleton/dist/skeleton.css"
import "simplebar-react/dist/simplebar.min.css"
import { Toaster } from "@/components/ui/toaster";
// import { AuthProvider } from "./AuthProvider";

import {
   ClerkProvider,
   SignInButton,
   SignedIn,
   SignedOut,
   UserButton
} from '@clerk/nextjs'


export const metadata: Metadata = {
   title: "CHAD AI",
   description: "Upload, Interact, Learn – Powered by Chad."
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <ClerkProvider>
         <html lang="en" className="light">
            <Providers>
               <body
                  className={cn('min-h-screen font-sans antialiased grainy')}>
                  <Toaster />
                  <Navbar />
                  {children}
               </body>
            </Providers>
         </html>
      </ClerkProvider>
   );
}
