
import { GoogleGenAI } from "@google/genai";
import { Memory } from "./memory";

/**
 * MASTRA CORE SHIM
 * 
 * This module simulates the @mastra/core SDK functionality for a client-side environment.
 * It provides the base classes for Agents and Models, wrapping the Google GenAI SDK.
 */

export interface ModelConfig {
    provider: string;
    name: string;
    toolChoice?: 'auto' | 'required' | 'none';
}

export class GoogleModel {
    private apiKey: string;
    private modelName: string;
    private client: GoogleGenAI;

    constructor(config: { name: string; apiKey: string }) {
        this.modelName = config.name;
        this.apiKey = config.apiKey;
        this.client = new GoogleGenAI({ apiKey: this.apiKey });
    }

    get instance() {
        return this.client;
    }

    get name() {
        return this.modelName;
    }
}

export interface AgentConfig {
    name: string;
    instructions: string;
    model: GoogleModel;
    memory?: Memory;
    enabledTools?: {
        googleSearch?: boolean;
    };
}

export class Agent {
    public name: string;
    public instructions: string;
    public model: GoogleModel;
    public memory?: Memory;
    public tools: AgentConfig['enabledTools'];

    constructor(config: AgentConfig) {
        this.name = config.name;
        this.instructions = config.instructions;
        this.model = config.model;
        this.memory = config.memory;
        this.tools = config.enabledTools;
    }

    getMemory() {
        return this.memory;
    }

    /**
     * Streams a response from the agent based on user input.
     * Incorporates system instructions, tool configurations, and Memory history.
     */
    async stream(prompt: string, threadId?: string) {
        const ai = this.model.instance;
        
        let contents: any = [];

        // 1. Handle Memory / History
        if (this.memory && threadId) {
            // Save the new user message immediately
            await this.memory.save({ threadId, role: 'user', content: prompt });

            // Retrieve full history
            const history = await this.memory.query({ threadId });
            
            // Format for Gemini API (Content[])
            contents = history.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }]
            }));
        } else {
            // Stateless mode
            contents = [{ role: 'user', parts: [{ text: prompt }] }];
        }

        const config: any = {
            systemInstruction: this.instructions
        };
        
        // Map Mastra tool abstract to Google GenAI tool config
        if (this.tools?.googleSearch) {
            config.tools = [{ googleSearch: {} }];
        }

        try {
            const result = await ai.models.generateContentStream({
                model: this.model.name,
                contents: contents,
                config: config
            });

            // 2. Wrap the stream to intercept and save the AI response to memory
            const memory = this.memory;
            
            async function* streamWrapper() {
                let fullResponse = "";
                for await (const chunk of result) {
                    const text = chunk.text || "";
                    fullResponse += text;
                    yield chunk;
                }
                
                // Save AI completion to memory after stream ends
                if (memory && threadId) {
                    await memory.save({ threadId, role: 'model', content: fullResponse });
                }
            }

            return streamWrapper();

        } catch (error) {
            console.error("Mastra Agent Execution Error:", error);
            throw error;
        }
    }
}
