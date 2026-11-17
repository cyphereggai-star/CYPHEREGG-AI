import type { GenerationMode, Language } from '@/lib/types';
import { generateCode } from '@/lib/ai/generators';
import { formatReport } from '@/lib/ai/analyzer';
import { chatReply } from '@/lib/ai/chatbot';

interface GenInput {
  mode: GenerationMode;
  language: Language;
  prompt: string;
}

/**
 * CypherEgg AI — fully offline generation engine.
 * No external API calls, no API keys, no network dependencies.
 * Uses built-in heuristic intent detection, kind-aware code
 * templates, and a 25+ rule security analyzer.
 */
export function generateOutput({ mode, language, prompt }: GenInput): string {
  if (mode === 'analyze') {
    return formatReport(prompt);
  }
  return generateCode(prompt, language);
}

/** Echo support bot — fully offline conversational engine. */
export function botReply(message: string): string {
  return chatReply(message);
}
