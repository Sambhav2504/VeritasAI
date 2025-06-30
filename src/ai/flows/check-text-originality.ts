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
import {cosineSimilarity} from '@/lib/similarity';

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

// This function now uses a proper embedding model.
async function embedText(text: string): Promise<number[] | null> {
  try {
    const result = await ai.embed({
      model: 'googleai/text-embedding-004',
      content: text,
    });
    if (!result?.embedding) {
      console.error('Failed to get embedding for text. This can be caused by a missing API key or a service issue.');
      return null;
    }
    return result.embedding;
  } catch (e) {
    console.error("Error during embedding:", e);
    return null;
  }
}


const checkTextOriginalityFlow = ai.defineFlow(
  {
    name: 'checkTextOriginalityFlow',
    inputSchema: CheckTextOriginalityInputSchema,
    outputSchema: CheckTextOriginalityOutputSchema,
  },
  async input => {
    // Sample texts for comparison.
    const aiText1 = 'This is a sample AI-generated text. It is created by a large language model and may not be original.';
    const aiText2 = 'Another example of text produced by AI. This content was generated programmatically.';
    const humanText = 'This is a sample of human-written text. I wrote this myself, with my own thoughts and ideas.';

    const [aiEmbedding1, aiEmbedding2, humanEmbedding, inputEmbedding] = await Promise.all([
      embedText(aiText1),
      embedText(aiText2),
      embedText(humanText),
      embedText(input.text),
    ]);

    if (!inputEmbedding || !aiEmbedding1 || !aiEmbedding2 || !humanEmbedding) {
      console.warn("Could not generate all embeddings. Returning 0% AI score. This might be due to a missing API key.");
      return { aiPercentage: 0 };
    }

    const similarityToAI1 = cosineSimilarity(inputEmbedding, aiEmbedding1);
    const similarityToAI2 = cosineSimilarity(inputEmbedding, aiEmbedding2);
    const similarityToHuman = cosineSimilarity(inputEmbedding, humanEmbedding);

    // Simple averaging of AI similarities
    const aiSimilarity = (similarityToAI1 + similarityToAI2) / 2;

    // Normalize similarities from [-1, 1] to [0, 1] to avoid issues with negative numbers.
    const normalizedAiSimilarity = (aiSimilarity + 1) / 2;
    const normalizedHumanSimilarity = (similarityToHuman + 1) / 2;
    
    let aiPercentage = 0;
    if (normalizedAiSimilarity + normalizedHumanSimilarity > 0) {
        aiPercentage = (normalizedAiSimilarity / (normalizedAiSimilarity + normalizedHumanSimilarity)) * 100;
    }

    return {aiPercentage: Math.round(aiPercentage)};
  }
);
