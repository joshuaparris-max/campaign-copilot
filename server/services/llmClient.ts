import type { SessionContext, NextOption } from '../../src/types';
import getNextOptionsFromGroq from './groqClient';
import { callOpenAI } from './openaiClient';

/**
 * callLLM: provider-agnostic helper. Prefers GROQ when GROQ_API_KEY is present,
 * otherwise falls back to OpenAI. Throws if neither provider is configured.
 */
export async function callLLM(context: SessionContext): Promise<NextOption[]> {
  if (process.env.GROQ_API_KEY) {
    try {
      return await getNextOptionsFromGroq(context as any);
    } catch (err) {
      console.warn('Groq request failed, falling back to OpenAI:', err);
      // fallthrough to OpenAI attempt
    }
  }

  if (process.env.OPENAI_API_KEY) {
    return await callOpenAI(context as any);
  }

  throw new Error('No LLM provider configured (set GROQ_API_KEY or OPENAI_API_KEY)');
}

export default callLLM;
