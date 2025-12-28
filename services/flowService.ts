
import { GroundingSource, GraphNode, AgentStatus, GraphData } from "../types";
import { ThreadMetadata, MemoryMessage } from "../mastra/memory";

export interface StreamResponse {
  textChunk?: string;
  sources?: GroundingSource[];
  agentStatus?: AgentStatus;
}

/**
 * Stream implementation removed. 
 * Preparing for new architectural design.
 */
export async function* streamAgentResponse(prompt: string, threadId?: string): AsyncGenerator<StreamResponse, string, unknown> {
  yield { agentStatus: { type: 'info', message: "System idle. Awaiting new design..." } };
  return "System is ready for the new design implementation.";
}

export async function inspectGraph(graphData: GraphData): Promise<GraphData> {
    return graphData;
}

export async function generateIconMapping(nodes: GraphNode[]): Promise<Record<string, string>> {
    return {};
}

export async function getSessions(): Promise<ThreadMetadata[]> {
    return [];
}

export async function getSessionMessages(threadId: string): Promise<MemoryMessage[]> {
    return [];
}
