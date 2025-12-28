
import { SavedSession } from "../types";

const STORAGE_KEY = 'open_marker_sessions';

export const getStoredSessions = (): SavedSession[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.sort((a, b) => b.updatedAt - a.updatedAt) : [];
  } catch (e) {
    console.error("Failed to load sessions", e);
    return [];
  }
};

export const saveSessionToStorage = (session: SavedSession) => {
  try {
    const sessions = getStoredSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.unshift(session);
    }
    
    // Sort by newest
    sessions.sort((a, b) => b.updatedAt - a.updatedAt);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.error("Failed to save session", e);
  }
};

export const deleteSessionFromStorage = (sessionId: string) => {
  try {
    const sessions = getStoredSessions().filter(s => s.id !== sessionId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    return sessions;
  } catch (e) {
    console.error("Failed to delete session", e);
    return [];
  }
};
