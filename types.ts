
export type NodeType = 'client' | 'service' | 'database' | 'interface';

export interface GraphNode {
  id: string;
  label?: string;
  type?: string;
  description?: string;
  data?: {
    label: string;
    type: NodeType;
    description: string;
    icon?: string;
  };
}

export interface GraphEdge {
  id?: string;
  source: string;
  target: string;
  label?: string;
  markerEnd?: any;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface GenerationResult {
  graphData: GraphData;
  sources: GroundingSource[];
}

export enum Sender {
  USER = 'user',
  AI = 'ai'
}

export interface AgentStatus {
  type: 'info' | 'success' | 'warning';
  message: string;
}

export interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  isStreaming?: boolean;
  sources?: GroundingSource[];
}