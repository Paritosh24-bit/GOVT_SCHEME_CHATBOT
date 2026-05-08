/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import ChatSidebar from './components/ChatSidebar';
import ChatWindow from './components/ChatWindow';
import SchemeSuggestions from './components/SchemeSuggestions';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  messages: Message[];
}

interface DocumentChunk {
  text: string;
  embedding: number[];
}

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [vectorStore, setVectorStore] = useState<DocumentChunk[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');

  // Load sessions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('bharat_scheme_chats');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed);
      if (parsed.length > 0) setCurrentSessionId(parsed[0].id);
    }
    fetchSchemes();
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem('bharat_scheme_chats', JSON.stringify(sessions));
  }, [sessions]);

  const fetchSchemes = async () => {
    try {
      const res = await fetch('/api/schemes');
      const data = await res.json();
      setSchemes(data.schemes || []);
    } catch (e) {
      console.error('Failed to fetch schemes');
    }
  };

  const handleLoadData = async () => {
    setIsDataLoading(true);
    try {
      const res = await fetch('/api/load-data');
      const data = await res.json();
      if (res.ok && data.schemes) {
        setSchemes(data.schemes);
        
        // Create embeddings in frontend
        const chunks = data.schemes.map((s: any) => `${s.title}: ${s.description}`);
        const newStore: DocumentChunk[] = [];
        
        for (const chunk of chunks) {
          try {
            const result = await ai.models.embedContent({
              model: "text-embedding-004",
              contents: [{ parts: [{ text: chunk }] }],
            });
            const embedding = (result.embeddings as any).values as number[];
            newStore.push({ text: chunk, embedding });
          } catch (e) {
            console.error('Embedding error:', e);
          }
        }
        setVectorStore(newStore);
      }
    } catch (e) {
      console.error('Failed to load data');
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: 'New Conversation',
      lastMessage: 'No messages yet',
      messages: []
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newSession.id);
  };

  const handleDeleteChat = (id: string) => {
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (currentSessionId === id) {
      setCurrentSessionId(filtered.length > 0 ? filtered[0].id : null);
    }
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);

  const handleSendMessage = async (content: string) => {
    if (!currentSessionId) {
      // Create a session if none exists
      const newId = uuidv4();
      const newSession: ChatSession = {
        id: newId,
        title: content.slice(0, 30) + '...',
        lastMessage: content,
        messages: [{ role: 'user', content }]
      };
      setSessions([newSession]);
      setCurrentSessionId(newId);
      await callChatApi(content, []);
    } else {
      // Update existing session
      const updatedSessions = sessions.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: [...s.messages, { role: 'user', content } as Message],
            lastMessage: content,
            title: s.messages.length === 0 ? content.slice(0, 30) + '...' : s.title
          };
        }
        return s;
      });
      setSessions(updatedSessions);
      await callChatApi(content, currentSession?.messages || []);
    }
  };

  const cosineSimilarity = (a: number[], b: number[]) => {
    let dotProduct = 0;
    let mA = 0;
    let mB = 0;
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      mA += a[i] * a[i];
      mB += b[i] * b[i];
    }
    return dotProduct / (Math.sqrt(mA) * Math.sqrt(mB));
  };

  const callChatApi = async (message: string, history: Message[]) => {
    setIsLoading(true);
    setStreamingMessage('');

    try {
      // 1. Retrieval in frontend
      let context = '';
      if (vectorStore.length > 0) {
        const queryResult = await ai.models.embedContent({
          model: "text-embedding-004",
          contents: [{ parts: [{ text: message }] }],
        });
        const queryEmbedding = (queryResult.embeddings as any).values as number[];
        
        const scored = vectorStore
          .map(doc => ({
            ...doc,
            score: cosineSimilarity(queryEmbedding, doc.embedding)
          }))
          .sort((a, b) => b.score - a.score);
          
        context = scored.slice(0, 3).map(c => c.text).join("\n\n");
      }

      // 2. Call Gemini directly
      const systemPrompt = `You are BharatScheme AI, an assistant for Indian government schemes. 
      Use the following context to answer the user's question. 
      If the context doesn't contain the answer, use your general knowledge but mention it's from general knowledge.
      Keep answers concise and helpful.
      
      Context:
      ${context || 'No specific context found.'}`;

      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: systemPrompt,
        }
      });

      const stream = await chat.sendMessageStream({ message });
      let accumulatedResponse = '';

      for await (const chunk of stream) {
        const token = chunk.text;
        if (token) {
          accumulatedResponse += token;
          setStreamingMessage(accumulatedResponse);
        }
      }

      // Finalize message
      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: [...s.messages, { role: 'assistant', content: accumulatedResponse } as Message],
            lastMessage: accumulatedResponse.slice(0, 50) + '...'
          };
        }
        return s;
      }));
      setStreamingMessage('');
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-100 selection:text-zinc-950">
      <ChatSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={handleNewChat}
        onSelectChat={setCurrentSessionId}
        onDeleteChat={handleDeleteChat}
      />
      
      <main className="flex-1 flex flex-col min-w-0">
        <ChatWindow
          messages={currentSession?.messages || []}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          streamingMessage={streamingMessage}
        />
      </main>

      <SchemeSuggestions
        schemes={schemes.map(s => s.title)}
        onSelect={(scheme) => handleSendMessage(`Tell me about ${scheme}`)}
        onLoadData={handleLoadData}
        isDataLoading={isDataLoading}
      />
    </div>
  );
}

