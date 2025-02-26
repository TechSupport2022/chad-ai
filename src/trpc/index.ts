import { z } from 'zod';
import { privateProcedure, procedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
import { db } from '@/db';
import { INFINITE_QUERY_LIMIT } from '@/config/infinite-query';
import { absoluteUrl } from '@/lib/utils';
import { getUserSubscriptionPlan, stripe } from '@/lib/stripe';
import { PLANS } from '@/config/stripe';
import { currentUser } from '@clerk/nextjs/server'


export const appRouter = router({

   authCallback: procedure.query(async () => {
      const authUser = await currentUser()

      if (!authUser?.id || !authUser) {
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
               email: authUser?.emailAddresses[0].emailAddress
            }
         })
      }
      return { success: true }
   }),

   getFile: privateProcedure.input(z.object({
      key: z.string(),
   })).mutation(async ({ ctx, input }) => {
      const { authUserId } = ctx
      console.log("Getting the file...", ctx)

      const file = await db.file.findFirst({
         where: {
            key: input.key,
            userAuthId: authUserId
         }
      })

      if (!file) throw new TRPCError({ code: "NOT_FOUND" })

      return file
   }),

   getUserFiles: privateProcedure.query(async ({ ctx }) => {
      const { authUser, authUserId } = ctx

      const userFiles = await db.file.findMany({
         where: {
            userAuthId: authUserId
         }
      })

      // console.log("This is the server userfiles:...", userFiles)

      return userFiles
   }),

   createStripeSession: privateProcedure.mutation(async ({ ctx }) => {
      const { authUserId, authUser } = ctx

      const billingUrl = absoluteUrl("dashboard/billing")

      if (!authUserId) throw new TRPCError({ code: "UNAUTHORIZED" })

      const dbUser = await db.user.findFirst({
         where: {
            authId: authUserId,
         }
      })

      if (!dbUser) throw new TRPCError({ code: "UNAUTHORIZED" })

      const subscriptionPlan = await getUserSubscriptionPlan()

      if (subscriptionPlan.isSubscribed && dbUser.stripeCustomerId) {
         const stripeSession = await stripe.billingPortal.sessions.create({
            customer: dbUser.stripeCustomerId,
            return_url: billingUrl,
         })

         return { url: stripeSession.url }
      }

      const stripeSession =
         await stripe.checkout.sessions.create({
            success_url: billingUrl,
            cancel_url: billingUrl,
            payment_method_types: ['card', 'paypal'],
            mode: 'subscription',
            billing_address_collection: 'auto',
            line_items: [
               {
                  price: PLANS.find(
                     (plan) => plan.name === 'Pro'
                  )?.price.priceIds.test,
                  quantity: 1,
               },
            ],
            metadata: {
               userId: authUserId,
            },
         })

      return { url: stripeSession.url }
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

         console.log("This is from userfile API:...", { messages, cursor })
         return {
            messages,
            nextCursor
         }
      }),

   tempGetUserFiles: procedure.query(async () => {
      const authUser = await currentUser();

      return await db.file.findMany({
         where: {
            userAuthId: authUser?.id
         }
      })
   }),

   deleteFile: privateProcedure.input(
      z.object({ id: z.string() })
   ).mutation(async ({ ctx, input }) => {
      console.log("DELETING FILE STARTED SERVSIDE")
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

      console.log("FILE HAS BEEN SUCCESSFULLY DELETED")
      return file
   }),


   getFileUploadtStatus: privateProcedure
      .input(z.object({ fileId: z.string() }))
      .query(async ({ input, ctx }) => {
         console.log("GET FILE UPLOAD STATUS OPERATION STARTED:..", input);
         const file = await db.file.findFirst({
            where: {
               id: input.fileId,
               // userAuthId: ctx.authUserId,
            }
         })

         if (!file) return { status: "PENDING" as const }

         return { status: file.uploadStatus }
      })
});
// export type definition of API
export type AppRouter = typeof appRouter;