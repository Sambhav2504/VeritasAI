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
  prompt: `You are a sophisticated writing assistant. Your task is to paraphrase the given text to enhance its originality and style, while preserving the core meaning. Make subtle but significant changes to sentence structure, vocabulary, and tone. Avoid making the text sound robotic or unnatural. The goal is to create a version that would be perceived as more human-written.

Paraphrase the following text:

{{{text}}}`,
});

const paraphraseTextFlow = ai.defineFlow(
  {
    name: 'paraphraseTextFlow',
    inputSchema: ParaphraseTextInputSchema,
    outputSchema: ParaphraseTextOutputSchema,
  },
  async input => {
    const {output} = await paraphraseTextPrompt(input);
    return output!;
  }
);
