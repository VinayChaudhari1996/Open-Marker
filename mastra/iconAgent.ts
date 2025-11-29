
import { Agent, GoogleModel } from './core';

const API_KEY = process.env.API_KEY || '';

const SYSTEM_INSTRUCTIONS = `You are an Icon Selector. 
Task: Select the most appropriate Lucide React icon name for the given software components.

Output: JSON Object { "nodeId": "IconName" }
Constraint: Use ONLY standard PascalCase names.

Common mappings:
- "Database", "Storage", "S3" -> "Database" or "HardDrive"
- "User", "Client" -> "User" or "Smartphone"
- "Server", "Backend" -> "Server" or "Cpu"
- "Cloud", "Internet" -> "Cloud"
- "API", "Gateway" -> "Network" or "Globe"
- "Auth", "Security" -> "ShieldCheck" or "Lock"
- "Function", "Lambda" -> "FileCode"

Example Input: [{"id":"1", "label":"Redis"}]
Example Output: {"1": "Database"}
`;

export const iconSelectorAgent = new Agent({
    name: "Icon Selector",
    instructions: SYSTEM_INSTRUCTIONS,
    model: new GoogleModel({ name: "gemini-2.5-flash", apiKey: API_KEY })
});
