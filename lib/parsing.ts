
import { GraphData } from "../types";

/**
 * Robust JSON extraction for streaming responses.
 * Scans a growing text buffer to find valid 'nodes' and 'edges' arrays before the full JSON is complete.
 */
export const extractPartialGraphFromText = (text: string): GraphData | null => {
    // Attempt to extract nodes and edges arrays using regex
    // We look for everything from "nodes": [ to the last possible closing ]
    const nodesRegex = /"nodes"\s*:\s*\[([\s\S]*?)\]/;
    const edgesRegex = /"edges"\s*:\s*\[([\s\S]*?)\]/;

    const nodesMatch = text.match(nodesRegex);
    const edgesMatch = text.match(edgesRegex);
    
    // Helper to parse comma-separated JSON objects from a raw string, even if the last one is incomplete
    const parsePartialArray = (arrayString: string) => {
        const items = [];
        let braceCount = 0;
        let startIndex = -1;
        let inString = false;
        
        for (let i = 0; i < arrayString.length; i++) {
            const char = arrayString[i];
            
            // Handle strings to ignore braces inside them
            if (char === '"' && arrayString[i-1] !== '\\') {
                inString = !inString;
            }

            if (!inString) {
                if (char === '{') {
                    if (braceCount === 0) startIndex = i;
                    braceCount++;
                } else if (char === '}') {
                    braceCount--;
                    if (braceCount === 0 && startIndex !== -1) {
                        try {
                            const jsonStr = arrayString.substring(startIndex, i + 1);
                            const parsed = JSON.parse(jsonStr);
                            // Only add if it looks like a valid node/edge
                            if (parsed.id || parsed.source) {
                                items.push(parsed);
                            }
                        } catch (e) { 
                            // Expected error for incomplete JSON chunks
                        }
                        startIndex = -1;
                    }
                }
            }
        }
        return items;
    };

    const nodes = nodesMatch ? parsePartialArray(nodesMatch[1]) : [];
    const edges = edgesMatch ? parsePartialArray(edgesMatch[1]) : [];

    if (nodes.length === 0 && edges.length === 0) return null;

    return { nodes, edges };
};

/**
 * Extracts the final, complete JSON graph from the markdown response.
 */
export const parseGraphFromText = (text: string): GraphData => {
    // Look for markdown code blocks first, then fallback to raw JSON
    const jsonMatch = text.match(/```json\n?([\s\S]*?)```/) || text.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
         return { nodes: [], edges: [] };
    }

    const jsonString = jsonMatch[1] || jsonMatch[0];
    
    try {
        let data: any = JSON.parse(jsonString);
        // Handle potential nesting wrapper
        if (!data.nodes && data.data?.nodes) data = data.data;
        
        const nodes = Array.isArray(data.nodes) ? data.nodes : [];
        const edges = Array.isArray(data.edges) ? data.edges : [];
        
        // Filter out obviously bad nodes
        const validNodes = nodes.filter((n: any) => n.id && (n.data?.label || n.label));

        return { nodes: validNodes, edges };
    } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        return { nodes: [], edges: [] };
    }
};
