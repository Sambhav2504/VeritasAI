import { OriginalityChecker } from "@/components/originality-checker";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-start px-4 py-10 bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-3xl text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-foreground">
          AI Originality & Paraphrasing Checker
        </h1>
        <p className="mt-4 text-muted-foreground text-base sm:text-lg">
          Paste a paragraph to detect AI-generated content or get a human-style rewrite.
        </p>
      </div>

      <OriginalityChecker />

      <footer className="mt-16 w-full border-t pt-6 text-center text-sm text-muted-foreground">
        Crafted with ❤️ by{" "}
        <span className="text-primary font-semibold">Sambhav Kumath</span> — where code meets creativity.
      </footer>
    </main>
  );
}
