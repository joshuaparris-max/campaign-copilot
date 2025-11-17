import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { importCampaignData } from '../src/utils/exportData';
import { validateCampaignData, computeConflicts, resolveMerge } from '../src/utils/importUtils';
import { loadCampaigns, loadQuests, loadNPCs, loadCharacterProfile, saveCampaigns, saveQuests, saveNPCs, saveCharacterProfile } from '../src/storage';

const fixturePath = path.resolve(__dirname, './fixtures/default-campaign-1763351446982.json');

beforeEach(() => {
  // Ensure minimal localStorage shim
  if (typeof globalThis.localStorage === 'undefined' || globalThis.localStorage === null) {
    const store: Record<string, string> = {};
    globalThis.localStorage = {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => { store[k] = String(v); },
      removeItem: (k: string) => { delete store[k]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    } as any;
  }
  localStorage.clear();
});

describe('Merge behavior with collisions', () => {
  it('detects collisions and preserves both existing and imported items after merge', () => {
    // Prepare existing storage that will collide with fixture quest and NPC IDs
    const existingCampaign = { id: 'existing-campaign-1', name: 'Existing Campaign', createdAt: Date.now(), updatedAt: Date.now() };
    const existingQuest = {
      id: '63088d41-f27d-4a81-9b1d-fcdafe43c6b5', // same as fixture quest id
      title: 'Existing Quest',
      location: 'x',
      description: 'existing',
      status: 'Open',
      campaignId: existingCampaign.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const existingNPC = {
      id: 'b45ccc7c-3894-412d-9108-359f01847ac5', // same as fixture npc id
      name: 'Existing NPC',
      role: 'old',
      location: 'x',
      notes: 'existing',
      campaignId: existingCampaign.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    saveCampaigns([existingCampaign]);
    saveQuests([existingQuest as any]);
    saveNPCs([existingNPC as any]);

    const text = fs.readFileSync(fixturePath, 'utf-8');
    const data = importCampaignData(text)!;
    expect(data).toBeTruthy();

    // Validate and compute conflicts against existing storage
    const validation = validateCampaignData(data as unknown);
    expect(validation.valid).toBe(true);

    const conflicts = computeConflicts(data);
    expect(conflicts.questsConflicts).toBeGreaterThan(0);
    expect(conflicts.npcsConflicts).toBeGreaterThan(0);

    // Resolve merge (should rename colliding IDs)
    const resolved = resolveMerge(data);

    // Persist resolved
    saveCampaigns([resolved.campaign]);
    saveQuests(resolved.quests || []);
    saveNPCs(resolved.npcs || []);
    if (resolved.characterProfile) saveCharacterProfile(resolved.characterProfile);

    const storedQuests = loadQuests();
    const storedNPCs = loadNPCs();

    // Expect both existing and imported quests present (IDs should not collide)
    expect(storedQuests.length).toBe(2);
    expect(storedNPCs.length).toBe(2);

    // Ensure IDs are distinct
    const questIds = storedQuests.map(q => q.id);
    const npcIds = storedNPCs.map(n => n.id);
    expect(new Set(questIds).size).toBe(2);
    expect(new Set(npcIds).size).toBe(2);
  });
});
