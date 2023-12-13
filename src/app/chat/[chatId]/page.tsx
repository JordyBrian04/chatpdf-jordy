import ChatComponent from '@/components/ChatComponent'
import ChatSideBar from '@/components/ChatSideBar'
import PDFViewer from '@/components/PDFViewer'
import { db } from '@/lib/db'
import { chats } from '@/lib/db/schema'
import { checkSubscription } from '@/lib/subscription'
import { auth } from '@clerk/nextjs'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
    params: {
        chatId: string
    }
}

const Chatpage = async ({ params: { chatId } }: Props) => {

    //On vérifie si un utilisateur est connecté
    const { userId } = await auth()
    if (!userId) {
        redirect('/sign-in')
    }

    //On récupère les informations de la table ``chats``
    const _chats = await db.select().from(chats).where(eq(chats.userId, userId))
    if (!_chats) {
        redirect('/')
    }

    if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
        redirect('/')
    }

    const currentChat = _chats.find((chat) => chat.id === parseInt(chatId))

    const isPro = await checkSubscription()

    return (
        <div className='flex max-h-screen overflow-auto'>
            <div className="flex w-full max-h-screen overflow-auto">

                {/* Sidebar */}
                <div className='flex-[1] max-w-xs'>
                    <ChatSideBar chatId={parseInt(chatId)} chats={_chats} isPro={isPro}/>
                </div>

                {/* Afficher le pdf */}
                <div className='max-h-screen p-4 overflow-auto flex-[5]'>
                    <PDFViewer pdf_url={currentChat?.pdfUrl || ""} />
                </div>

                {/* conversation */}
                <div className='flex-[3] border-l-4 border-l-slate-100'>
                    <ChatComponent chatId={parseInt(chatId)} />
                </div>
            </div>
        </div>
    )
}   

export default Chatpage