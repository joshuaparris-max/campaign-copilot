// LocalStorage helper for Campaign Copilot
import type { Quest, NPC, BusinessIdea, SessionNote } from './types';

const STORAGE_KEYS = {
  QUESTS: 'campaign-copilot-quests',
  NPCS: 'campaign-copilot-npcs',
  BUSINESS_IDEAS: 'campaign-copilot-business-ideas',
  SESSION_NOTES: 'campaign-copilot-session-notes',
  CURRENT_LOCATION: 'campaign-copilot-current-location',
} as const;

// Generic storage helpers
function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save to localStorage (${key}):`, error);
  }
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Failed to load from localStorage (${key}):`, error);
    return defaultValue;
  }
}

// Quest storage
export function saveQuests(quests: Quest[]): void {
  saveToStorage(STORAGE_KEYS.QUESTS, quests);
}

export function loadQuests(): Quest[] {
  return loadFromStorage<Quest[]>(STORAGE_KEYS.QUESTS, []);
}

// NPC storage
export function saveNPCs(npcs: NPC[]): void {
  saveToStorage(STORAGE_KEYS.NPCS, npcs);
}

export function loadNPCs(): NPC[] {
  return loadFromStorage<NPC[]>(STORAGE_KEYS.NPCS, []);
}

// Business Ideas storage
export function saveBusinessIdeas(businessIdeas: BusinessIdea[]): void {
  saveToStorage(STORAGE_KEYS.BUSINESS_IDEAS, businessIdeas);
}

export function loadBusinessIdeas(): BusinessIdea[] {
  return loadFromStorage<BusinessIdea[]>(STORAGE_KEYS.BUSINESS_IDEAS, []);
}

// Session Notes storage (keep last 10)
export function saveSessionNote(note: SessionNote): void {
  const notes = loadSessionNotes();
  const updated = [note, ...notes].slice(0, 10); // Keep last 10
  saveToStorage(STORAGE_KEYS.SESSION_NOTES, updated);
}

export function loadSessionNotes(): SessionNote[] {
  return loadFromStorage<SessionNote[]>(STORAGE_KEYS.SESSION_NOTES, []);
}

// Current location storage
export function saveCurrentLocation(location: string): void {
  saveToStorage(STORAGE_KEYS.CURRENT_LOCATION, location);
}

export function loadCurrentLocation(): string {
  return loadFromStorage<string>(STORAGE_KEYS.CURRENT_LOCATION, '');
}
