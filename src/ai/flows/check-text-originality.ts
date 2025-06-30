// file: src/ai/flows/check-text-originality.ts
import { ai } from '@/ai/genkit';
import { z } from 'zod';                    // ← use zod directly
// 'use server' removed

/* ─── Schemas ─────────────────────────────────────────── */
const InputSchema = z.object({
  text: z.string().max(3000, 'Max 3000 chars'),
});
export type CheckTextOriginalityInput = z.infer<typeof InputSchema>;

const OutputSchema = z.object({
  aiPercentage: z.number().min(0).max(100),
});
export type CheckTextOriginalityOutput = z.infer<typeof OutputSchema>;

/* ─── Prompt ──────────────────────────────────────────── */
const checkOriginalityPrompt = ai.definePrompt({
  name: 'checkOriginalityPrompt',
  input: { schema: InputSchema },
  output: { schema: OutputSchema },
  prompt: `
You are an AI-detection specialist…
After analysis return **ONLY**: {"aiPercentage": <number 0‑100>}

Text:
{{{text}}}
`,
});

/* ─── Flow ────────────────────────────────────────────── */
export const checkTextOriginalityFlow = ai.defineFlow(
  {
    name: 'checkTextOriginalityFlow',
    inputSchema: InputSchema,
    outputSchema: OutputSchema,
  },
  async ({ text }) => {
    if (!text.trim()) return { aiPercentage: 0 };

    try {
      const { output } = await checkOriginalityPrompt({ text });
      return output ?? { aiPercentage: 0 };
    } catch (err) {
      console.error('Originality check failed:', err);
      return { aiPercentage: 0 };
    }
  }
);

/* Optional helper so other TS files can call it easily */
export async function checkTextOriginality(input: CheckTextOriginalityInput) {
  return checkTextOriginalityFlow(input);
}
