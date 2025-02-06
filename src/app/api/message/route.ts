import { db } from "@/db";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidators";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
   // endpoint for asking question

   const body = await req.json();

   const { getUser } = getKindeServerSession()
   const user = await getUser()

   const { id: authUserId } = user;

   if (!authUserId) return new Response('UNAUTHORIZED', { status: 401 })

   const { fileId, message } = SendMessageValidator.parse(body)

   const file = await db.file.findFirst({
      where: {
         id: fileId,
         userAuthId: authUserId
      }
   })

   if (!file) return new Response('NOT FOUND', { status: 404 })

   await db.message.create({
      data: {
         text: message,
         isUserMessage: true,
         userAuthId: authUserId,
         fileId,
      },
   })

   // 

}