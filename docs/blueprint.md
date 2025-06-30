# **App Name**: Veritas AI

## Core Features:

- Text Input: Input text area with character limit to allow users to enter text for originality checks and paraphrasing.
- Check Originality Button: Button to trigger the originality check process.
- AI Score Calculation and Display: API call to /api/score to determine the AI percentage of the input text and display a progress ring.
- Warning Badge: Warning badge shown when the AI percentage exceeds a set threshold (25%).
- Text Paraphrasing: Collapsible section to paraphrase the input text, triggered by an API call to /api/paraphrase, streaming the rewritten text and updating the originality score in real time using an ai tool.
- Diff Highlighting: Highlight differences in paraphrased text using <mark> elements to indicate changes.
- Progress Ring Component: Reusable ProgressRing component to visually represent the AI score, using SVG and Tailwind CSS.

## Style Guidelines:

- Primary color: Indigo (#4F46E5), suggesting intelligence and trustworthiness.
- Background color: Light indigo (#F0F0FF), for a clean, muted backdrop that complements the primary color.
- Accent color: Violet (#8B5CF6) is used for interactive elements, for creating visual interest and complementing the primary.
- Font pairing: 'Space Grotesk' (sans-serif) for headlines, and 'Inter' (sans-serif) for body text. Space Grotesk offers a modern feel for headlines, while Inter ensures readability for body text.
- Glassmorphic card style with backdrop blur, semi-transparent white, rounded corners, and shadows.
- Micro-interactions: Buttons scale to 1.05 on hover with a spring animation for a subtle and engaging user experience.
- Robot icon (🤖) used in the GradientHeader component for branding and quick visual recognition.