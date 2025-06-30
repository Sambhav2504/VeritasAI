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
  prompt: `You are an expert editor who transforms robotic-sounding text into prose that is vibrant, natural, and unmistakably human. Your goal is to rewrite the given text so it would pass any AI detection test with a score of 0%.

To do this, focus on these key techniques:
1.  **Vary Sentence Structure:** Mix short, direct sentences with longer, more flowing ones. Avoid repetitive sentence beginnings.
2.  **Use a Natural Tone:** Incorporate contractions (like \`it's\`, \`don't\`, \`you're\`) and a slightly less formal vocabulary. Make it sound like a person talking.
3.  **Simplify Language:** Replace complex or jargon-heavy words with simpler, more common alternatives.
4.  **Maintain Core Meaning:** The essence and key information of the original text must be preserved perfectly.

Rewrite the following text. Your response must be in the requested JSON format, with the rewritten text in the 'paraphrasedText' field. Do not add any commentary.

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
