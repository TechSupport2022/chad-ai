import { z } from 'zod';
import { privateProcedure, procedure, router } from './trpc';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { TRPCError } from '@trpc/server';
import { db } from '@/db';
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
      const user = await getUser();

      if (!user.id || user.email) {
         console.log("Please enter a valide credentials");
         throw new TRPCError({ code: "UNAUTHORIZED" })
      }

      // check if the user is in the database
      const dbUser = await db.user.findFirst({
         where: {
            id: user.id,
         }
      })

      if (!dbUser) {
         // create user in db
         await db.user.create({
            data: {
               id: user.id,
               email: user.email
            }
         })
      }
      return { success: true }
   }),

   getUserFiles: privateProcedure.query(async ({ ctx }) => {
      const { userId, user } = ctx

      const userFiles = await db.file.findMany({
         where: {
            userId: userId
         }
      })

      console.log("This is the server userfiles:...", userFiles)

      return userFiles
   }),

   tempGetUserFiles: procedure.query(async () => {
      const { getUser } = getKindeServerSession()
      const user = await getUser();

      return await db.file.findMany({
         where: {
            userId: user.id
         }
      })
   }),

   deleteFile: privateProcedure.input(
      z.object({ id: z.string() })
   ).mutation(async ({ctx, input}) => {
      const { userId } = ctx

      const file = await db.file.findFirst({
         where: {
            id: input.id,
            userId: userId
         }
      })

      if(!file) throw new TRPCError({ code: "NOT_FOUND"})

      await db.file.delete({
         where: {
            id: input.id,
            userId: userId
         }
      })

      return file
   })
});
// export type definition of API
export type AppRouter = typeof appRouter;