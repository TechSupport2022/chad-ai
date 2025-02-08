import { db } from "@/db";
import { pc } from "@/lib/pinecone";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidators";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { PineconeStore } from "@langchain/pinecone";
import { NextRequest } from "next/server";
import { HfInference } from "@huggingface/inference";
import { generatePrompts } from "@/lib/constants";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export const POST = async (req: NextRequest) => {
   // endpoint for asking question

   const body = await req.json();

   const { getUser } = getKindeServerSession()
   const authUser = await getUser()

   const { id: authUserId } = authUser;

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

   // VECTORIZE USER QUESTION
   const embeddings = new HuggingFaceInferenceEmbeddings({
      apiKey: process.env.HUGGINGFACE_API_KEY, // You'll need this
      model: "sentence-transformers/all-mpnet-base-v2"
   });

   // @ts-ignore
   const pineconeIndex = pc.Index(process.env.PINECONE_INDEX)

   const vectorstore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      namespace: file.id,
      maxConcurrency: 5
   })

   const results = await vectorstore.similaritySearch(message, 4)

   const prevMessages = await db.message.findMany({
      where: {
         fileId: file.id,
      },
      orderBy: {
         createdAt: "asc"
      },
      take: 6
   })

   const formattedPrevMessages = prevMessages.map((msg) => ({
      role: msg.isUserMessage ? "user" as const : "assistant" as const,
      content: msg.text
   }))

   // const response = await fetch("https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf", {
   //    method: "POST",
   //    headers: {
   //       "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
   //       "Content-Type": "application/json"
   //    },
   //    body: JSON.stringify({
   //       inputs: `
   //    Use the following pieces of context (or previous conversation if needed) to answer the user's question in markdown format.
   //    If you don't know the answer, just say that you don't know, don't try to make up an answer.

   //    ----------------

   //    PREVIOUS CONVERSATION:
   //    ${formattedPrevMessages.map((message) => {
   //          if (message.role === 'user') return `User: ${message.content}\n`;
   //          return `Assistant: ${message.content}\n`;
   //       }).join('')}

   //    ----------------

   //    CONTEXT:
   //    ${results.map((r) => r.pageContent).join('\n\n')}

   //    USER INPUT: ${message}
   //    `,
   //       parameters: {
   //          max_new_tokens: 150,
   //          temperature: 0.7,
   //          top_p: 0.8
   //       }
   //    })
   // });

   // CALL LLaMA API USING HUGGING FACE SDK
   const response = await hf.textGeneration({
      model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",

      inputs: generatePrompts(formattedPrevMessages, results, message),

      // Use the following context to answer the user's question in markdown format.
      // If you don't know, just say so.

      // ----------------

      // PREVIOUS CONVERSATION:
      // ${formattedPrevMessages.map(msg => `${msg.role}: ${msg.content}`).join("\n")}

      // ----------------

      // CONTEXT:
      // ${results.map(r => r.pageContent).join("\n\n")}

      // USER INPUT: ${message}
      // `,
      parameters: {
         max_new_tokens: 150,
         temperature: 0.7,
         top_p: 0.8
      }
   });

   // Extract only the final answer from the generated text.
   const generatedText: string = response.generated_text;
   const parts = generatedText.split('</think>');
   const answer = parts.length > 1 ? parts[1].trim() : generatedText.trim();

   // Optionally log the answer.
   console.log("Final Answer from ai be like:  ", answer);

   // Store only the answer in the database, instead of the whole response.
   await db.message.create({
      data: {
         text: answer,
         isUserMessage: false,
         userAuthId: authUserId,
         fileId,
      },
   });

   let logThis = new Response(JSON.stringify(response), { status: 200 });
   // let logThis =  new Response(response.body, { status: 200 });
   // console.log(logThis.json().then(response => console.log(response)))
   return logThis
};
