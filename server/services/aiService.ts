// AI Service for Campaign Copilot
// Handles OpenAI API calls with rule-based fallback
import type { SessionContext, NextOption } from '../../src/types';
import { generateNextOptions } from '../../src/logic/nextOptionsEngine';
import { callLLM } from './llmClient';

/**
 * Gets next options using OpenAI if available, otherwise falls back to rule-based engine
 */
export async function getNextOptions(context: SessionContext): Promise<NextOption[]> {
  // Try LLM provider (Groq preferred, falls back to OpenAI)
  try {
    const options = await callLLM(context as any);
    if (options && options.length > 0) {
      return options.map(opt => ({ ...opt, source: 'llm' as const }));
    }
  } catch (error) {
    console.warn('LLM call failed, falling back to rules:', error instanceof Error ? error.message : error);
  }

  // Fallback to rule-based engine
  const ruleOptions = generateNextOptions(context);
  return ruleOptions.map(opt => ({ ...opt, source: 'rules-fallback' as const }));
}

