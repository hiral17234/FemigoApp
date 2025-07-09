
"use client"

import { useState, useRef, useEffect, FormEvent } from 'react'
import { SendHorizonal, Bot, User } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { sanginiChat } from '@/ai/flows/sangini-chat-flow'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

const AssistantMessage = ({ content }: { content: string }) => (
  <div className="flex items-start gap-3 animate-in fade-in-0 slide-in-from-left-4 duration-500">
    <Avatar className="h-9 w-9 border-2 border-primary/50">
      <AvatarImage src="https://i.ibb.co/HLzTTrPk/Whats-App-Image-2025-06-24-at-20-28-17-0f216b7b.jpg" alt="Sangini Assistant" data-ai-hint="woman illustration" />
      <AvatarFallback>S</AvatarFallback>
    </Avatar>
    <div className="max-w-xs sm:max-w-md rounded-2xl rounded-tl-none bg-card p-3 text-sm text-card-foreground shadow-md">
      {content}
    </div>
  </div>
)

const UserMessage = ({ content }: { content:string }) => (
  <div className="flex items-start justify-end gap-3 animate-in fade-in-0 slide-in-from-right-4 duration-500">
    <div className="max-w-xs sm:max-w-md rounded-2xl rounded-tr-none bg-primary p-3 text-sm text-primary-foreground shadow-md">
      {content}
    </div>
    <Avatar className="h-9 w-9">
        <div className="flex h-full w-full items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <User className="h-5 w-5" />
        </div>
    </Avatar>
  </div>
)

const TypingIndicator = () => (
    <div className="flex items-start gap-3 animate-in fade-in-0 duration-500">
        <Avatar className="h-9 w-9 border-2 border-primary/50">
            <AvatarImage src="https://i.ibb.co/HLzTTrPk/Whats-App-Image-2025-06-24-at-20-28-17-0f216b7b.jpg" alt="Sangini Assistant" data-ai-hint="woman illustration"/>
            <AvatarFallback>S</AvatarFallback>
        </Avatar>
        <div className="max-w-xs sm:max-w-md rounded-2xl rounded-tl-none bg-card p-4 text-sm text-card-foreground shadow-md flex items-center gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:-0.3s]"></span>
            <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:-0.15s]"></span>
            <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground"></span>
        </div>
  </div>
)

export default function AiAssistantPage() {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm Sangini, your personal companion. How can I help you today? 😊" }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth'
    })
  }, [messages])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const history = messages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user' as 'user' | 'model',
          content: msg.content
      }))

      const response = await sanginiChat({ history, message: userMessage.content })
      
      const assistantMessage: Message = { role: 'assistant', content: response }
      setMessages(prev => [...prev, assistantMessage])

    } catch (error) {
      console.error("Error calling AI assistant:", error)
      toast({
        variant: 'destructive',
        title: 'Oh no!',
        description: 'Something went wrong while talking to Sangini. Please try again.'
      })
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-[#0f0f0f] text-[#f5f5f5]">
      <div className="flex flex-col items-center justify-center p-4 border-b border-[#ff4da6]/20 bg-black/20 shrink-0">
          <div className="relative">
             <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#ff4da6] to-purple-600 opacity-75 blur-md"></div>
             <Avatar className="relative h-20 w-20 border-2 border-[#ff4da6]/50">
                <AvatarImage src="https://i.ibb.co/HLzTTrPk/Whats-App-Image-2025-06-24-at-20-28-17-0f216b7b.jpg" alt="Sangini Assistant" data-ai-hint="woman illustration" />
                <AvatarFallback>S</AvatarFallback>
             </Avatar>
          </div>
          <h1 className="text-2xl font-bold mt-3 text-white">Sangini</h1>
          <p className="text-sm text-[#ff4da6]">Your Personal AI Companion</p>
      </div>
      
      <div ref={chatContainerRef} className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
        {messages.map((msg, index) => (
          msg.role === 'user'
            ? <UserMessage key={index} content={msg.content} />
            : <AssistantMessage key={index} content={msg.content} />
        ))}
        {isLoading && <TypingIndicator />}
      </div>

      <div className="border-t border-[#ff4da6]/20 p-4 shrink-0 bg-black/20">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <div className="relative w-full">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="rounded-full border-2 border-transparent bg-black py-6 pl-4 pr-14 text-white ring-offset-black transition-all focus-visible:border-[#ff4da6] focus-visible:ring-2 focus-visible:ring-[#ff4da6]/50"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#ff4da6] text-black transition-transform hover:scale-110 disabled:scale-100 disabled:bg-gray-500"
            >
              <SendHorizonal className="h-5 w-5" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
