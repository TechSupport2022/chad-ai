"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { DialogTitle } from '@radix-ui/react-dialog'


const UploadButton = () => {
   const [isOpen, setIsOpen] = useState<boolean>(false)


   return (
      <Dialog open={isOpen} onOpenChange={(v) => {
         if (!v) {
            setIsOpen(v)
         }
      }}>
         <DialogTrigger onClick={() => setIsOpen(true)} asChild>
            <Button>Upload PDF</Button>
         </DialogTrigger>

         <DialogContent>
            <DialogTitle>Hello</DialogTitle>
            Example Content
         </DialogContent>

      </Dialog>
   )
}

export default UploadButton
