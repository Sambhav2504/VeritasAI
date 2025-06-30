import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Load environment variables (e.g., GEMINI_API_KEY from .env)
import { config } from 'dotenv';
config();

// Initialize Genkit with Gemini model
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});

// ✅ Register all flows (use relative paths, not @/ for Node.js compatibility)
import './flows/check-text-originality';
import './flows/paraphrase-text';
