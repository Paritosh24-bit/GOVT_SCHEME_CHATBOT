import React from 'react';
import { Plus, MessageSquare, Trash2, Search } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
}

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
}

export default function ChatSidebar({
  sessions,
  currentSessionId,
  onNewChat,
  onSelectChat,
  onDeleteChat
}: ChatSidebarProps) {
  return (
    <div className="w-80 h-full bg-zinc-950 border-r border-zinc-800 flex flex-col">
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-100 hover:bg-white text-zinc-950 rounded-xl font-medium transition-all active:scale-95"
        >
          <Plus size={18} />
          <span>New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {sessions.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 text-sm">
            No chats yet. Start a new one!
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => onSelectChat(session.id)}
              className={cn(
                "group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
                currentSessionId === session.id 
                  ? "bg-zinc-800 text-white" 
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              )}
            >
              <MessageSquare size={18} className="shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{session.title}</p>
                <p className="text-xs opacity-50 truncate">{session.lastMessage}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(session.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-zinc-700 rounded-lg transition-all text-zinc-500 hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
            PB
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-200 truncate">Paritosh Badave</p>
            <p className="text-xs text-zinc-500 truncate">paritoshbadave@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
