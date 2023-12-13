import { Configuration, OpenAIApi } from "openai-edge";
import ChatCompletionRequestMessage from "openai"
import { Message, OpenAIStream, StreamingTextResponse } from 'ai'
import { getContext } from "@/lib/context";
import { db } from "@/lib/db";
import { chats, messages as _messages, userAbonnements } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { env } from "@/lib/config";
import { auth } from "@clerk/nextjs";

export const runtime = 'edge'

const config = new Configuration({
    // apiKey: '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'
    apiKey: env.OPENAI_API_KEY
})

const openai = new OpenAIApi(config)


export async function POST(req: Request) {

    const { userId } = await auth()

    if (!userId) {
        return NextResponse.json({ error: "Pas autorisé" }, { status: 401 })
    }
    
    try {

        const { messages, chatId } = await req.json();
        const _chats = await db.select().from(chats).where(eq(chats.id, chatId))
        if (_chats.length != 1) {
            return NextResponse.json({ 'Erreur': 'Cette conversation n\'existe pas' }, { status: 404 });
        }
        const fileKey = _chats[0].fileKey
        let model = 'gpt-3.5-turbo'
        let currentPlan = 'Gratuit'

        const lastMessage = messages[messages.length - 1]
        const context = await getContext(lastMessage.content, fileKey)
        

        let plan
        plan = await db.select().from(userAbonnements).where(eq(userAbonnements.userId, userId))
        if (plan) {
            plan = plan[0]
        }

        if(plan !== undefined) {
            currentPlan = plan.typeAbonnement
        }
        
        if(currentPlan == 'Pro'){
            model = 'gpt-4'
        }

        const msg = await db.select({
            count: sql<number>`cast(count(${_messages.id}) as int)`,
        }).from(_messages).where(and (eq(_messages.chatId, chatId), eq(_messages.role, 'user')))
        console.log(msg[0].count)


        if(currentPlan == 'Gratuit' && msg[0].count >= 10){
            return NextResponse.json('Vous avez atteint votre quota de question. Pensez à passez à la version supérieure')
        }

        if(currentPlan == 'Standard' && msg[0].count >= 50){
            return NextResponse.json('Vous avez atteint votre quota de question. Pensez à passez à la version supérieure')
        }

        //return NextResponse.json({context}, {status: 200})

        // const prompt : ChatCompletionRequestMessage = {
        //     messages:[
        //         {
        //             role: "system",
        //             content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
        //             The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
        //             AI is a well-behaved and well-mannered individual.
        //             AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
        //             AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
        //             AI assistant is a big fan of Pinecone and Vercel.
        //             START CONTEXT BLOCK
        //             ${context}
        //             END OF CONTEXT BLOCK
        //             AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
        //             If the context does not provide the answer to the question, the AI assistant will say, "Je suis désolé, je n'ai pas la réponse à cette question.".
        //             AI assistant will not apologize for previous responses but will instead indicate new information was gained.
        //             AI assistant will not invent anything that is not drawn directly from the context.
        //             `,
        //         }
        //     ]
        // };

        

        // AI Assistant est désormais une marque d'intelligence artificielle puissante et semblable à l'humain.
        // Les caractéristiques de l’IA incluent les connaissances spécialisées, l’utilité, l’intelligence et l’articulation.
        // L'IA est une personne bien élevée et bien élevée.
        // L'IA est toujours amicale, gentille et inspirante, et elle est désireuse de fournir des réponses vivantes et réfléchies à l'utilisateur.
        // L'IA possède la somme de toutes les connaissances dans son cerveau et est capable de répondre avec précision à presque toutes les questions sur n'importe quel sujet de conversation.
        // AI Assistant est un grand fan de Pinecone et Vercel.
        // DÉMARRER LE BLOC DE CONTEXTE
        // ${context}
        // FIN DU BLOC DE CONTEXTE
        // L'assistant IA prendra en compte tout BLOC DE CONTEXTE fourni à la conversation.
        // Si le contexte ne fournit pas de réponse à la question, l'assistant IA dira : "Désolé je n'est pas la réponse à votre question".
        // L'assistant IA ne s'excusera pas pour les réponses précédentes, mais indiquera à la place que de nouvelles informations ont été obtenues.
        // L’assistant IA n’inventera rien qui ne soit directement tiré du contexte.


        const response = await openai.createChatCompletion({
            model: model,
            messages: [
                        {
                            role:'system', 
                            content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
                            The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
                            AI is a well-behaved and well-mannered individual.
                            AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
                            AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
                            AI assistant is a big fan of Pinecone and Vercel.
                            START CONTEXT BLOCK
                            ${context}
                            END OF CONTEXT BLOCK
                            AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
                            If the context does not provide the answer to the question, the AI assistant will say, "Je suis désolé, je n'ai pas la réponse à cette question.".
                            AI assistant will not apologize for previous responses but will instead indicate new information was gained.
                            AI assistant will not invent anything that is not drawn directly from the context.
                            `
                        }, 
                        ...messages.filter((message: Message) => message.role === 'user')],
            stream: true,
        })


        

        // const response = await openai.createChatCompletion({
        //     model: 'gpt-3.5-turbo',
        //     messages: {
        //         prompt,
        //         ...messages.filter((message: Message) => message.role === 'user')
        //     },
        //     stream: true,
        // });


        const stream = OpenAIStream(response, {
            onStart: async () => {
                await db.insert(_messages).values({
                    chatId,
                    content: lastMessage.content,
                    role: 'user',
                })
            }, 
            onCompletion: async (completion) => {
                await db.insert(_messages).values({
                    chatId,
                    content: completion,
                    role: 'system',
                })
            }
        })
        return new StreamingTextResponse(stream)

    } catch (error) {
        console.error('Error in POST:', error);
    }
}