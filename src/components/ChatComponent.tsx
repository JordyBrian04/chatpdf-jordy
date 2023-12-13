'use client';

import React from 'react'
import { Input } from './ui/input'
import { useChat } from 'ai/react';
import { Button } from './ui/button'
import { Send } from 'lucide-react'
import MessageList from './MessageList';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Message } from 'ai';

type Props = {chatId: number}

const ChatComponent = ({chatId}: Props) => {

    const {data, isLoading} = useQuery({
        queryKey: ['chat', chatId],
        queryFn: async () => {
            const response = await axios.post<Message[]>('/api/get-messages', {chatId})
            return response.data
        }
    })

    const { input, handleInputChange, handleSubmit, messages } = useChat({
        api: '/api/chat',
        body: {
            chatId
        }, 
        initialMessages: data || []
    })

    React.useEffect(() => {
        const messagesContainer = document.getElementById('messages-container')
        if (messagesContainer) {
            messagesContainer.scrollTo({
                top: messagesContainer.scrollHeight,
                behavior: 'smooth'
            })
        }
    }, [messages])

    return (
        <div className='relative max-h-screen overflow-auto' id='messages-container'>
            <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit">
                <h3 className='text-xl font-bold'>Messages</h3>
            </div>

            <MessageList messages={messages} isLoading={isLoading}/>

            <form onSubmit={handleSubmit} className='sticky bottom-0 inset-x-0 px-2 py-2 bg-white'>
                <div className="flex">
                    <Input value={input} onChange={handleInputChange} placeholder='Saisissez votre question...' className='w-full' />
                    <Button className='bg-blue-600 ml-2'>
                        <Send className='h-4 w-4' />
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default ChatComponent