// Campaign Copilot TypeScript Types

export interface CampaignLocation {
  id: string;
  name: string;
  description?: string;
}

export interface Quest {
  id: string;
  title: string;
  location: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  description?: string;
  createdAt: number;
  updatedAt: number;
}

export interface NPC {
  id: string;
  name: string;
  role: string;
  location: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface BusinessIdea {
  id: string;
  title: string;
  location: string;
  description?: string;
  status?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SessionNote {
  id: string;
  text: string;
  location?: string;
  timestamp: number;
}

export interface SessionContext {
  text: string;
  currentLocationName?: string;
  openQuests: Quest[];
  npcs: NPC[];
}

export interface NextOption {
  id: string;
  title: string;
  bullets: string[];
}
