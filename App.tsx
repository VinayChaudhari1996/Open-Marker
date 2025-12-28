
import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Edge,
  Node as FlowNode,
  useNodesState,
  useEdgesState,
  Panel,
  ReactFlowInstance,
  getRectOfNodes,
  MarkerType
} from 'reactflow';
import { 
  PanelLeftOpen,
  Plus,
  Copy,
  Check,
  Layout,
  Highlighter,
  Loader2
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { Sender, ChatMessage, SessionContext, AgentMemory, AgentOutput, ReactFlowNode } from './types';
import { generateDiagram } from './services/geminiService';
import { transformDataToFlow } from './lib/graphUtils';
import CustomNode from './components/CustomNode';
import NoteNode from './components/NoteNode';
import EditModal from './components/EditModal';
import Sidebar from './components/Sidebar';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./components/ui/context-menu";

const nodeTypes = { custom: CustomNode, note: NoteNode };

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([{
        id: '1', sender: Sender.AI, text: "Welcome. Describe your system architecture and I'll generate a clean, containerized diagram for you."
  }]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agentStatus, setAgentStatus] = useState<string>("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [isCopying, setIsCopying] = useState(false);

  const [sessionContext, setSessionContext] = useState<SessionContext>({ nodes: [], edges: [], diagram_type: '' });
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [editingNode, setEditingNode] = useState<FlowNode | null>(null);
  const [editForm, setEditForm] = useState({ label: '', description: '', type: 'service', icon: '', color: 'black' as any });
  const [editingEdge, setEditingEdge] = useState<Edge | null>(null);
  const [editEdgeLabel, setEditEdgeLabel] = useState('');

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    
    const color = isDarkMode ? '#FFFFFF' : '#18181b';
    const bgColor = isDarkMode ? '#18181b' : '#FFFFFF';
    
    setEdges((eds) => eds.map(e => ({
      ...e,
      style: { ...e.style, stroke: color },
      labelStyle: { ...e.labelStyle, fill: color },
      labelBgStyle: { ...e.labelBgStyle, fill: bgColor },
      markerEnd: typeof e.markerEnd === 'object' ? { ...e.markerEnd, color: color } : e.markerEnd
    })));
  }, [isDarkMode, setEdges]);

  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: FlowNode) => {
    event.preventDefault();
    setEditingNode(node);
    setEditForm({
        label: node.data.label || '',
        description: node.data.description || '',
        type: node.data.type || 'service',
        icon: node.data.icon || '',
        color: node.data.color || 'black'
    });
  }, []);

  const onEdgeDoubleClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    setEditingEdge(edge);
    setEditEdgeLabel((edge.label as string) || '');
  }, []);

  const handleSaveNode = () => {
    if (!editingNode) return;
    setNodes((nds) => nds.map((n) => n.id === editingNode.id ? { ...n, data: { ...n.data, ...editForm } } : n));
    setEditingNode(null);
  };

  const handleSaveEdge = () => {
    if (!editingEdge) return;
    setEdges((eds) => eds.map((e) => e.id === editingEdge.id ? { ...e, label: editEdgeLabel } : e));
    setEditingEdge(null);
  };

  const cleanUpDiagramData = (nodes: ReactFlowNode[]) => {
    // 1. Identify containers that actually have children
    const parentIds = new Set(nodes.filter(n => n.parentId).map(n => n.parentId));
    
    // 2. Filter nodes: keep non-containers, and containers that have children
    return nodes.filter(node => {
        if (node.data?.isContainer) {
            return parentIds.has(node.id);
        }
        return true;
    });
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setMessages(prev => [...prev, { id: Date.now().toString(), sender: Sender.USER, text }]);
    setInputValue('');
    setIsLoading(true);
    setAgentStatus("Architecting...");

    try {
        const output: AgentOutput = await generateDiagram(text, sessionContext, {});

        if (output.clarification_needed) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(), sender: Sender.AI, text: output.clarification_question, isClarification: true
            }]);
        } else {
            // Filter out empty containers from AI response
            const cleanedNodes = cleanUpDiagramData(output.nodes);
            
            const updatedContext = {
                nodes: cleanedNodes,
                edges: output.edges,
                diagram_type: output.diagram_type
            };
            setSessionContext(updatedContext);

            const { nodes: lNodes, edges: lEdges } = transformDataToFlow({
                nodes: updatedContext.nodes,
                edges: updatedContext.edges
            }, 'smoothstep', isDarkMode);

            setNodes(lNodes);
            setEdges(lEdges);

            setMessages(prev => [...prev, {
                id: Date.now().toString(), sender: Sender.AI, text: `Successfully generated the ${output.diagram_type} diagram.`
            }]);
        }
    } catch (error) {
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: Sender.AI, text: "I encountered an error while building the diagram. Please try a different description." }]);
    } finally {
        setIsLoading(false);
        setAgentStatus("");
    }
  };

  const copyDiagramAsPng = useCallback(async () => {
    if (!rfInstance || nodes.length === 0) return;
    setIsCopying(true);
    const viewportElem = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (viewportElem) {
        try {
            const nodesBounds = getRectOfNodes(nodes);
            const dataUrl = await toPng(viewportElem, {
                backgroundColor: isDarkMode ? '#18181b' : '#FFFFFF',
                width: nodesBounds.width + 200,
                height: nodesBounds.height + 200,
            });
            const res = await fetch(dataUrl);
            const blob = await res.blob();
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            setAgentStatus("PNG Copied!");
            setTimeout(() => setAgentStatus(""), 2000);
        } catch (err) { console.error(err); }
    }
    setIsCopying(false);
  }, [rfInstance, nodes, isDarkMode]);

  const resetChat = () => {
    setMessages([{ id: '1', sender: Sender.AI, text: "Canvas cleared. What should we build next?" }]);
    setNodes([]);
    setEdges([]);
    setSessionContext({ nodes: [], edges: [], diagram_type: '' });
  };

  return (
    <div className="flex h-screen w-full bg-white dark:bg-[#181818] text-zinc-900 dark:text-zinc-100 font-sans overflow-hidden">
      <Sidebar 
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          resetChat={resetChat}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          messages={messages}
          inputValue={inputValue}
          setInputValue={setInputValue}
          sendMessage={sendMessage}
          isLoading={isLoading}
          agentStatus={agentStatus}
      />

      <main className="flex-grow relative bg-white dark:bg-[#181818]">
         <div className="absolute inset-0 opacity-[0.05] dark:opacity-10 pointer-events-none dotted-grid"></div>

         {isSidebarCollapsed && (
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 p-1.5 glass rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                <button onClick={() => setIsSidebarCollapsed(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"><PanelLeftOpen size={20} /></button>
                <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />
                <button onClick={resetChat} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"><Plus size={20} /></button>
            </div>
         )}

         <ContextMenu>
             <ContextMenuTrigger className="w-full h-full">
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
                    colorMode={isDarkMode ? 'dark' : 'light'}
                    >
                    <Controls className="!bg-white dark:!bg-black !border-zinc-200 dark:!border-zinc-800 !rounded-lg" />
                    <Panel position="top-right" className="m-6 flex gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-bold text-zinc-500 uppercase tracking-widest shadow-sm">
                           {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Layout size={14} />} 
                           Design Mode
                        </div>
                    </Panel>
                </ReactFlow>
             </ContextMenuTrigger>
             <ContextMenuContent className="w-64">
                 <ContextMenuItem onSelect={copyDiagramAsPng} className="gap-2">
                     {isCopying ? <Check size={14} /> : <Copy size={14} />}
                     Export as PNG
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
                <div className="text-center opacity-20 flex flex-col items-center">
                    <Highlighter size={80} strokeWidth={1} className="mb-6 text-zinc-400"/>
                    <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Clean Architecture</h3>
                    <p className="text-sm text-zinc-500 mt-3 max-w-xs">Describe your image recognition app or any system to start generating diagrams.</p>
                </div>
            </div>
         )}
      </main>
    </div>
  );
};

export default App;
