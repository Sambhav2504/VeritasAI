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

const embedText = ai.definePrompt({
  name: 'embedText',
  input: {schema: z.object({text: z.string()})},
  output: {schema: z.object({embedding: z.array(z.number())})},
  prompt: `Embed the following text: {{{text}}}`,
});

const checkTextOriginalityFlow = ai.defineFlow(
  {
    name: 'checkTextOriginalityFlow',
    inputSchema: CheckTextOriginalityInputSchema,
    outputSchema: CheckTextOriginalityOutputSchema,
  },
  async input => {
    // Sample embeddings (replace with actual AI-generated text embeddings)
    const aiText1 = 'This is a sample AI-generated text.';
    const aiText2 = 'Another example of text produced by AI.';
    const humanText = 'This is a sample of human-written text.';

    const [aiEmbedding1Response, aiEmbedding2Response, humanEmbeddingResponse] = await Promise.all([
      embedText({text: aiText1}),
      embedText({text: aiText2}),
      embedText({text: humanText}),
    ]);

    const aiEmbedding1 = aiEmbedding1Response.output!.embedding;
    const aiEmbedding2 = aiEmbedding2Response.output!.embedding;
    const humanEmbedding = humanEmbeddingResponse.output!.embedding;

    const inputEmbeddingResponse = await embedText({text: input.text});
    const inputEmbedding = inputEmbeddingResponse.output!.embedding;

    const similarityToAI1 = cosineSimilarity(inputEmbedding, aiEmbedding1);
    const similarityToAI2 = cosineSimilarity(inputEmbedding, aiEmbedding2);
    const similarityToHuman = cosineSimilarity(inputEmbedding, humanEmbedding);

    // Simple averaging of AI similarities (can be adjusted based on desired sensitivity)
    const aiSimilarity = (similarityToAI1 + similarityToAI2) / 2;

    // Normalize AI similarity and "invert" it to get the AI percentage
    const aiPercentage = Math.max(0, Math.min(100, (aiSimilarity / (aiSimilarity + similarityToHuman)) * 100));

    return {aiPercentage};
  }
);
