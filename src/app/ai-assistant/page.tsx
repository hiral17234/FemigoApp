"use client";

import { useState, useRef, useEffect, FormEvent } from 'react';
import Image from 'next/image';
import { SendHorizontal, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { askSangini } from '@/ai/flows/sangini-chat-flow';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to the bottom of the chat
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Initial greeting from Sangini
  useEffect(() => {
    setMessages([
        { role: 'assistant', content: "Hi there! I'm Sangini, your personal safety companion. How can I help you today?" }
    ]);
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Format history for the AI flow (user/model roles)
      const history = messages.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          content: msg.content
      }));

      const aiResponseContent = await askSangini({ history, prompt: userMessage.content });

      const aiMessage: Message = { role: 'assistant', content: aiResponseContent };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error("Error calling Sangini:", error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm having a little trouble connecting right now. Please try again in a moment.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#121212] text-[#f5f5f5]">
      {/* Header with AI Avatar */}
      <header className="flex flex-col items-center justify-center p-4 pt-6 shrink-0">
        <div className="relative">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#ff69b4] to-purple-600 opacity-75 blur-md animate-pulse"></div>
          <Image
            src="https://i.ibb.co/GfjHvTsR/Whats-App-Image-2025-06-24-at-20-28-17-60edfed4.jpg"
            data-ai-hint="woman face"
            alt="Sangini AI Assistant"
            width={80}
            height={80}
            className="relative rounded-full border-2 border-white/30"
          />
        </div>
        <h1 className="mt-4 text-2xl font-bold flex items-center gap-2">
          Sangini <Sparkles className="text-[#ff69b4] h-5 w-5" />
        </h1>
      </header>

      {/* Chat History */}
      <div ref={chatContainerRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex items-end gap-2",
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                "max-w-xs md:max-w-md lg:max-w-lg rounded-2xl px-4 py-2 text-white",
                message.role === 'user'
                  ? 'bg-gradient-to-br from-[#ff69b4] to-[#c4328b]'
                  : 'bg-gray-800'
              )}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex items-end gap-2 justify-start">
                <div className="bg-gray-800 rounded-2xl px-4 py-3 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                </div>
            </div>
        )}
      </div>

      {/* Message Input Form */}
      <footer className="shrink-0 border-t border-white/10 p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative w-full">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about safety..."
              className="h-12 w-full rounded-full border-gray-700 bg-gray-800 pl-4 pr-14 text-white placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-[#ff69b4]"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-gradient-to-r from-[#ff69b4] to-[#c4328b] text-white transition-transform hover:scale-110 disabled:bg-gray-600"
              disabled={isLoading || !input.trim()}
            >
              <SendHorizontal className="h-5 w-5" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </form>
      </footer>
    </div>
  );
}
