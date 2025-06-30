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
  prompt: `You are an expert content rewriter. Your task is to paraphrase the following text to make it sound completely human-written and original, aiming for a 0% AI detection score.

Rewrite the text by significantly altering sentence structures, using a wider and more natural vocabulary, and adjusting the tone to be less formal and more engaging. Ensure the core meaning of the original text is fully preserved.

Your response MUST be in the requested JSON format, containing only the paraphrased text in the 'paraphrasedText' field. Do not add any extra commentary or introduction.

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
