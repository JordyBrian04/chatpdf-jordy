import { auth } from "@clerk/nextjs"
import { db } from "./db";
import { userAbonnements, userSubscription } from "./db/schema";
import { eq } from "drizzle-orm";

const DAY_IN_MS = 1000 * 60 * 60 * 24;
export const checkSubscription = async () => {
    const {userId} = await auth()
    if(!userId){
        return false;
    }

    const _userSubscription = await db.select().from(userAbonnements).where(eq(userAbonnements.userId, userId))

    if(!_userSubscription[0]){
        return false;
    }

    const userSubscriptions = _userSubscription[0]

    const isValid = userSubscriptions.stripePriceId && userSubscriptions.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS >
    Date.now();

    if(userSubscriptions.stripePriceId && userSubscriptions.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS <
    Date.now()){
        await db
            .update(userAbonnements)
            .set({
                typeAbonnement : 'Gratuit'
            })
            .where(eq(userAbonnements.userId, userId));
    }

return !!isValid;
}