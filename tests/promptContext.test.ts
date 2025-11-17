import { describe, it, expect } from 'vitest';
import { buildPromptContext } from '../server/services/openaiClient';

describe('buildPromptContext', () => {
  it('produces valid JSON with expected keys', () => {
    const ctx = {
      sessionId: 's1',
      mode: 'investigate-lead',
      currentLocationName: 'Seahaven',
      text: 'A boat washed ashore',
      characterProfile: { id: 'c1', name: 'Test', classAndLevel: 'Paladin 3', race: 'Human', summary: 'Brave', dndBeyondUrl: '' },
      openQuests: [{ id: 'q1', title: 'Find the ring', status: 'Open', location: 'Seahaven' }],
      openLeads: [{ id: 'l1', title: 'Strange footprints', importance: 2 }],
      npcs: [{ id: 'n1', name: 'Fisherman', role: 'NPC', location: 'Harbour' }],
      recentEvents: [{ id: 'e1', mode: 'default', text: 'They saw smoke on the horizon' }]
    } as any;

    const json = buildPromptContext(ctx);
    const parsed = JSON.parse(json);

    expect(parsed).toHaveProperty('id', 's1');
    expect(parsed).toHaveProperty('mode', 'investigate-lead');
    expect(parsed).toHaveProperty('location', 'Seahaven');
    expect(parsed).toHaveProperty('text');
    expect(parsed).toHaveProperty('character');
    expect(parsed.openQuests).toBeInstanceOf(Array);
    expect(parsed.npcs).toBeInstanceOf(Array);
    expect(parsed.recentEvents).toBeInstanceOf(Array);
  });
});
