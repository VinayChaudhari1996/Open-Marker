
import { GoogleGenAI } from "@google/genai";
import { SessionContext, AgentMemory, AgentOutput } from "../types";

const SYSTEM_INSTRUCTION = `You are a SENIOR SOLUTIONS ARCHITECT. Your goal is to produce professional, clean, and large-scale architectural diagrams.

--- ARCHITECTURAL STYLE RULES ---
1. CONTAINER HIERARCHY (STRICT):
   - Use containers ("USER INTERFACE", "DATABASE CLUSTER", etc.) ONLY if they contain 2 or more related components.
   - NEVER create an empty container.
   - NEVER create a container with only 1 child node; in that case, represent the component directly without a container.
   - Use colored boundaries: Amber/Yellow for system boundaries (UI, Frontend), Blue for internal functional groups (Processing, Storage).

2. COMPONENT DESIGN:
   - Use large icons and clear labels.
   - Every component MUST have a Lucide icon name (e.g. "Smartphone", "Camera", "Database", "Shield", "Cpu", "Globe", "Cloud", "Lock").

3. OPTIMIZED LAYOUT:
   - Align blocks properly. Do not create deep nested chains.
   - Flow should primarily be Left-to-Right.
   - Ensure a balanced density; don't leave massive empty spaces inside containers.

4. EDGE CONNECTIONS:
   - Use descriptive labels for every transition (e.g. "JSON/HTTPS", "gRPC", "SQL Query").
   - Utilize Top, Bottom, Left, and Right handles for clean, non-overlapping routing.

--- OUTPUT FORMAT (STRICT JSON) ---
{
  "intent": "create",
  "diagram_type": "architecture",
  "nodes": [
    { "id": "main", "type": "custom", "data": { "label": "PROCESSING PIPELINE", "isContainer": true, "icon": "Settings" } },
    { "id": "n1", "parentId": "main", "type": "custom", "data": { "label": "Data Input", "icon": "Upload", "description": "Raw bytes" } },
    { "id": "n2", "parentId": "main", "type": "custom", "data": { "label": "Transformer", "icon": "RefreshCw", "description": "Normalization" } }
  ],
  "edges": [
    { "id": "e1", "source": "n1", "target": "n2", "label": "streamed data", "type": "smoothstep" }
  ],
  "session_updates": {},
  "memory_updates": {},
  "clarification_needed": false,
  "clarification_question": ""
}`;

export async function generateDiagram(
  userInput: string,
  sessionContext: SessionContext,
  agentMemory: AgentMemory
): Promise<AgentOutput> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const context = {
    current_nodes: sessionContext.nodes.map(n => ({ id: n.id, label: n.data.label, parentId: n.parentId })),
    current_edges: sessionContext.edges.map(e => ({ source: e.source, target: e.target, label: e.label })),
    user_request: userInput
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts: [{ text: JSON.stringify(context) }] }],
      config: { 
        systemInstruction: SYSTEM_INSTRUCTION, 
        responseMimeType: "application/json",
        temperature: 0.1 
      }
    });

    return JSON.parse(response.text || "{}") as AgentOutput;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
}
