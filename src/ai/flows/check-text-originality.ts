// file: src/ai/flows/check-text-originality.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for checking the originality of a given text using AI.
 *
 * The flow calculates an AI percentage score indicating the likelihood of the text being AI-generated.
 *
 * @interface CheckTextOriginalityInput - The input type for the checkTextOriginality function.
 * @interface CheckTextOriginalityOutput - The output type for the checkTextOriginality function.
 *
 * @function checkTextOriginality - The main function to initiate the text originality check flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckTextOriginalityInputSchema = z.object({
  text: z
    .string()
    .max(3000)
    .describe('The text to check for originality (maximum 3000 characters).'),
});
export type CheckTextOriginalityInput = z.infer<typeof CheckTextOriginalityInputSchema>;

const CheckTextOriginalityOutputSchema = z.object({
  aiPercentage: z
    .number()
    .min(0)
    .max(100)
    .describe('The percentage (0-100) indicating the likelihood of the text being AI-generated.'),
});
export type CheckTextOriginalityOutput = z.infer<typeof CheckTextOriginalityOutputSchema>;

export async function checkTextOriginality(input: CheckTextOriginalityInput): Promise<CheckTextOriginalityOutput> {
  return checkTextOriginalityFlow(input);
}

const checkOriginalityPrompt = ai.definePrompt({
  name: 'checkOriginalityPrompt',
  input: { schema: CheckTextOriginalityInputSchema },
  output: { schema: CheckTextOriginalityOutputSchema },
  prompt: `You are an expert in detecting AI-generated text. Analyze the following text and determine the probability that it was written by an AI.
  
Provide your answer as a percentage from 0 to 100, where 0% means it is definitely human-written and 100% means it is definitely AI-generated.

Your response must be in the requested JSON format.

Text to analyze:
{{{text}}}
`,
});

const checkTextOriginalityFlow = ai.defineFlow(
  {
    name: 'checkTextOriginalityFlow',
    inputSchema: CheckTextOriginalityInputSchema,
    outputSchema: CheckTextOriginalityOutputSchema,
  },
  async input => {
    if (!input.text.trim()) {
      return { aiPercentage: 0 };
    }

    try {
      const { output } = await checkOriginalityPrompt(input);
      if (!output) {
        console.error("The AI model did not return a valid output.");
        return { aiPercentage: 0 };
      }
      return output;
    } catch (error) {
      console.error("An error occurred while checking text originality:", error);
      return { aiPercentage: 0 };
    }
  }
);
