// src/ai/flows/paraphrase-text.ts

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ParaphraseTextInputSchema = z.object({
  text: z.string().describe('The text to paraphrase.'),
});
export type ParaphraseTextInput = z.infer<typeof ParaphraseTextInputSchema>;

const ParaphraseTextOutputSchema = z.object({
  paraphrasedText: z.string().describe('The paraphrased text.'),
});
export type ParaphraseTextOutput = z.infer<typeof ParaphraseTextOutputSchema>;

const paraphraseTextPrompt = ai.definePrompt({
  name: 'paraphraseTextPrompt',
  input: { schema: ParaphraseTextInputSchema },
  output: { schema: ParaphraseTextOutputSchema },
  prompt: `
You are an expert editor... (same as before)
Original text:
{{{text}}}
`,
});

export const paraphraseTextFlow = ai.defineFlow(
  {
    name: 'paraphraseTextFlow',
    inputSchema: ParaphraseTextInputSchema,
    outputSchema: ParaphraseTextOutputSchema,
  },
  async input => {
    if (!input.text.trim()) {
      return { paraphrasedText: "" };
    }

    try {
      const { output } = await paraphraseTextPrompt(input);
      return output?.paraphrasedText
        ? output
        : { paraphrasedText: input.text };
    } catch (error) {
      console.error("Paraphrasing failed:", error);
      return { paraphrasedText: input.text };
    }
  }
);

// Optional wrapper for calling in TS
export async function paraphraseText(input: ParaphraseTextInput) {
  return paraphraseTextFlow(input);
}
