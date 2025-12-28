
import { GroundingSource, GraphNode, AgentStatus, GraphData } from "../types";
import { flowGenAgent } from "../mastra/agent";
import { iconSelectorAgent } from "../mastra/iconAgent";
import { ThreadMetadata, MemoryMessage } from "../mastra/memory";
import { scrapeUrl } from "../lib/scraper";
import { parseGraphFromText } from "../lib/parsing";

export interface StreamResponse {
  textChunk?: string;
  sources?: GroundingSource[];
  agentStatus?: AgentStatus;
}

export async function* streamAgentResponse(prompt: string, threadId?: string): AsyncGenerator<StreamResponse, string, unknown> {
  try {
    let finalPrompt = prompt;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = prompt.match(urlRegex);

    if (urls && urls.length > 0) {
        yield { agentStatus: { type: 'info', message: "Scanning URL..." } };
        const scrapedContent = await scrapeUrl(urls[0]);
        if (scrapedContent) {
            finalPrompt = `Context (${urls[0]}):\n${scrapedContent}\n\nUser Request: ${prompt}`;
        }
    }

    yield { agentStatus: { type: 'info', message: "Architecting..." } };

    const responseStream = await flowGenAgent.stream(finalPrompt, threadId);
    let fullText = "";

    for await (const chunk of responseStream) {
      const text = chunk.text || "";
      fullText += text;
      
      const sources: GroundingSource[] = [];
      if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        chunk.candidates[0].groundingMetadata.groundingChunks.forEach(c => {
          if (c.web?.uri && c.web?.title) {
            sources.push({ title: c.web.title, uri: c.web.uri });
          }
        });
      }

      yield { textChunk: text, sources: sources.length ? sources : undefined };
    }
    return fullText;
  } catch (error: any) {
    throw new Error(error.message || "Agent failure");
  }
}

/**
 * Pass-through function. Inspector agent is removed for performance.
 */
export async function inspectGraph(graphData: GraphData): Promise<GraphData> {
    return graphData;
}

export async function generateIconMapping(nodes: GraphNode[]): Promise<Record<string, string>> {
    if (nodes.length === 0) return {};
    const simplifiedNodes = nodes.map(n => ({ id: n.id, label: n.data?.label || n.label, type: n.data?.type || n.type }));
    
    try {
        const responseStream = await iconSelectorAgent.stream(JSON.stringify(simplifiedNodes));
        let fullText = "";
        for await (const chunk of responseStream) fullText += chunk.text || "";
        
        const jsonMatch = fullText.match(/```json\n?([\s\S]*?)```/) || fullText.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[1] || jsonMatch[0]) : {};
    } catch { return {}; }
}

export async function getSessions(): Promise<ThreadMetadata[]> {
    const memory = flowGenAgent.getMemory();
    return memory ? await memory.getThreads() : [];
}

export async function getSessionMessages(threadId: string): Promise<MemoryMessage[]> {
    const memory = flowGenAgent.getMemory();
    return memory ? await memory.query({ threadId }) : [];
}
