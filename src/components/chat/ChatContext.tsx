import {
   ReactNode,
   createContext,
   useRef,
   useState,
} from 'react'
import { useMutation } from '@tanstack/react-query'
import { trpc } from '@/app/_trpc/client'
import { INFINITE_QUERY_LIMIT } from '@/config/infinite-query'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@clerk/nextjs'

type StreamResponse = {
   addMessage: () => void
   message: string
   handleInputChange: (
      event: React.ChangeEvent<HTMLTextAreaElement>
   ) => void
   isLoading: boolean
}

export const ChatContext = createContext<StreamResponse>({
   addMessage: () => { },
   message: '',
   handleInputChange: () => { },
   isLoading: false,
})

interface Props {
   fileId: string
   children: ReactNode
}

export const ChatContextProvider = ({
   fileId,
   children,
}: Props) => {
   const [message, setMessage] = useState<string>('')
   const [isLoading, setIsLoading] = useState<boolean>(false)

   const utils = trpc.useUtils()

   const { toast } = useToast()
   const { userId } = useAuth()

   const backupMessage = useRef('')

   const { mutate: sendMessage } = useMutation({
      mutationFn: async ({ message }: { message: string }) => {
         // const response = await fetch('api/message', {
         const response = await fetch('https://d32c-197-211-57-19.ngrok-free.app/api/message', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               fileId,
               message,
               userId
            }),
         })

         if (!response.ok) {
            throw new Error('Failed to send message')
         }
         console.log("This is the ai response don't miss itttttttttttttttttttttttttttttttttt:...........", await response.text())
         // return response.body


         const data = await response.json();
         console.log("AI Responseeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee:", data);
         return data;
      },
      onMutate: async ({ message }) => {
         backupMessage.current = message
         setMessage('')

         // step 1
         await utils.getUserFileMessages.cancel()

         // step 2
         const previousMessages =
            utils.getUserFileMessages.getInfiniteData()

         // step 3
         utils.getUserFileMessages.setInfiniteData(
            { fileId, limit: INFINITE_QUERY_LIMIT },
            (old) => {
               if (!old) {
                  return {
                     pages: [],
                     pageParams: [],
                  }
               }

               const newPages = [...old.pages]

               const latestPage = newPages[0]!

               latestPage.messages = [
                  {
                     createdAt: new Date().toISOString(),
                     id: crypto.randomUUID(),
                     text: message,
                     isUserMessage: true,
                  },
                  ...latestPage.messages,
               ]

               newPages[0] = latestPage

               return {
                  ...old,
                  pages: newPages,
               }
            }
         )

         setIsLoading(true)

         return {
            previousMessages:
               previousMessages?.pages.flatMap(
                  (page) => page.messages
               ) ?? [],
         }
      },
      onSuccess: async (stream) => {
         setIsLoading(false)

         if (!stream) {
            return toast({
               title: 'There was a problem sending this message',
               description:
                  'Please refresh this page and try again',
               variant: 'destructive',
            })
         }

         const reader = stream.getReader()
         console.log("This is reader:.......", reader)
         const decoder = new TextDecoder()
         let done = false

         // accumulated response
         let accResponse = ''

         while (!done) {
            const { value, done: doneReading } =
               await reader.read()
            done = doneReading
            const chunkValue = decoder.decode(value)

            accResponse += chunkValue

            // append chunk to the actual message
            utils.getUserFileMessages.setInfiniteData(
               { fileId, limit: INFINITE_QUERY_LIMIT },
               (old) => {
                  if (!old) return { pages: [], pageParams: [] }

                  const isAiResponseCreated = old.pages.some(
                     (page) =>
                        page.messages.some(
                           (message: {
                              text: string;
                              id: string;
                              createdAt: Date;
                              isUserMessage: boolean;
                           }) => message.id === 'ai-response'
                        )
                  )

                  const updatedPages = old.pages.map((page) => {
                     if (page === old.pages[0]) {
                        let updatedMessages

                        if (!isAiResponseCreated) {
                           updatedMessages = [
                              {
                                 createdAt: new Date().toISOString(),
                                 id: 'ai-response',
                                 text: accResponse,
                                 isUserMessage: false,
                              },
                              ...page.messages,
                           ]
                        } else {
                           updatedMessages = page.messages.map(
                              (message: {
                                 text: string;
                                 id: string;
                                 createdAt: Date;
                                 isUserMessage: boolean;
                              }) => {
                                 if (message.id === 'ai-response') {
                                    return {
                                       ...message,
                                       text: accResponse,
                                    }
                                 }
                                 return message
                              }
                           )
                        }

                        return {
                           ...page,
                           messages: updatedMessages,
                        }
                     }

                     return page
                  })

                  return { ...old, pages: updatedPages }
               }
            )
         }
      },

      onError: (_, __, context) => {
         setMessage(backupMessage.current)
         utils.getUserFileMessages.setData(
            { fileId },
            { messages: context?.previousMessages ?? [] }
         )
      },
      onSettled: async () => {
         setIsLoading(false)

         await utils.getUserFileMessages.invalidate({ fileId })
      },
   })

   const handleInputChange = (
      e: React.ChangeEvent<HTMLTextAreaElement>
   ) => {
      setMessage(e.target.value)
   }

   const addMessage = () => sendMessage({ message })

   return (
      <ChatContext.Provider
         value={{
            addMessage,
            message,
            handleInputChange,
            isLoading,
         }}>
         {children}
      </ChatContext.Provider>
   )
}
