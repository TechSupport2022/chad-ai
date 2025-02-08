import { z } from 'zod';
import { privateProcedure, procedure, router } from './trpc';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { TRPCError } from '@trpc/server';
import { db } from '@/db';
import { ObjectId } from "mongodb"
import { INFINITE_QUERY_LIMIT } from '@/config/infinite-query';


export const appRouter = router({
   //   hello: procedure
   //     .input(
   //       z.object({
   //         text: z.string(),
   //       }),
   //     )
   //     .query((opts) => {
   //       return {
   //         greeting: `hello ${opts.input.text}`,
   //       };
   //     }),

   authCallback: procedure.query(async () => {
      const { getUser } = getKindeServerSession()
      const authUser = await getUser();

      if (!authUser.id || !authUser.email) {
         console.log("Please enter a valide credentials");
         throw new TRPCError({ code: "UNAUTHORIZED" })
      }

      // check if the user is in the database
      const dbUser = await db.user.findFirst({
         where: {
            authId: authUser.id,
         }
      })

      if (!dbUser) {
         // create user in db
         await db.user.create({
            data: {
               authId: authUser.id,
               email: authUser.email
            }
         })
      }
      return { success: true }
   }),

   getUserFiles: privateProcedure.query(async ({ ctx }) => {
      const { authUser, authUserId } = ctx

      const userFiles = await db.file.findMany({
         where: {
            userAuthId: authUserId
         }
      })

      console.log("This is the server userfiles:...", userFiles)

      return userFiles
   }),

   getUserFileMessages: privateProcedure.input(
      z.object({
         limit: z.number().min(1).max(100).nullish(),
         cursor: z.string().nullish(),
         fileId: z.string(),
      })
   )
      .query(async ({ ctx, input }) => {
         const { authUserId } = ctx
         const { fileId, cursor } = input
         const limit = input.limit ?? INFINITE_QUERY_LIMIT

         const file = await db.file.findFirst({
            where: {
               id: fileId,
               userAuthId: authUserId
            }
         })

         if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

         const messages = await db.message.findMany({
            take: limit + 1,
            where: {
               fileId: fileId
            },
            orderBy: {
               createdAt: 'desc'
            },
            cursor: cursor ? { id: cursor } : undefined,
            select: {
               id: true,
               isUserMessage: true,
               createdAt: true,
               text: true,
            }
         })

         let nextCursor: typeof cursor | undefined = undefined;
         if (messages.length > limit) {
            const nextItem = messages.pop();
            nextCursor = nextItem?.id
         }

         console.log("This is from userfile API:...", {messages, cursor})
         return {
            messages,
            nextCursor
         }
      }),

   tempGetUserFiles: procedure.query(async () => {
      const { getUser } = getKindeServerSession()
      const user = await getUser();

      return await db.file.findMany({
         where: {
            userAuthId: user.id
         }
      })
   }),

   deleteFile: privateProcedure.input(
      z.object({ id: z.string() })
   ).mutation(async ({ ctx, input }) => {
      const { authUserId } = ctx

      const file = await db.file.findFirst({
         where: {
            id: input.id,
            userAuthId: authUserId
         }
      })

      if (!file) throw new TRPCError({ code: "NOT_FOUND" })

      await db.file.delete({
         where: {
            id: input.id,
            userAuthId: authUserId
         }
      })

      return file
   }),

   getFile: privateProcedure.input(z.object({
      key: z.string(),
   })).mutation(async ({ ctx, input }) => {
      const { authUserId } = ctx

      const file = await db.file.findFirst({
         where: {
            key: input.key,
            userAuthId: authUserId
         }
      })

      if (!file) throw new TRPCError({ code: "NOT_FOUND" })

      return file
   }),

   getFileUploadtStatus: privateProcedure
      .input(z.object({ fileId: z.string() }))
      .query(async ({ input, ctx }) => {
         const file = await db.file.findFirst({
            where: {
               id: input.fileId,
               userAuthId: ctx.authUserId,
            }
         })

         if (!file) return { status: "PENDING" as const }

         return { status: file.uploadStatus }
      })
});
// export type definition of API
export type AppRouter = typeof appRouter;