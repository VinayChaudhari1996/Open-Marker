

import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactFlow, {
  Controls,
  Edge,
  Node as FlowNode,
  useNodesState,
  useEdgesState,
  Panel,
  ReactFlowInstance,
  getRectOfNodes
} from 'reactflow';
import { Layout, Zap, PanelLeftOpen } from 'lucide-react';
import { toPng } from 'html-to-image';
import { Sender, ChatMessage, SessionContext, SavedSession, ReactFlowNode, ReactFlowEdge } from './types';
import { streamAgentResponse } from './services/flowService';
import { transformDataToFlow } from './lib/graphUtils';
import { extractPartialGraphFromText } from './lib/parsing';
import { getStoredSessions, saveSessionToStorage, deleteSessionFromStorage } from './lib/storage';
import CustomNode from './components/CustomNode';
import EditModal from './components/EditModal';
import Sidebar from './components/Sidebar';
import DrawingCursor from './components/DrawingCursor';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "./components/ui/context-menu";

const nodeTypes = { custom: CustomNode };

const App: React.FC = () => {
  // Session State
  const [sessionId, setSessionId] = useState<string>(Date.now().toString());
  const [sessionName, setSessionName] = useState<string>("Untitled Canvas");
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: Sender.AI, text: "Welcome to Open Marker. Describe your system architecture and I'll sketch a professional horizontal blueprint." }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agentStatus, setAgentStatus] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const [pencilPos, setPencilPos] = useState({ x: 0, y: 0, visible: false, label: '' });
  const [drawingQueue, setDrawingQueue] = useState<any[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [editingNode, setEditingNode] = useState<FlowNode | null>(null);
  const [editForm, setEditForm] = useState({ label: '', description: '', icon: '' });

  const lastIds = useRef({ nodes: new Set<string>(), edges: new Set<string>() });
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) setIsDarkMode(true);
    // Load initial sessions list
    setSavedSessions(getStoredSessions());
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // Auto-save Logic
  useEffect(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(() => {
      // Don't save if it's the initial empty state
      if (nodes.length === 0 && messages.length <= 1) return;

      const currentSession: SavedSession = {
        id: sessionId,
        name: sessionName,
        updatedAt: Date.now(),
        nodes: nodes as unknown as ReactFlowNode[],
        edges: edges as unknown as ReactFlowEdge[],
        messages
      };
      
      saveSessionToStorage(currentSession);
      setSavedSessions(getStoredSessions());
    }, 1000); // Debounce 1s

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [nodes, edges, messages, sessionId, sessionName]);

  // Derive session name from first user message if still untitled
  useEffect(() => {
    if (sessionName === "Untitled Canvas") {
      const firstUserMsg = messages.find(m => m.sender === Sender.USER);
      if (firstUserMsg) {
        const newName = firstUserMsg.text.slice(0, 30) + (firstUserMsg.text.length > 30 ? "..." : "");
        setSessionName(newName);
      }
    }
  }, [messages, sessionName]);

  useEffect(() => {
    if (drawingQueue.length > 0 && !isAnimating) processQueue();
  }, [drawingQueue, isAnimating]);

  const processQueue = async () => {
    setIsAnimating(true);
    const item = drawingQueue[0];
    const isNode = !item.source;

    if (isNode) {
      setPencilPos({ x: item.position.x + 110, y: item.position.y + 70, visible: true, label: item.data.label });
      setNodes(nds => [...nds, { ...item, data: { ...item.data, isDrawing: true } }]);
      await new Promise(r => setTimeout(r, 800));
      setNodes(nds => nds.map(n => n.id === item.id ? { ...n, data: { ...n.data, isDrawing: false } } : n));
    } else {
      const source = nodes.find(n => n.id === item.source);
      const target = nodes.find(n => n.id === item.target);
      if (source && target) {
        setPencilPos({ x: source.position.x + 220, y: source.position.y + 70, visible: true, label: 'Linking' });
        await new Promise(r => setTimeout(r, 400));
        setPencilPos({ x: target.position.x, y: target.position.y + 70, visible: true, label: 'Linking' });
        setEdges(eds => [...eds, item]);
        await new Promise(r => setTimeout(r, 600));
      }
    }

    setDrawingQueue(prev => prev.slice(1));
    setIsAnimating(false);
    if (drawingQueue.length === 1) setTimeout(() => setPencilPos(p => ({ ...p, visible: false })), 1000);
  };

  const handleNewCanvas = () => {
    // 1. Force save current before switching
    if (nodes.length > 0) {
      const currentSession: SavedSession = {
        id: sessionId,
        name: sessionName,
        updatedAt: Date.now(),
        nodes: nodes as unknown as ReactFlowNode[],
        edges: edges as unknown as ReactFlowEdge[],
        messages
      };
      saveSessionToStorage(currentSession);
    }

    // 2. Reset State
    setNodes([]);
    setEdges([]);
    setMessages([{ id: '1', sender: Sender.AI, text: "Welcome to Open Marker. Describe your system architecture and I'll sketch a professional horizontal blueprint." }]);
    setSessionId(Date.now().toString());
    setSessionName("Untitled Canvas");
    lastIds.current = { nodes: new Set(), edges: new Set() };
    
    // 3. Refresh List
    setSavedSessions(getStoredSessions());
  };

  const handleLoadSession = (session: SavedSession) => {
    // Save current if needed
    if (nodes.length > 0) {
      saveSessionToStorage({
        id: sessionId,
        name: sessionName,
        updatedAt: Date.now(),
        nodes: nodes as unknown as ReactFlowNode[],
        edges: edges as unknown as ReactFlowEdge[],
        messages
      });
    }

    setSessionId(session.id);
    setSessionName(session.name);
    // @ts-ignore - ReactFlowNode structure is compatible with Node but TS might be strict
    setNodes(session.nodes);
    // @ts-ignore
    setEdges(session.edges);
    setMessages(session.messages);
    lastIds.current = { 
      nodes: new Set(session.nodes.map(n => n.id)), 
      edges: new Set(session.edges.map(e => e.id)) 
    };
    
    setSavedSessions(getStoredSessions()); // Refresh order
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteSessionFromStorage(id);
    setSavedSessions(updated);
    
    // If deleting current session, reset to new
    if (id === sessionId) {
      handleNewCanvas();
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: Sender.USER, text }]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      const stream = streamAgentResponse(text, { 
        nodes: nodes as unknown as ReactFlowNode[], 
        edges: edges as unknown as ReactFlowEdge[], 
        diagram_type: 'architecture' 
      });
      let acc = "";
      for await (const chunk of stream) {
        if (chunk.fullText) {
          acc = chunk.fullText;
          const graph = extractPartialGraphFromText(acc);
          if (graph) {
            const flow = transformDataToFlow(graph, isDarkMode);
            // Update shifted positions
            setNodes(nds => nds.map(ex => {
              const up = flow.nodes.find(n => n.id === ex.id);
              return up ? { ...ex, position: up.position } : ex;
            }));
            // Queue new items
            const newNodes = flow.nodes.filter(n => !lastIds.current.nodes.has(n.id));
            const newEdges = flow.edges.filter(e => !lastIds.current.edges.has(e.id));
            if (newNodes.length || newEdges.length) {
              newNodes.forEach(n => lastIds.current.nodes.add(n.id));
              newEdges.forEach(e => lastIds.current.edges.add(e.id));
              setDrawingQueue(prev => [...prev, ...newNodes, ...newEdges]);
            }
          }
        }
      }
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: Sender.AI, text: "Blueprint completed." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyAsPng = async () => {
    const el = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (el) {
      const dataUrl = await toPng(el, { backgroundColor: isDarkMode ? '#18181b' : '#ffffff' });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white dark:bg-zinc-950 font-sans overflow-hidden">
      <Sidebar 
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        messages={messages}
        inputValue={inputValue}
        setInputValue={setInputValue}
        sendMessage={sendMessage}
        isLoading={isLoading}
        agentStatus={agentStatus}
        // Session Props
        onNewCanvas={handleNewCanvas}
        savedSessions={savedSessions}
        currentSessionId={sessionId}
        onLoadSession={handleLoadSession}
        onDeleteSession={handleDeleteSession}
      />
      <main className="flex-grow relative">
        {/* Toggle Button for Sidebar - Visible only when collapsed */}
        {isSidebarCollapsed && (
          <button 
            onClick={() => setIsSidebarCollapsed(false)}
            className="absolute top-5 left-5 z-20 p-2.5 bg-white dark:bg-[#181818] border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl shadow-sm hover:shadow-md hover:hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-200"
            aria-label="Expand Sidebar"
          >
            <PanelLeftOpen size={20} />
          </button>
        )}
        
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-10 pointer-events-none dotted-grid" />
        <ContextMenu>
          <ContextMenuTrigger className="w-full h-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              onInit={setRfInstance}
              onNodeDoubleClick={(e, n) => { setEditingNode(n); setEditForm({ label: n.data.label, description: n.data.description, icon: n.data.icon }); }}
              fitView
            >
              <DrawingCursor x={pencilPos.x} y={pencilPos.y} isVisible={pencilPos.visible} label={pencilPos.label} />
              <Controls className="!bg-white dark:!bg-zinc-900 !border-zinc-200 dark:!border-zinc-800" />
              <Panel position="top-right" className="m-6">
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                    {isAnimating ? <Zap size={14} className="text-yellow-500 animate-pulse" /> : <Layout size={14} />}
                    {isAnimating ? 'Drafting' : 'Blueprint Mode'}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-medium px-2">
                      {sessionName}
                  </div>
                </div>
              </Panel>
            </ReactFlow>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-56">
            <ContextMenuItem onSelect={copyAsPng}>Export to Clipboard (PNG)</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        {editingNode && (
          <EditModal 
            editingNode={editingNode} editingEdge={null} editForm={editForm} editEdgeLabel=""
            onClose={() => setEditingNode(null)}
            setEditForm={setEditForm}
            onSave={() => { setNodes(nds => nds.map(n => n.id === editingNode.id ? { ...n, data: { ...n.data, ...editForm } } : n)); setEditingNode(null); }}
            setEditEdgeLabel={() => {}}
          />
        )}
      </main>
    </div>
  );
};

export default App;