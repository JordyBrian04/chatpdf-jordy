// /api/stripe

import { PlansAbonnement } from "@/components/PlansAbonnement";
import { db } from "@/lib/db";
import { userAbonnements, userSubscription } from "@/lib/db/schema";
import { stripe } from "@/lib/stripe";
import { auth, currentUser } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { NextApiRequest } from "next";
import { NextResponse } from "next/server";

const return_url = process.env.NEXT_BASE_URL + "/plan";
const success_url = process.env.NEXT_BASE_URL + "/";

export async function POST(req:Request) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId) {
            return new NextResponse("unauthorized", { status: 401 });
        }

        const {prixEuro, plan} = await req.json()
        console.log(prixEuro);


        const _userSubscriptions = await db
            .select()
            .from(userAbonnements)
            .where(eq(userAbonnements.userId, userId));
        if (_userSubscriptions[0] && _userSubscriptions[0].abonnementId) {
            // trying to cancel at the billing portal
            const stripeSession = await stripe.billingPortal.sessions.create({
                customer: _userSubscriptions[0].abonnementId,
                return_url,
            });
            return NextResponse.json({ url: stripeSession.url });
        }

        const description = PlansAbonnement.find((p) => p.slug === plan.toLowerCase())?.features

        // user's first time trying to subscribe
        const stripeSession = await stripe.checkout.sessions.create({
            success_url: success_url,
            cancel_url: return_url,
            payment_method_types: ["card"],
            mode: "subscription",
            billing_address_collection: "auto",
            customer_email: user?.emailAddresses[0].emailAddress,
            line_items: [
                {
                    price_data: {
                        currency: "EUR",
                        product_data: {
                            name: `ChatPDF ${plan}`,
                            description: description ? description.map(item => item.text).join(', ') : '',
                        },
                        unit_amount: prixEuro,
                        recurring: {
                            interval: "month",
                        },
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                userId,
                plan,
            },
        });
        return NextResponse.json({ url: stripeSession.url });
    } catch (error) {
        console.log("stripe error", error);
        return new NextResponse("internal server error", { status: 500 });
    }
}