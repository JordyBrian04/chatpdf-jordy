
import { auth, currentUser } from "@clerk/nextjs";
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { userAbonnements } from '@/lib/db/schema'
export const runtime = 'edge'

// export const POST = async ( req: Request) => { 
//     const {userId} = await req.json()
//     const user_abonnement = await db.select().from(userAbonnements).where(eq(userAbonnements.userId, userId))
//     return NextResponse.json(user_abonnement)
// }

export async function GET() {

    try {
        const {userId} = await auth()
        if (!userId) {
            console.log("pas connecté")
            return new NextResponse("Pas connecté", { status: 200 });
        }
        const user = await currentUser();
    
        const user_abonnement = await db.select().from(userAbonnements).where(eq(userAbonnements.userId, userId))
    
        if (!user_abonnement[0]) {
            return NextResponse.json({ message: 'gratuit' });
        }
    
        return NextResponse.json({ type: user_abonnement[0]?.typeAbonnement || 'gratuit' });
    } catch (error) {
        console.error('Error in GET /api/get-abonnement:', error);
        return new NextResponse("internal server error", { status: 500 });
    }


}