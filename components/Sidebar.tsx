
import React, { useRef, useEffect } from 'react';
import { 
  Bot,
  PanelLeftClose,
  Plus,
  History,
  MessageSquare,
  Highlighter, 
  Sun,
  Moon
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Sender, ChatMessage } from '../types';
import { ThreadMetadata } from '../mastra/memory';

interface SidebarProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (v: boolean) => void;
  resetChat: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;
  sidebarView: 'chat' | 'history';
  setSidebarView: (v: 'chat' | 'history') => void;
  messages: ChatMessage[];
  sessions: ThreadMetadata[];
  loadSession: (id: string) => void;
  inputValue: string;
  setInputValue: (v: string) => void;
  sendMessage: (msg: string) => void;
  isLoading: boolean;
  agentStatus: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  resetChat,
  isDarkMode,
  setIsDarkMode,
  sidebarView,
  setSidebarView,
  messages,
  sessions,
  loadSession,
  inputValue,
  setInputValue,
  sendMessage,
  isLoading,
  agentStatus
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Handlers for switching views to ensure smooth transition
  const handleViewSwitch = (view: 'chat' | 'history') => {
      setSidebarView(view);
  };

  return (
    <aside className={`
        flex flex-col 
        bg-white dark:bg-[#181818] 
        z-20 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] overflow-hidden
        ${isSidebarCollapsed ? 'w-0 border-none' : 'w-[380px] border-r border-zinc-200 dark:border-zinc-800'}
    `}>
        {/* INNER CONTAINER (Prevents layout shift during collapse) */}
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
                   <button 
                       onClick={() => setIsDarkMode(!isDarkMode)} 
                       className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                   >
                       {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                   </button>
                   <button 
                       onClick={() => setIsSidebarCollapsed(true)} 
                       className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                   >
                       <PanelLeftClose size={20} />
                   </button>
               </div>
            </div>

            {/* CONTROLS AREA */}
            <div className="px-5 pt-5 pb-2 space-y-3 shrink-0">
                {/* Primary Action */}
                <button 
                    onClick={resetChat} 
                    className="w-full h-10 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:translate-y-[-1px] active:translate-y-[1px] transition-all"
                >
                    <Plus size={16} strokeWidth={2.5}/> New Diagram
                </button>

                {/* Segmented Control */}
                <div className="bg-zinc-100 dark:bg-zinc-800/60 p-1 rounded-xl flex relative">
                    <button 
                        onClick={() => handleViewSwitch('chat')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                            sidebarView === 'chat' 
                            ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm' 
                            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                        }`}
                    >
                        <MessageSquare size={14} /> Chat
                    </button>
                    <button 
                        onClick={() => handleViewSwitch('history')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                            sidebarView === 'history' 
                            ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm' 
                            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                        }`}
                    >
                        <History size={14} /> History
                    </button>
                </div>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div className="flex-grow overflow-y-auto px-5 py-2 scroll-smooth" ref={scrollRef}>
                {sidebarView === 'chat' ? (
                    <div className="space-y-6 py-2">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex flex-col ${msg.sender === Sender.USER ? 'items-end' : 'items-start'}`}>
                                <div className={`
                                    relative px-4 py-3 max-w-[95%] text-sm leading-relaxed
                                    ${msg.sender === Sender.USER 
                                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-2xl rounded-tr-md' 
                                        : 'text-zinc-600 dark:text-zinc-300 pl-0'
                                    }
                                `}>
                                    {msg.sender === Sender.AI && (
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                                <Bot size={12} />
                                            </div>
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Assistant</span>
                                        </div>
                                    )}
                                    
                                    <div className="prose prose-sm prose-zinc dark:prose-invert max-w-none break-words">
                                        <ReactMarkdown>{msg.text.split("```json")[0]}</ReactMarkdown>
                                    </div>
                                    
                                    {msg.isStreaming && (
                                        <div className="flex gap-1 mt-2 h-1.5 items-center">
                                            <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce"></span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2 py-2">
                        {sessions.map(s => (
                            <button 
                                key={s.id} 
                                onClick={() => loadSession(s.id)} 
                                className="w-full text-left p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700/50 rounded-xl transition-all group"
                            >
                                <div className="font-semibold text-sm text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white truncate mb-0.5">
                                    {s.title}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-zinc-400 group-hover:text-zinc-500">
                                    <History size={10} />
                                    {new Date(s.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* FOOTER INPUT */}
            {sidebarView === 'chat' && (
                <div className="p-5 bg-gradient-to-t from-white via-white to-transparent dark:from-[#181818] dark:via-[#181818] shrink-0">
                    <div className="relative group">
                        <input 
                            className="w-full pl-4 pr-12 py-3.5 bg-white dark:bg-[#212121] border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-zinc-900/5 dark:focus:ring-zinc-100/10 focus:border-zinc-300 dark:focus:border-zinc-600 outline-none transition-all placeholder:text-zinc-400" 
                            placeholder="Describe a system..." 
                            value={inputValue} 
                            onChange={e => setInputValue(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(inputValue)}
                        />
                        <button 
                            onClick={() => sendMessage(inputValue)} 
                            disabled={isLoading || !inputValue.trim()} 
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-black rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                        >
                            <Plus size={16} strokeWidth={2.5} className="rotate-0" />
                        </button>
                    </div>
                    <div className="h-5 mt-2 flex items-center justify-center">
                        {agentStatus && (
                            <span className="text-[10px] font-medium text-zinc-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-1 duration-300">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                </span>
                                {agentStatus}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    </aside>
  );
};

export default Sidebar;
