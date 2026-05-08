import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  streamingMessage: string;
}

export default function ChatWindow({
  messages,
  onSendMessage,
  isLoading,
  streamingMessage
}: ChatWindowProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-900">
      {/* Header */}
      <header className="h-16 border-bottom border-zinc-800 flex items-center px-6 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
            <Sparkles size={18} className="text-zinc-950" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-100">BharatScheme AI</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Government Assistant</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {messages.length === 0 && !streamingMessage && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mb-2">
              <Bot size={32} className="text-zinc-400" />
            </div>
            <h2 className="text-xl font-medium text-zinc-200">How can I help you today?</h2>
            <p className="text-sm text-zinc-500 max-w-md">
              Ask me about PM Kisan, Ayushman Bharat, or any other Indian government schemes.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i}
            className={cn(
              "flex gap-4 max-w-3xl mx-auto",
              msg.role === 'user' ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              msg.role === 'user' ? "bg-zinc-100 text-zinc-950" : "bg-zinc-800 text-zinc-400"
            )}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={cn(
              "flex flex-col gap-1",
              msg.role === 'user' ? "items-end" : "items-start"
            )}>
              <div className={cn(
                "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-zinc-100 text-zinc-950 font-medium" 
                  : "bg-zinc-800 text-zinc-200"
              )}>
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {streamingMessage && (
          <div className="flex gap-4 max-w-3xl mx-auto">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400 flex items-center justify-center shrink-0">
              <Bot size={16} />
            </div>
            <div className="bg-zinc-800 text-zinc-200 px-4 py-3 rounded-2xl text-sm leading-relaxed">
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{streamingMessage}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {isLoading && !streamingMessage && (
          <div className="flex gap-4 max-w-3xl mx-auto">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400 flex items-center justify-center shrink-0">
              <Bot size={16} />
            </div>
            <div className="bg-zinc-800 text-zinc-400 px-4 py-3 rounded-2xl flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-xs font-medium">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 bg-zinc-900">
        <form 
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto relative group"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a government scheme..."
            className="w-full bg-zinc-800 text-zinc-100 pl-6 pr-14 py-4 rounded-2xl border border-zinc-700 focus:border-zinc-500 focus:outline-none transition-all placeholder:text-zinc-600"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-zinc-100 text-zinc-950 rounded-xl flex items-center justify-center hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-90"
          >
            <Send size={18} />
          </button>
        </form>
        <p className="text-[10px] text-center text-zinc-600 mt-4 uppercase tracking-widest font-bold">
          Data sourced from india.gov.in • AI can make mistakes
        </p>
      </div>
    </div>
  );
}
