import { Button } from "@/components/ui/button";
import { UserButton, auth } from "@clerk/nextjs";
import Link from "next/link";
import {ArrowRight, LogIn} from 'lucide-react';
import FileUpload from "@/components/FileUpload";
import { db } from "@/lib/db";
import { chats, userAbonnements } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkSubscription } from "@/lib/subscription";
import AbonnementButton from "@/components/AbonnementButton";


export default async function Home() {

  const {userId} = await auth()
  const isAuth = !!userId
  let firstChat;
  let plan
  if (userId) {
    firstChat = await db.select().from(chats).where(eq(chats.userId, userId));
    if (firstChat) {
      firstChat = firstChat[0];
    }

    plan = await db.select().from(userAbonnements).where(eq(userAbonnements.userId, userId))
    if(plan){
      plan = plan[0]
    }
  }

  const isPro = await checkSubscription()

  return (
      <div className="w-screen min-h-screen bg-slate-200">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center">
              <h1 className="mr-3 text-2xl font-semibold text-black">Discutez avec n&apos;importe quel PDF</h1>
              <UserButton afterSignOutUrl="/" />
            </div>

            <div className="flex mt-2">
            {isAuth && firstChat && (
              <>
                <Link href={`/chat/${firstChat.id}`}>
                  <Button>
                    Liste des discussions <ArrowRight className="ml-2" />
                  </Button>
                </Link>
                <div className="ml-3">
                  <AbonnementButton isPro={isPro} />
                </div>
              </>
            )}
            </div>

            <p className="text-slate-600 max-x-xl mt-1 text-lg">
              Importe ton fichier PDF et pose lui toutes les questions sur son contenu afin de t&apos;aider à mieux le comprendre.
            </p>

            <div className="w-full mt-4">
              {isAuth ? (
                <FileUpload type_abonnement={(plan && plan.typeAbonnement) || 'Gratuit'}/>
              ):(
                <Link href='/sign-in'>
                  <Button>
                    Connectez-vous
                    <LogIn className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
  )
}
