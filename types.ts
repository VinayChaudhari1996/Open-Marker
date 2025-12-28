

export type DiagramType = 'flowchart' | 'architecture' | 'process' | 'decision-tree' | 'sequence' | 'mindmap';
export type Intent = 'create' | 'update' | 'delete' | 'clarify';

/**
 * Defines the semantic categories for diagram nodes.
 */
export type NodeType = 'client' | 'service' | 'database' | 'interface' | 'custom' | 'note' | 'step' | 'container';

export interface ReactFlowNode {
  id: string;
  type?: string;
  parentId?: string;
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
    icon?: string;
    isContainer?: boolean;
    [key: string]: any;
  };
  width?: number | null;
  height?: number | null;
}

export interface ReactFlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string | any;
  type?: string;
  animated?: boolean;
}

export interface SessionContext {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  diagram_type: string;
}

export interface AgentMemory {
  [key: string]: any;
}

export interface AgentOutput {
  intent: Intent;
  diagram_type: DiagramType;
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  session_updates: Partial<SessionContext>;
  memory_updates: Partial<AgentMemory>;
  clarification_needed: boolean;
  clarification_question: string;
}

export enum Sender {
  USER = 'user',
  AI = 'ai'
}

export interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  isClarification?: boolean;
}

/**
 * NEW TYPES FOR AGENT ORCHESTRATION
 */

// Added GraphNode for general representation of architecture components
export interface GraphNode {
  id: string;
  type?: string;
  label?: string; // Fallback label
  position?: { x: number; y: number };
  data?: {
    label?: string;
    type?: string;
    description?: string;
    icon?: string;
    isContainer?: boolean;
    [key: string]: any;
  };
  parentId?: string;
  [key: string]: any;
}

// Added GraphEdge for general representation of connections
export interface GraphEdge {
  id?: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
  type?: string;
}

// Added GraphData to wrap nodes and edges for processing
export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Added GroundingSource for Google Search result tracking
export interface GroundingSource {
  title: string;
  uri: string;
}

// Added AgentStatus for UI feedback during generation
export interface AgentStatus {
  type: 'info' | 'error' | 'success';
  message: string;
}

/**
 * SESSION MANAGEMENT
 */
export interface SavedSession {
  id: string;
  name: string;
  updatedAt: number;
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  messages: ChatMessage[];
}