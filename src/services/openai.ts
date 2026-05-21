import OpenAI from 'openai';
import { config } from '../config.js';

export const openai = new OpenAI({
  apiKey: config.openai.apiKey,
  organization: config.openai.orgKey,
});

export async function chatComplete(prompt: string, opts?: { system?: string; maxTokens?: number }) {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  if (opts?.system) {
    messages.push({ role: 'system', content: opts.system });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await openai.chat.completions.create({
    model: config.openai.model,
    messages,
    max_tokens: opts?.maxTokens ?? 450,
  });

  return response.choices[0]?.message?.content ?? '';
}
