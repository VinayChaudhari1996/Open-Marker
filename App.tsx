
import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Edge,
  Node as FlowNode,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
  ReactFlowInstance,
  getRectOfNodes,
  getTransformForBounds
} from 'reactflow';
import { 
  Route,
  CornerDownRight,
  Minus,
  Waves,
  ChevronDown,
  Type,
  Highlighter,
  PanelLeftOpen,
  Plus,
  Copy,
  Check
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { Sender, ChatMessage } from './types';
import { streamAgentResponse, getSessions, getSessionMessages, generateIconMapping } from './services/flowService';
import { extractPartialGraphFromText, parseGraphFromText } from './lib/parsing';
import { transformDataToFlow } from './lib/graphUtils';
import CustomNode from './components/CustomNode';
import NoteNode from './components/NoteNode';
import EditModal from './components/EditModal';
import Sidebar from './components/Sidebar';
import { ThreadMetadata } from './mastra/memory';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./components/ui/context-menu";

const nodeTypes = { custom: CustomNode, note: NoteNode };

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([{
        id: '1', sender: Sender.AI, text: "Hi! I'm Open Marker. Describe a system, and I'll diagram it."
  }]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agentStatus, setAgentStatus] = useState<string>("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [edgeType, setEdgeType] = useState('smoothstep');
  const [isEdgeTypeOpen, setIsEdgeTypeOpen] = useState(false);
  const [sidebarView, setSidebarView] = useState<'chat' | 'history'>('chat');
  const [sessions, setSessions] = useState<ThreadMetadata[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [isCopying, setIsCopying] = useState(false);

  // Edit Node State
  const [editingNode, setEditingNode] = useState<FlowNode | null>(null);
  const [editForm, setEditForm] = useState({ 
      label: '', 
      description: '', 
      type: 'service', 
      icon: '',
      color: 'black' as 'black' | 'blue' | 'red'
  });

  // Edit Edge State
  const [editingEdge, setEditingEdge] = useState<Edge | null>(null);
  const [editEdgeLabel, setEditEdgeLabel] = useState('');
  
  const threadIdRef = useRef<string>(Date.now().toString());
  const edgeTypeRef = useRef('smoothstep');
  const isDarkModeRef = useRef(false);
  const lastLayoutTime = useRef<number>(0);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Theme Init
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setIsDarkMode(true);
    }
  }, []);

  // Theme Toggle Effect
  useEffect(() => {
    isDarkModeRef.current = isDarkMode;
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    
    // Refresh edges color immediately
    const newBgColor = isDarkMode ? '#212121' : '#FFFFFF';
    
    setEdges(eds => eds.map(e => ({
        ...e,
        style: { ...e.style, stroke: isDarkMode ? '#FFF' : '#000' },
        labelStyle: { 
            ...e.labelStyle, 
            fill: isDarkMode ? '#FFF' : '#000',
        },
        labelBgStyle: {
            ...e.labelBgStyle,
            fill: newBgColor // Update pill background on toggle
        },
        markerEnd: {
            ...(typeof e.markerEnd === 'object' ? e.markerEnd : { type: MarkerType.ArrowClosed }),
            color: isDarkMode ? '#FFF' : '#000'
        }
    })));
  }, [isDarkMode, setEdges]);

  useEffect(() => {
    edgeTypeRef.current = edgeType;
    setEdges((eds) => eds.map((e) => ({ ...e, type: edgeType })));
  }, [edgeType, setEdges]);

  // Load Sessions
  useEffect(() => {
      if (sidebarView === 'history') getSessions().then(setSessions);
  }, [sidebarView]);

  // Edit Node Handlers
  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: FlowNode) => {
    event.preventDefault();
    setEditingNode(node);
    
    if (node.type === 'note') {
        setEditForm({
            label: node.data.label || '',
            description: '',
            type: 'service',
            icon: '',
            color: node.data.color || 'black'
        });
    } else {
        setEditForm({
            label: node.data.label || '',
            description: node.data.description || '',
            type: node.data.type || 'service',
            icon: node.data.icon || '',
            color: 'black'
        });
    }
  }, []);

  // Edit Edge Handlers
  const onEdgeDoubleClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    setEditingEdge(edge);
    setEditEdgeLabel((edge.label as string) || '');
  }, []);

  const handleSaveNode = () => {
    if (!editingNode) return;
    setNodes((nds) => nds.map((n) => {
      if (n.id === editingNode.id) {
        if (n.type === 'note') {
            return {
                ...n,
                data: {
                    ...n.data,
                    label: editForm.label,
                    color: editForm.color
                }
            };
        }
        return {
          ...n,
          data: {
            ...n.data,
            label: editForm.label,
            description: editForm.description,
            type: editForm.type,
            icon: editForm.icon
          }
        };
      }
      return n;
    }));
    setEditingNode(null);
  };

  const handleSaveEdge = () => {
    if (!editingEdge) return;
    setEdges((eds) => eds.map((e) => {
      if (e.id === editingEdge.id) {
        return { ...e, label: editEdgeLabel };
      }
      return e;
    }));
    setEditingEdge(null);
  };

  const handleAddNote = () => {
    if (!rfInstance) return;
    const center = rfInstance.screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
    });
    
    const newNote: FlowNode = {
        id: `note-${Date.now()}`,
        type: 'note',
        position: center,
        data: { label: 'New Note', color: 'black' },
    };
    
    setNodes((nds) => [...nds, newNote]);
  };

  const copyDiagramAsPng = useCallback(async () => {
    if (!rfInstance || nodes.length === 0) return;
    setIsCopying(true);
    
    const nodesBounds = getRectOfNodes(nodes);
    const imageWidth = nodesBounds.width + 100;
    const imageHeight = nodesBounds.height + 100;
    const transform = getTransformForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);

    const viewportElem = document.querySelector('.react-flow__viewport') as HTMLElement;

    if (viewportElem) {
        try {
            const dataUrl = await toPng(viewportElem, {
                backgroundColor: isDarkModeRef.current ? '#212121' : '#FFFFFF',
                width: imageWidth,
                height: imageHeight,
                style: {
                    width: imageWidth.toString(),
                    height: imageHeight.toString(),
                    transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
                },
            });

            const res = await fetch(dataUrl);
            const blob = await res.blob();
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            
            setAgentStatus("Copied PNG to clipboard!");
            setTimeout(() => setAgentStatus(""), 3000);
        } catch (err) {
            console.error('Failed to copy diagram:', err);
            setAgentStatus("Failed to copy image.");
        }
    }
    
    setIsCopying(false);
  }, [rfInstance, nodes]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), sender: Sender.USER, text };
    const aiMsgId = (Date.now() + 1).toString();
    
    setMessages(prev => [...prev, userMsg, { id: aiMsgId, sender: Sender.AI, text: "", isStreaming: true }]);
    if (text === inputValue) setInputValue('');
    
    setIsLoading(true);
    setAgentStatus("Thinking...");

    try {
        const stream = streamAgentResponse(userMsg.text, threadIdRef.current);
        let accumulatedText = "";

        for await (const chunk of stream) {
            if (chunk.agentStatus) setAgentStatus(chunk.agentStatus.message);
            if (chunk.textChunk) {
                accumulatedText += chunk.textChunk;
                setMessages(prev => prev.map(msg => msg.id === aiMsgId ? { ...msg, text: accumulatedText } : msg));

                const now = Date.now();
                if (now - lastLayoutTime.current > 400) {
                    const partialGraph = extractPartialGraphFromText(accumulatedText);
                    if (partialGraph && partialGraph.nodes.length > 0) {
                        const { nodes: lNodes, edges: lEdges } = transformDataToFlow(partialGraph, edgeTypeRef.current, isDarkModeRef.current);
                        if (lNodes.length > 0) {
                            setNodes(prev => {
                                const notes = prev.filter(n => n.type === 'note');
                                return [...lNodes, ...notes];
                            });
                            setEdges(lEdges);
                            lastLayoutTime.current = now;
                        }
                    }
                }
            }
        }

        const finalGraphData = parseGraphFromText(accumulatedText);
        
        if (finalGraphData.nodes.length > 0) {
            // RENDER FINAL GRAPH DIRECTLY (Inspector skipped for speed)
            let { nodes: finalNodes, edges: finalEdges } = transformDataToFlow(finalGraphData, edgeTypeRef.current, isDarkModeRef.current);
            setNodes(prev => {
                const notes = prev.filter(n => n.type === 'note');
                return [...finalNodes, ...notes];
            });
            setEdges(finalEdges);

            // POLISH ICONS (FAST)
            setAgentStatus("Polishing icons...");
            const iconMap = await generateIconMapping(finalGraphData.nodes);
            
            if (Object.keys(iconMap).length > 0) {
                const enrichedGraph = {
                    ...finalGraphData,
                    nodes: finalGraphData.nodes.map(n => ({
                        ...n,
                        data: { ...n.data!, icon: iconMap[n.id] || n.data?.icon }
                    }))
                };
                const { nodes: iconNodes, edges: iconEdges } = transformDataToFlow(enrichedGraph, edgeTypeRef.current, isDarkModeRef.current);
                setNodes(prev => {
                    const notes = prev.filter(n => n.type === 'note');
                    return [...iconNodes, ...notes];
                });
                setEdges(iconEdges);
            }
        }
        
        setMessages(prev => prev.map(msg => msg.id === aiMsgId ? { ...msg, isStreaming: false } : msg));

    } catch (error: any) {
        setMessages(prev => prev.map(msg => msg.id === aiMsgId ? { ...msg, text: `Error: ${error.message}`, isStreaming: false } : msg));
    } finally {
        setIsLoading(false);
        setAgentStatus("");
    }
  };

  const loadSession = async (threadId: string) => {
      setIsLoading(true);
      threadIdRef.current = threadId;
      const history = await getSessionMessages(threadId);
      
      const uiMessages: ChatMessage[] = history.map((m, i) => ({
          id: `${threadId}-${i}`,
          sender: m.role === 'user' ? Sender.USER : Sender.AI,
          text: m.content
      }));
      setMessages(uiMessages);
      setSidebarView('chat');

      const lastGraphMsg = [...uiMessages].reverse().find(m => m.sender === Sender.AI && m.text.includes('```json'));
      if (lastGraphMsg) {
          const graphData = parseGraphFromText(lastGraphMsg.text);
          if (graphData.nodes.length > 0) {
               const { nodes: lNodes, edges: lEdges } = transformDataToFlow(graphData, edgeTypeRef.current, isDarkModeRef.current);
               setNodes(lNodes); 
               setEdges(lEdges);
          }
      } else {
          setNodes([]);
          setEdges([]);
      }
      setIsLoading(false);
  };

  const resetChat = () => {
      threadIdRef.current = Date.now().toString();
      setMessages([{id: '1', sender: Sender.AI, text: "Ready."}]);
      setNodes([]);
      setEdges([]);
  };

  return (
    <div className="flex h-screen w-full bg-white dark:bg-[#181818] text-zinc-900 dark:text-zinc-100 font-sans overflow-hidden">
      
      <Sidebar 
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          resetChat={resetChat}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          sidebarView={sidebarView}
          setSidebarView={setSidebarView}
          messages={messages}
          sessions={sessions}
          loadSession={loadSession}
          inputValue={inputValue}
          setInputValue={setInputValue}
          sendMessage={sendMessage}
          isLoading={isLoading}
          agentStatus={agentStatus}
      />

      <main className="flex-grow relative bg-white dark:bg-[#212121]">
         <div className="absolute inset-0 opacity-[0.15] dark:opacity-20 pointer-events-none" 
              style={{ 
                  backgroundImage: `radial-gradient(${isDarkMode ? '#9ca3af' : '#000000'} 1px, transparent 1px)`, 
                  backgroundSize: '24px 24px' 
              }}>
         </div>

         {/* Floating Sidebar Trigger (Visible when collapsed) */}
         {isSidebarCollapsed && (
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 p-1.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm animate-in fade-in slide-in-from-left-2 duration-300">
                <button 
                    onClick={() => setIsSidebarCollapsed(false)}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-300 transition-colors"
                    title="Open Sidebar"
                >
                    <PanelLeftOpen size={20} />
                </button>
                <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />
                <button 
                    onClick={() => {
                        setIsSidebarCollapsed(false);
                        resetChat();
                    }}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-300 transition-colors"
                    title="New Diagram"
                >
                    <Plus size={20} />
                </button>
            </div>
         )}

         <ContextMenu>
             <ContextMenuTrigger>
                 <div className="w-full h-full">
                     <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        nodeTypes={nodeTypes}
                        onInit={setRfInstance}
                        onNodeDoubleClick={onNodeDoubleClick}
                        onEdgeDoubleClick={onEdgeDoubleClick}
                        fitView
                        deleteKeyCode={['Backspace', 'Delete']}
                        defaultEdgeOptions={{ type: edgeType, animated: false }}
                     >
                        <Controls className="!bg-white dark:!bg-black !border-zinc-200 dark:!border-zinc-800 !rounded-lg !shadow-sm [&>button]:!border-none [&>button]:!text-black dark:[&>button]:!text-white" />
                        
                        <Panel position="top-right" className="m-6 flex gap-3">
                            <button onClick={handleAddNote} className="flex items-center justify-center h-9 w-9 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors shadow-sm" title="Add Note">
                                <Type size={16} />
                            </button>
                            <div className="relative">
                                <button onClick={(e) => { e.stopPropagation(); setIsEdgeTypeOpen(!isEdgeTypeOpen); }} className="flex items-center gap-2 h-9 px-3 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors shadow-sm">
                                    {edgeType === 'smoothstep' && <Route size={14}/>}
                                    {edgeType === 'step' && <CornerDownRight size={14}/>}
                                    {edgeType === 'default' && <Waves size={14}/>}
                                    {edgeType === 'straight' && <Minus size={14}/>}
                                    <span className="capitalize">{edgeType.replace('smoothstep', 'Smooth')}</span>
                                    <ChevronDown size={14} className="opacity-50"/>
                                </button>
                                {isEdgeTypeOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-32 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-1 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100">
                                        {['smoothstep', 'step', 'default', 'straight'].map(t => (
                                            <button key={t} onClick={() => { setEdgeType(t); setIsEdgeTypeOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md capitalize transition-colors">
                                                {t.replace('smoothstep', 'Smooth')}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Panel>
                     </ReactFlow>
                 </div>
             </ContextMenuTrigger>
             <ContextMenuContent className="w-64">
                 <ContextMenuItem onSelect={copyDiagramAsPng} className="gap-2">
                     {isCopying ? <Check size={14} /> : <Copy size={14} />}
                     Copy as PNG
                 </ContextMenuItem>
             </ContextMenuContent>
         </ContextMenu>
         
         {(editingNode || editingEdge) && (
            <EditModal 
                editingNode={editingNode}
                editingEdge={editingEdge}
                editForm={editForm}
                editEdgeLabel={editEdgeLabel}
                onClose={() => { setEditingNode(null); setEditingEdge(null); }}
                onSave={editingNode ? handleSaveNode : handleSaveEdge}
                setEditForm={setEditForm}
                setEditEdgeLabel={setEditEdgeLabel}
            />
         )}

         {nodes.length === 0 && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center opacity-30 flex flex-col items-center">
                    <Highlighter size={64} strokeWidth={1} className="mb-4 text-zinc-900 dark:text-white"/>
                    <h3 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">Start Marking</h3>
                    <p className="text-sm text-zinc-500 mt-2">Describe your architecture to begin</p>
                </div>
            </div>
         )}
      </main>
    </div>
  );
};

export default App;
