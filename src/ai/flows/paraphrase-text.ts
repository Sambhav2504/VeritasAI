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
  prompt: `You are an expert in rewriting and paraphrasing. Your primary goal is to take the given text and rewrite it so that it passes AI detection tools and appears completely human-written. The resulting text should have a 0% AI-generated score when analyzed.

Rewrite the following text to make it sound natural, human, and undetectable by AI detectors. Change sentence structures, use varied vocabulary, and alter the tone to be less formal and more engaging, while preserving the original meaning.

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
    const {output} = await paraphraseTextPrompt(input);
    return output!;
  }
);
