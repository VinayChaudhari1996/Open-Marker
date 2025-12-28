
import { GoogleGenAI } from "@google/genai";
import { GroundingSource, GraphNode, AgentStatus, GraphData, SessionContext } from "../types";

export interface StreamResponse {
  textChunk?: string;
  fullText?: string;
  sources?: GroundingSource[];
  agentStatus?: AgentStatus;
}

const SYSTEM_INSTRUCTION = `You are a SOFTWARE ARCHITECT specialized in HORIZONTAL PIPELINE DIAGRAMS.

--- VISUAL GOAL ---
Create a logical Left-to-Right data flow diagram. Group related components into specific labeled Containers.

--- LAYOUT & GROUPING RULES ---
1. **FLOW DIRECTION**: The diagram MUST flow from Left (Input/Client) -> Center (Processing) -> Right (Storage/Output).
2. **CONTAINER USAGE**:
   - **System Boundaries** (e.g., "User Interface", "External Systems"): Use \`variant: "amber"\`.
   - **Internal Groups** (e.g., "Processing Pipeline", "Backend Services"): Use \`variant: "amber"\` for the main wrapper, and \`variant: "blue"\` for sub-groups if needed.
   - **NEVER** leave nodes orphan if they belong to a logical group.

--- NODE STRUCTURE ---
- **Leaf Nodes**: Represents specific services (e.g., "React App", "Redis", "Lambda").
- **Containers**: Wraps multiple leaf nodes.

--- OUTPUT FORMAT (JSON) ---
{
  "nodes": [
    // 1. Containers
    { "id": "ui_group", "type": "custom", "data": { "label": "USER INTERFACE", "isContainer": true, "icon": "Monitor", "variant": "amber" } },
    { "id": "pipeline_group", "type": "custom", "data": { "label": "PROCESSING PIPELINE", "isContainer": true, "icon": "Cpu", "variant": "amber" } },
    { "id": "data_subgroup", "parentId": "pipeline_group", "type": "custom", "data": { "label": "DATA PREP", "isContainer": true, "icon": "Filter", "variant": "blue" } },

    // 2. Leaf Nodes
    { "id": "upload", "parentId": "ui_group", "type": "custom", "data": { "label": "Image Upload", "icon": "Upload", "description": "Drag & Drop" } },
    { "id": "cleaner", "parentId": "data_subgroup", "type": "custom", "data": { "label": "Image Cleaner", "icon": "Sparkles", "description": "Remove noise" } },
    { "id": "vector_db", "type": "custom", "data": { "label": "Vector DB", "icon": "Database", "description": "Pinecone" } } // External nodes allowed if appropriate
  ],
  "edges": [
    { "id": "e1", "source": "upload", "target": "cleaner", "label": "Raw Image" },
    { "id": "e2", "source": "cleaner", "target": "vector_db", "label": "Embeddings" }
  ]
}
`;

export async function* streamAgentResponse(
  userInput: string, 
  sessionContext: SessionContext
): AsyncGenerator<StreamResponse, void, unknown> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const context = {
    current_graph: {
      nodes: sessionContext.nodes.map(n => ({ id: n.id, label: n.data.label, parentId: n.parentId })),
      edges: sessionContext.edges.map(e => ({ source: e.source, target: e.target }))
    },
    request: userInput
  };

  try {
    const stream = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: JSON.stringify(context) }] }],
      config: { 
        systemInstruction: SYSTEM_INSTRUCTION, 
        responseMimeType: "application/json",
        temperature: 0.1
      }
    });

    let fullText = "";
    for await (const chunk of stream) {
      fullText += chunk.text;
      yield { 
        textChunk: chunk.text, 
        fullText: fullText,
        agentStatus: { type: 'info', message: "Drafting pipeline..." } 
      };
    }
  } catch (error) {
    console.error("AI Stream Error:", error);
    yield { agentStatus: { type: 'error', message: "Generation failed." } };
  }
}
