import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { playNotification, playClick } from '../../utils/sound';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export const GeminiChat: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'model', text: 'Greetings. I am your CloudOS Assistant. How may I assist you today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    playClick('low'); // Send click

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: input,
      });
      
      const text = response.text;
      
      // Artificial delay for realism if response is too fast
      // But Gemini is fast, so let's just show it.
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: text || "I couldn't generate a response."
      }]);
      playNotification(); // Sound on arrival

    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Apologies, I encountered an issue connecting to the network."
      }]);
      playNotification();
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-slate-300 font-sans">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-[#0f0f0f]">
        <div className="p-1.5 bg-amber-500/10 rounded-lg">
           <Sparkles className="w-4 h-4 text-amber-500" />
        </div>
        <h2 className="font-serif text-lg text-slate-200 tracking-wide">AI Assistant</h2>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/5 shadow-lg ${
              msg.role === 'user' ? 'bg-amber-900/20 text-amber-500' : 'bg-[#151515] text-slate-400'
            }`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed border shadow-md ${
              msg.role === 'user' 
                ? 'bg-amber-600/10 border-amber-500/20 text-amber-100 rounded-tr-none' 
                : 'bg-[#151515] border-white/5 text-slate-300 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs ml-14 animate-pulse uppercase tracking-widest">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Processing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-5 bg-[#0a0a0a] border-t border-white/5">
        <div className="relative max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask anything..."
            className="w-full bg-[#111] border border-white/10 rounded-xl pl-5 pr-12 py-4 text-sm focus:outline-none focus:border-amber-500/50 focus:bg-[#151515] transition-all text-slate-200 placeholder-slate-600 shadow-inner"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-amber-600 hover:bg-amber-500 rounded-lg disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed transition-all text-white shadow-lg shadow-amber-900/20"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="text-center mt-3">
           <span className="text-[10px] text-slate-700 uppercase tracking-widest">Powered by Gemini 2.5 Flash</span>
        </div>
      </div>
    </div>
  );
};