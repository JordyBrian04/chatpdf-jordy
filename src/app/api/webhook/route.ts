import { PlansAbonnement } from "@/components/PlansAbonnement";
import { env } from "@/lib/config";
import { db } from "@/lib/db";
import { userAbonnements, userSubscription } from "@/lib/db/schema";
import { stripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get("Stripe-Signature") as string;
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            env.STRIPE_WEBHOOK_SIGNING_SECRET as string
        );
    } catch (error) {
        return new NextResponse("webhook error", { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;


    // new subscription created
    if (event.type === "checkout.session.completed") {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );
        if (!session?.metadata?.userId) {
            return new NextResponse("no userid", { status: 400 });
        }
        // await db.insert(userSubscription).values({
        //     userId: session.metadata.userId,
        //     stripeSubscriptionId: subscription.id,
        //     stripeCustomerId: subscription.customer as string,
        //     stripePriceId: subscription.items.data[0].price.id,
        //     stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        // });
        let plan = session.metadata.plan
        const id = PlansAbonnement.find((p) => p.slug === plan.toLowerCase())?.prix.Id_prix.test

        await db.insert(userAbonnements).values({
            userId: session.metadata.userId,
            typeAbonnement: session.metadata.plan,
            abonnementId: subscription.customer as string,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end*1000),
            stripePriceId: subscription.items.data[0].price.id,
            stripeSubscriberId: subscription.id,
        })

        // await db.insert(userSubscription).values({
        //     userId: session.metadata.userId,
        //     stripeSubscriberId: subscription.id,
        //     stripeCustomerId: subscription.customer as string,
        //     stripePriceId: subscription.items.data[0].price.id,
        //     stripeCurrentPeriodEnd: new Date(subscription.current_period_end*1000),
        // })
    }

    if (event.type === "invoice.payment_succeeded") {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );

        // await db
        //     .update(userSubscription)
        //     .set({
        //         stripePriceId: subscription.items.data[0].price.id,
        //         stripeCurrentPeriodEnd: new Date(
        //             subscription.current_period_end * 1000
        //         ),
        //     })
        //     .where(eq(userSubscription.stripeSubscriberId, subscription.id));

        await db
            .update(userAbonnements)
            .set({
                stripeCurrentPeriodEnd: new Date(
                    subscription.current_period_end * 1000
                ),
            })
            .where(eq(userAbonnements.stripeSubscriberId, subscription.id as string));
    }

    return new NextResponse(null, { status: 200 });
}