import 'dotenv/config';
import type { SessionContext, NextOption } from '../../src/types';

const GROQ_BASE_URL = process.env.GROQ_BASE_URL ?? 'https://api.groq.com/openai/v1';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile';

if (!GROQ_API_KEY) {
  // Do not throw here to allow fallback to other providers; caller should check
}

export interface GroqChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function getNextOptionsFromGroq(context: SessionContext): Promise<NextOption[]> {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured');
  }

  const messages: GroqChatMessage[] = [
    {
      role: 'system',
      content:
        'You are an assistant helping a D&D 5e player think of the next 3 best options in the current situation. ' +
        'Respond ONLY as a JSON array of exactly 3 objects: [{ "id": string, "title": string, "bullets": string[] }].',
    },
    {
      role: 'user',
      content: `Current location: ${context.currentLocationName || 'Unknown'}\n\n\nLatest development: ${context.text}`,
    },
  ];

  const url = `${GROQ_BASE_URL}/chat/completions`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error: ${res.status} ${res.statusText} – ${errText}`);
  }

  const data = await res.json();

  const raw = data.choices?.[0]?.message?.content?.trim() ?? data.choices?.[0]?.text?.trim() ?? '[]';

  let parsed: NextOption[] = [];
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    // Fallback: include the raw content as a single fallback option
    parsed = [
      {
        id: 'fallback-1',
        title: 'Review the situation',
        bullets: [raw],
      },
    ];
  }

  // Normalize to NextOption[] and ensure bullets field exists
  const normalized = (parsed || []).slice(0, 3).map((p: any, idx: number) => ({
    id: p.id || String(idx + 1),
    title: p.title || p.name || `Option ${idx + 1}`,
    bullets: Array.isArray(p.bullets) ? p.bullets : (Array.isArray(p.details) ? p.details : [String(p.details || p.explanation || '')]),
  }));

  return normalized;
}

export default getNextOptionsFromGroq;
