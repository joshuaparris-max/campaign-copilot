// AI Client abstraction for Campaign Copilot
// TODO: In a future version, wire up real LLM here (e.g. OpenAI API)
import type { SessionContext, NextOption } from './types';

/**
 * Generates 3 next options based on session context.
 * Currently uses simple rule-based logic as a placeholder.
 * 
 * @param ctx - Session context including text, location, quests, and NPCs
 * @returns Promise resolving to 3 next options
 */
export async function getNextOptions(ctx: SessionContext): Promise<NextOption[]> {
  // TODO: wire up real LLM here
  // For now, use simple rule-based suggestions
  
  const text = ctx.text.toLowerCase();
  const options: NextOption[] = [];

  // Rule 1: Check for keywords in text
  if (text.includes('ship') || text.includes('captain') || text.includes('crew')) {
    options.push({
      id: '1',
      title: 'Investigate the Ship Situation',
      bullets: [
        'Talk to the captain about recent events',
        'Check the crew roster and see who\'s missing',
        'Inspect the ship for any suspicious activity'
      ]
    });
  }

  if (text.includes('missing') || text.includes('disappeared') || text.includes('gone')) {
    options.push({
      id: '2',
      title: 'Follow Up on Missing Persons',
      bullets: [
        'Ask NPCs about recent disappearances',
        'Check the quest log for related investigations',
        'Gather information from guards or authorities'
      ]
    });
  }

  if (text.includes('business') || text.includes('venture') || text.includes('shop')) {
    options.push({
      id: '3',
      title: 'Develop Business Venture',
      bullets: [
        'Review business ideas in your notes',
        'Talk to relevant NPCs about partnerships',
        'Check what resources or permits you need'
      ]
    });
  }

  if (text.includes('spell') || text.includes('magic') || text.includes('cast')) {
    options.push({
      id: '4',
      title: 'Consider Spell or Class Feature',
      bullets: [
        'Review your available spells and abilities',
        'Think about the situation and what might help',
        'Ask the DM about spell interactions'
      ]
    });
  }

  // Rule 2: Check open quests
  if (ctx.openQuests.length > 0) {
    const openQuest = ctx.openQuests.find(q => q.status === 'Open');
    if (openQuest) {
      options.push({
        id: '5',
        title: `Follow Up on Quest: ${openQuest.title}`,
        bullets: [
          `Location: ${openQuest.location}`,
          'Review quest details and objectives',
          'Talk to NPCs related to this quest'
        ]
      });
    }
  }

  // Rule 3: Default suggestions if nothing specific
  if (options.length === 0) {
    options.push(
      {
        id: '6',
        title: 'Investigate Current Location',
        bullets: [
          `Explore ${ctx.currentLocationName || 'the area'}`,
          'Talk to local NPCs for information',
          'Look for clues or interesting locations'
        ]
      },
      {
        id: '7',
        title: 'Review Your Notes',
        bullets: [
          'Check your quest log for open items',
          'Review NPC relationships and information',
          'Update your notes with recent developments'
        ]
      },
      {
        id: '8',
        title: 'Ask the DM a Question',
        bullets: [
          'Clarify something about the current situation',
          'Ask about environmental details',
          'Inquire about character knowledge or history'
        ]
      }
    );
  }

  // Always return exactly 3 options
  return options.slice(0, 3).map((opt, idx) => ({
    ...opt,
    id: String(idx + 1)
  }));
}
