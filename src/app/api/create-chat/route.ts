import { db } from "@/lib/db";
import { chats, userAbonnements } from "@/lib/db/schema";
import { pdfUrl } from "@/lib/pdf-server";
import { loadS3IntoPinecone } from "@/lib/pinecone-server";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request, res: Response) {

    const { userId } = await auth()
    // return NextResponse.json(userId)

    if (!userId) {
        return NextResponse.json({ error: "Pas autorisé" }, { status: 401 })
    }


    try {
        const body = await req.json();
        const { file_key, file_name } = body

        let plan
        plan = await db.select().from(userAbonnements).where(eq(userAbonnements.userId, userId))
        if (plan) {
            plan = plan[0]
        }

        const pages = await loadS3IntoPinecone(file_key, (plan && plan.typeAbonnement) || 'Gratuit')

        if(pages == 100){
            return NextResponse.json({message: `Avec votre abonnement Gratuit vous n'avez droit à 5 pages par PDF`}, {status:200})
        }

        if(pages == 150){
            return NextResponse.json({message: `Avec votre abonnement Gratuit vous n'avez droit à 30 pages par PDF`}, {status:200})
        }
        //console.log(pages)

        // const pages = await loadDataToPinecone(file_key)
        //return NextResponse.json({pages}, {status: 200})
        // console.log('bonjour')
        const chat_id = await db.insert(chats).values({
            fileKey: file_key,
            pdfName: file_name,
            pdfUrl: pdfUrl(file_key),
            userId,
        })
            .returning({
                insertedId: chats.id
            })

        return NextResponse.json({
            chat_id: chat_id[0].insertedId,
        }, { status: 200 })

    } catch (error) {
        return NextResponse.json(
            { error },
            { status: 500 }
        )
    }
}