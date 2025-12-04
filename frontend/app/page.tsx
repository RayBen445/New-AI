'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Plus, Image as ImageIcon } from 'lucide-react';

type Message = { role: 'user' | 'ai'; content: string; isImage?: boolean; };

export default function CoolShotChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (txt?: string) => {
    const text = txt || input;
    if (!text.trim()) return;
    setInput('');
    setMessages(p => [...p, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();

      if (data.is_image_metadata) {
         setMessages(p => [...p, { role: 'ai', content: data.reply.replace("IMAGE_READY:", ""), isImage: true }]);
      } else {
         setMessages(p => [...p, { role: 'ai', content: data.reply }]);
      }
    } catch (e) {
      setMessages(p => [...p, { role: 'ai', content: "Error connecting to AI." }]);
    }
    setLoading(false);
  };

  return (
    <main className="flex flex-col h-screen font-sans">
      {/* Top Bar */}
      <div className="p-4 flex justify-between sticky top-0 z-10 bg-slate-950/80 backdrop-blur">
        <span className="font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Cool Shot AI</span>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 space-y-6 pb-32">
            {messages.length === 0 && (
                <div className="text-center mt-20 space-y-4">
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl mx-auto flex items-center justify-center"><Sparkles /></div>
                    <h2 className="text-2xl font-bold">How can I help you?</h2>
                    <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                        <button onClick={() => sendMessage("Generate a neon city")} className="p-3 bg-slate-900 rounded-lg hover:bg-slate-800 text-sm">Draw a neon city</button>
                        <button onClick={() => sendMessage("Tell me a joke")} className="p-3 bg-slate-900 rounded-lg hover:bg-slate-800 text-sm">Tell me a joke</button>
                    </div>
                </div>
            )}
            {messages.map((m, i) => (
                <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : ''}`}>
                    {m.role === 'ai' && <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0"><Sparkles size={16} /></div>}
                    <div className={`max-w-[85%] p-4 rounded-2xl ${m.role === 'user' ? 'bg-slate-800 rounded-tr-sm' : 'bg-transparent'}`}>
                        {m.isImage ? (
                            <div className="space-y-2">
                                <div className="aspect-square bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center"><ImageIcon size={40} className="text-slate-700"/></div>
                                <p className="text-xs text-green-400">✅ Generated: {m.content}</p>
                            </div>
                        ) : ( <p className="leading-relaxed">{m.content}</p> )}
                    </div>
                </div>
            ))}
            {loading && <div className="ml-12 text-slate-500 text-sm animate-pulse">Thinking...</div>}
            <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-950">
        <div className="max-w-3xl mx-auto relative">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Message Cool Shot..." className="w-full bg-slate-900 border border-slate-800 rounded-full py-4 pl-6 pr-14 focus:outline-none focus:border-slate-700 shadow-xl" disabled={loading}/>
            <button onClick={() => sendMessage()} disabled={loading} className="absolute right-2 top-2 p-2 bg-slate-100 text-slate-900 rounded-full hover:bg-white transition"><Send size={18}/></button>
        </div>
      </div>
    </main>
  );
}
