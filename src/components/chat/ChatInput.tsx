import React from 'react'
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Send } from 'lucide-react';


interface ChatInputProps {
   isDisabled: boolean;
}

const ChatInput = ({ isDisabled }: ChatInputProps) => {
   return (
      <div className="absolute bottom-0 left-0 w-full">
         <form className='mx-2 flex flex-row gap-3 md:mx-4 md:last:mb-6 lg:max-w-2xl xl:max-w-3xl'>
            <div className='relative flex h-full flex-1 items-stretch md:flex-col'>
               <div className='relative flex flex-col w-full flex-grow p-4'>
                  <div className='relative'>
                      <Textarea 
                      autoFocus 
                      rows={1} 
                      maxRows={4} 
                      placeholder='Enter your question....' 
                      className='resize-none pr-12 text-base py-3 scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch'
                      />
                     <Button className='absolute bottom-1.5 right-[7px]'>
                        <Send className='h-4 w-4'/>
                     </Button>
                  </div>
               </div>
            </div>
         </form>
      </div>
   )
}

export default ChatInput
