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
  prompt: `You are an expert at rewriting text to make it sound completely human. Your goal is to make the text undetectable by AI plagiarism checkers, effectively reaching a 0% AI score.

Paraphrase the given text by following these rules:
1.  **Simplify Vocabulary**: Replace complex or overly formal words with common, everyday language. Avoid jargon.
2.  **Vary Sentence Structure**: Break up long sentences and combine short ones. Change the starting words of sentences.
3.  **Inject a Human Tone**: Introduce slight imperfections, personal voice, or common conversational phrases. Make it sound like a person talking, not a machine writing.
4.  **Preserve Core Meaning**: The essential message of the original text must not be changed.

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
