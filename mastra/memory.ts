
export interface MemoryMessage {
    role: 'user' | 'model';
    content: string;
}

export interface ThreadMetadata {
    id: string;
    title: string;
    updatedAt: number;
    preview: string;
}

export class Memory {
    private store: Map<string, MemoryMessage[]> = new Map();
    private metadata: Map<string, ThreadMetadata> = new Map();

    /**
     * Retrieves the conversation history for a specific thread.
     */
    async query({ threadId }: { threadId: string }): Promise<MemoryMessage[]> {
        return this.store.get(threadId) || [];
    }

    /**
     * Saves a message (user or model) to the thread history.
     * Automatically creates metadata if it doesn't exist.
     */
    async save({ threadId, role, content }: { threadId: string; role: 'user' | 'model'; content: string }) {
        const history = this.store.get(threadId) || [];
        history.push({ role, content });
        this.store.set(threadId, history);

        // Update Metadata
        const existingMeta = this.metadata.get(threadId);
        
        // Generate a title if it's the first user message
        let title = existingMeta?.title || "New Chat";
        let preview = existingMeta?.preview || "";

        if (role === 'user') {
            if (!existingMeta || title === "New Chat") {
                title = content.slice(0, 40) + (content.length > 40 ? "..." : "");
            }
            preview = content.slice(0, 60);
        }

        this.metadata.set(threadId, {
            id: threadId,
            title,
            preview,
            updatedAt: Date.now()
        });
    }

    /**
     * Returns a sorted list of all chat sessions.
     */
    async getThreads(): Promise<ThreadMetadata[]> {
        return Array.from(this.metadata.values()).sort((a, b) => b.updatedAt - a.updatedAt);
    }

    /**
     * Clears history for a thread (optional utility)
     */
    async clear(threadId: string) {
        this.store.delete(threadId);
        this.metadata.delete(threadId);
    }
}
