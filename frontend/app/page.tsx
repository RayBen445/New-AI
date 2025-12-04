'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!inputValue.trim()) return;

    const userMessage: Message = { role: 'user', content: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      const data = await response.json();
      // Expecting backend to return { generated_text: string } or similar
      // The backend code I wrote returns { generated_text: "..." }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.generated_text || "No response received."
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again later."
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col h-screen bg-neutral-900 text-gray-100">
      <header className="p-4 border-b border-neutral-800 flex items-center gap-3 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Bot size={24} className="text-white" />
        </div>
        <h1 className="font-bold text-xl tracking-tight">Cool Shot AI</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-neutral-500 space-y-4">
            <Bot size={48} className="opacity-20" />
            <p className="text-lg">Start a conversation with Cool Shot AI</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex w-full ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`flex max-w-[80%] md:max-w-[70%] rounded-2xl p-4 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-neutral-800 text-gray-100 rounded-tl-none border border-neutral-700'
              }`}
            >
              <div className="flex gap-3">
                 <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-700' : 'bg-neutral-700'}`}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                 </div>
                 <div className="leading-relaxed whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex w-full justify-start">
            <div className="bg-neutral-800 rounded-2xl rounded-tl-none p-4 border border-neutral-700 flex items-center gap-2">
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
               <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-neutral-800 bg-neutral-900">
        <form
          onSubmit={handleSendMessage}
          className="max-w-4xl mx-auto relative flex items-center"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="w-full bg-neutral-800 text-white placeholder-neutral-500 rounded-full py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all border border-neutral-700"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </main>
  );
}
