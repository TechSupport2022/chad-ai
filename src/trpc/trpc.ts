import { currentUser } from '@clerk/nextjs/server'
import { TRPCError, initTRPC } from '@trpc/server';
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create();
// Base router and procedure helpers

const middleware = t.middleware;

const isAuth = middleware(async (opts) => {
   const authUser = await currentUser()

   if (!authUser || !authUser.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" })
   }

   return opts.next({
      ctx: {
         authUserId: authUser?.id,
         authUser: authUser
      }
   })
})

export const router = t.router;
export const procedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuth)