# Veritas AI

Veritas AI is a Next.js application that helps you check the originality of your text and paraphrase it to improve its uniqueness. It uses advanced AI models to provide an "AI percentage" score and offers intelligent paraphrasing capabilities.

## ✨ Features

-   **AI Originality Score**: Get a percentage score indicating the likelihood of your text being AI-generated.
-   **Intelligent Paraphrasing**: Rewrite your text with a single click to improve originality.
-   **Diff Highlighting**: Easily see the changes between your original text and the paraphrased version.
-   **Sleek, Modern UI**: A beautiful, responsive interface with a glassmorphic design and dark/light modes.
-   **Built with Next.js 14**: Leverages the latest features of the Next.js App Router for optimal performance.

## 🛠️ Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) 14 (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **AI/Backend**: [Genkit](https://firebase.google.com/docs/genkit) with Google AI
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
-   **Animation**: [Framer Motion](https://www.framer.com/motion/)

## 🚀 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18 or later)
-   [pnpm](https://pnpm.io/installation) (recommended package manager)
-   A Google AI API key.

### Local Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/veritas-ai.git
    cd veritas-ai
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add your Google AI API key:
    ```
    GOOGLE_API_KEY=your_google_api_key_here
    ```

4.  **Run the development server:**
    ```bash
    pnpm dev
    ```
    The app will be available at [http://localhost:9002](http://localhost:9002).

## ☁️ Deployment

This project is optimized for deployment on [Vercel](https://vercel.com/).

1.  **Push your code** to a Git repository (e.g., GitHub).
2.  **Import the project** into Vercel.
3.  **Configure Environment Variables**:
    In the Vercel project settings, add the following environment variable:
    -   `GOOGLE_API_KEY`: Your Google AI API key.
4.  **Deploy!** Vercel will automatically build and deploy your application.
