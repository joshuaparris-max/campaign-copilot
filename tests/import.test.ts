import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { importCampaignData } from '../src/utils/exportData';
import { validateCampaignData, computeConflicts, resolveMerge } from '../src/utils/importUtils';
import { loadCampaigns, loadQuests, loadNPCs, loadCharacterProfile, saveCampaigns, saveQuests, saveNPCs, saveCharacterProfile } from '../src/storage';

// Use fixture
const fixturePath = path.resolve(__dirname, './fixtures/default-campaign-1763351446982.json');

beforeEach(() => {
  // Ensure a localStorage exists (jsdom may not be available in some environments)
  if (typeof globalThis.localStorage === 'undefined' || globalThis.localStorage === null) {
    const store: Record<string, string> = {};
    globalThis.localStorage = {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => { store[k] = String(v); },
      removeItem: (k: string) => { delete store[k]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    } as any;
  }
  // Clear localStorage in jsdom between tests
  localStorage.clear();
});

describe('Import flow', () => {
  it('parses fixture, validates, computes no conflicts on empty storage, persists and reads back', () => {
    const text = fs.readFileSync(fixturePath, 'utf-8');
    const data = importCampaignData(text);
    expect(data).toBeTruthy();

    const validation = validateCampaignData(data as unknown);
    expect(validation.valid).toBe(true);

    const conflicts = computeConflicts(data!);
    expect(conflicts.questsConflicts).toBe(0);
    expect(conflicts.npcsConflicts).toBe(0);

    // Simulate merge resolution and persist
    const resolved = resolveMerge(data!);
    // Persist using storage helpers
    saveCampaigns([resolved.campaign]);
    saveQuests(resolved.quests || []);
    saveNPCs(resolved.npcs || []);
    if (resolved.characterProfile) saveCharacterProfile(resolved.characterProfile);

    const storedCampaigns = loadCampaigns();
    const storedQuests = loadQuests();
    const storedNPCs = loadNPCs();
    const storedCharacter = loadCharacterProfile();

    expect(storedCampaigns.length).toBe(1);
    expect(storedCampaigns[0].id).toBe(resolved.campaign.id);
    expect(storedQuests.length).toBe((resolved.quests || []).length);
    expect(storedNPCs.length).toBe((resolved.npcs || []).length);
    if (resolved.characterProfile) {
      expect(storedCharacter).not.toBeNull();
      expect(storedCharacter!.id).toBe(resolved.characterProfile.id);
    }
  });
});
