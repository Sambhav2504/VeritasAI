'use server';

/**
 * @fileOverview An AI agent for paraphrasing text input.
 *
 * - paraphraseText - A function that handles the paraphrasing process.
 * - ParaphraseTextInput - The input type for the paraphraseText function.
 * - ParaphraseTextOutput - The return type for the paraphraseText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParaphraseTextInputSchema = z.object({
  text: z.string().describe('The text to paraphrase.'),
});
export type ParaphraseTextInput = z.infer<typeof ParaphraseTextInputSchema>;

const ParaphraseTextOutputSchema = z.object({
  paraphrasedText: z.string().describe('The paraphrased text.'),
});
export type ParaphraseTextOutput = z.infer<typeof ParaphraseTextOutputSchema>;

export async function paraphraseText(input: ParaphraseTextInput): Promise<ParaphraseTextOutput> {
  return paraphraseTextFlow(input);
}

const paraphraseTextPrompt = ai.definePrompt({
  name: 'paraphraseTextPrompt',
  input: {schema: ParaphraseTextInputSchema},
  output: {schema: ParaphraseTextOutputSchema},
  prompt: `You are a master of disguise for text. Your one and only mission is to rewrite the following text so that it appears 100% human-written and would receive a score of 0% from an AI detection tool.

To achieve this, you must:
- Radically alter sentence structures.
- Substitute common words for any jargon or complex vocabulary.
- Infuse a natural, slightly informal, and personal tone.
- Ensure the original meaning is perfectly intact.

Do not just swap out a few words. The final text should be fundamentally different in style from the original, as if written by a completely different person.

Your response MUST be in the requested JSON format, containing only the rewritten text in the 'paraphrasedText' field. Do not include any explanations or introductory phrases.

Original text:
{{{text}}}`,
});

const paraphraseTextFlow = ai.defineFlow(
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
      // Ensure we always return a valid object, even if the model fails.
      // Fallback to original text to prevent clearing the user's input.
      if (!output?.paraphrasedText) {
        console.error("The AI model did not return a valid paraphrased text. Falling back to original text.");
        return { paraphrasedText: input.text };
      }
      return output;
    } catch (error) {
      console.error("An error occurred during paraphrasing:", error);
      // Fallback to original text on any error
      return { paraphrasedText: input.text };
    }
  }
);
