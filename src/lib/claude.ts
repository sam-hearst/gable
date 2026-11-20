// One structured-output call to Claude, shared by search (src/lib/search.ts)
// and paste-to-list (src/lib/paste-post.ts). Server only: it reads
// ANTHROPIC_API_KEY, which must never reach the browser (no NEXT_PUBLIC_).
//
// Returns the parsed JSON, or null when there's no key, the call fails, it
// runs past `timeoutMs`, or the answer was cut off. Callers fall back on null.

import Anthropic from "@anthropic-ai/sdk";

export const CLAUDE_MODEL = "claude-haiku-5-5";

export async function askClaudeForJson({
  system,
  schema,
  content,
  timeoutMs,
  maxTokens,
  label,
}: {
  system: string;
  schema: Record<string, unknown>;
  content: string;
  timeoutMs: number;
  maxTokens: number;
  label: string; // for the server log, e.g. "[search]"
}): Promise<unknown | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: timeoutMs, maxRetries: 0 });
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), timeoutMs);
  try {
    const response = await client.messages.create(
      {
        model: CLAUDE_MODEL,
        max_tokens: maxTokens,
        thinking: { type: "disabled" },
        output_config: { effort: "low", format: { type: "json_schema", schema } },
        system,
        messages: [{ role: "user", content }],
      },
      { signal: abort.signal },
    );
    if (response.stop_reason !== "end_turn") return null;
    const text = response.content.find((b) => b.type === "text")?.text;
    return text ? JSON.parse(text) : null;
  } catch (error) {
    // Logged on the server only; the caller falls back.
    console.warn(`${label} Claude call failed:`, error instanceof Error ? error.message : error);
    return null;
  } finally {
    clearTimeout(timer);
  }
}
