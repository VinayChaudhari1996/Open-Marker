
import React, { useRef, useEffect, useState } from 'react';
import { 
  Bot,
  PanelLeftClose,
  Plus,
  MessageSquare,
  Highlighter, 
  Sun,
  Moon,
  History,
  Trash2,
  ChevronRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Sender, ChatMessage, SavedSession } from '../types';

interface SidebarProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (v: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;
  messages: ChatMessage[];
  inputValue: string;
  setInputValue: (v: string) => void;
  sendMessage: (msg: string) => void;
  isLoading: boolean;
  agentStatus: string;
  
  // Session Props
  onNewCanvas: () => void;
  savedSessions: SavedSession[];
  currentSessionId: string;
  onLoadSession: (session: SavedSession) => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isDarkMode,
  setIsDarkMode,
  messages,
  inputValue,
  setInputValue,
  sendMessage,
  isLoading,
  agentStatus,
  onNewCanvas,
  savedSessions,
  currentSessionId,
  onLoadSession,
  onDeleteSession
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, activeTab]);

  return (
    <aside className={`
        flex flex-col 
        bg-white dark:bg-[#181818] 
        z-20 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden
        ${isSidebarCollapsed ? 'w-0 border-none' : 'w-[380px] border-r border-zinc-200 dark:border-zinc-800'}
    `}>
        <div className="w-[380px] flex flex-col h-full shrink-0">
            {/* HEADER */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-100 dark:border-zinc-800/50 shrink-0">
               <div className="flex items-center gap-3">
                   <div className="w-9 h-9 bg-yellow-100 dark:bg-yellow-500/20 rounded-xl flex items-center justify-center shadow-sm border border-yellow-200 dark:border-yellow-500/30 text-yellow-700 dark:text-yellow-400">
                     <Highlighter size={18} strokeWidth={2.5} />
                   </div>
                   <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-50 font-display">
                       Open Marker
                   </span>
               </div>
               
               <div className="flex items-center gap-1">
                   <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                       {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                   </button>
                   <button onClick={() => setIsSidebarCollapsed(true)} className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                       <PanelLeftClose size={20} />
                   </button>
               </div>
            </div>

            {/* ACTION BUTTONS & TABS */}
            <div className="px-5 pt-5 pb-2 shrink-0 space-y-3">
                <button onClick={onNewCanvas} className="w-full h-10 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:translate-y-[-1px] active:translate-y-[1px] transition-all">
                    <Plus size={16} strokeWidth={2.5}/> New Canvas
                </button>

                <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg">
                    <button 
                      onClick={() => setActiveTab('chat')}
                      className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'chat' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                      <MessageSquare size={14} /> Current Chat
                    </button>
                    <button 
                      onClick={() => setActiveTab('history')}
                      className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'history' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                      <History size={14} /> History
                    </button>
                </div>
            </div>

            {/* SCROLLABLE CONTENT AREA */}
            <div className="flex-grow overflow-y-auto px-5 py-2" ref={scrollRef}>
                
                {/* CHAT VIEW */}
                {activeTab === 'chat' && (
                  <div className="space-y-6 py-2">
                      {messages.map((msg) => (
                          <div key={msg.id} className={`flex flex-col ${msg.sender === Sender.USER ? 'items-end' : 'items-start'}`}>
                              <div className={`relative px-4 py-3 max-w-[95%] text-sm leading-relaxed ${msg.sender === Sender.USER ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-2xl rounded-tr-md' : 'text-zinc-600 dark:text-zinc-300 pl-0'}`}>
                                  {msg.sender === Sender.AI && (
                                      <div className="flex items-center gap-2 mb-2">
                                          <div className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                              <Bot size={12} />
                                          </div>
                                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Agent</span>
                                      </div>
                                  )}
                                  <div className="prose prose-sm prose-zinc dark:prose-invert max-w-none break-words">
                                      <ReactMarkdown>{msg.text.split("```json")[0]}</ReactMarkdown>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
                )}

                {/* HISTORY VIEW */}
                {activeTab === 'history' && (
                  <div className="space-y-2 py-2">
                    {savedSessions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-40 text-zinc-400 text-sm">
                        <History size={24} className="mb-2 opacity-50"/>
                        <p>No saved diagrams yet.</p>
                      </div>
                    ) : (
                      savedSessions.map((session) => (
                        <div 
                          key={session.id}
                          onClick={() => onLoadSession(session)}
                          className={`
                            group flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all
                            ${session.id === currentSessionId 
                              ? 'bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700' 
                              : 'bg-transparent border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:border-zinc-100 dark:hover:border-zinc-800'}
                          `}
                        >
                          <div className="flex flex-col min-w-0">
                            <h4 className={`text-sm font-semibold truncate ${session.id === currentSessionId ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-700 dark:text-zinc-300'}`}>
                              {session.name}
                            </h4>
                            <span className="text-[10px] text-zinc-400">
                              {new Date(session.updatedAt).toLocaleDateString()} • {session.nodes.length} nodes
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {session.id === currentSessionId && (
                              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                            )}
                            <button 
                              onClick={(e) => onDeleteSession(session.id, e)}
                              className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                              title="Delete Session"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
            </div>

            {/* INPUT AREA (Only visible in Chat Tab) */}
            {activeTab === 'chat' && (
              <div className="p-5 bg-white dark:bg-[#181818] shrink-0 border-t border-zinc-100 dark:border-zinc-800/50">
                  <div className="relative">
                      <input 
                          className="w-full pl-4 pr-12 py-3.5 bg-zinc-50 dark:bg-[#212121] border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900/5 dark:focus:ring-zinc-100/10 outline-none transition-all placeholder:text-zinc-400" 
                          placeholder="Describe anything to diagram..." 
                          value={inputValue} 
                          onChange={e => setInputValue(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(inputValue)}
                      />
                      <button 
                          onClick={() => sendMessage(inputValue)} 
                          disabled={isLoading || !inputValue.trim()} 
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-black rounded-lg disabled:opacity-30 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                      >
                          <Plus size={16} strokeWidth={2.5} />
                      </button>
                  </div>
                  <div className="h-6 mt-2 flex items-center justify-center text-[10px] font-medium text-zinc-400">
                      {agentStatus && <span className="flex items-center gap-1.5 animate-pulse"><span className="h-1.5 w-1.5 bg-indigo-500 rounded-full"></span>{agentStatus}</span>}
                  </div>
              </div>
            )}
        </div>
    </aside>
  );
};

export default Sidebar;
