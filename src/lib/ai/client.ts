import OpenAI from "openai";

/**
 * AI client wrapper.
 *
 * If OPENAI_API_KEY is set we use the real API with JSON-mode. If not, every
 * generator falls back to a deterministic mock so the product works end-to-end
 * without external credentials (useful for demos, CI, and offline dev).
 */

let client: OpenAI | null = null;

export function getOpenAI(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

export const AI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

export function aiEnabled() {
  return Boolean(process.env.OPENAI_API_KEY);
}

/**
 * Call OpenAI with JSON mode and parse the result as type T. The system prompt
 * is expected to instruct the model to return strict JSON.
 */
export async function generateJSON<T>(opts: {
  system: string;
  user: string;
  model?: string;
  temperature?: number;
}): Promise<{ data: T; model: string }> {
  const openai = getOpenAI();
  if (!openai) throw new Error("OpenAI not configured");

  const model = opts.model ?? AI_MODEL;
  const completion = await openai.chat.completions.create({
    model,
    temperature: opts.temperature ?? 0.4,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.user },
    ],
  });

  const content = completion.choices[0]?.message?.content ?? "{}";
  return { data: JSON.parse(content) as T, model };
}
