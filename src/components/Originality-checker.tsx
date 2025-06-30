/* eslint-disable tailwindcss/no-custom-classname */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { diffWords } from "diff";
import { ChevronsUpDown, Sparkles, Copy } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { checkTextOriginality } from "@/ai/flows/check-text-originality";
import { paraphraseText } from "@/ai/flows/paraphrase-text";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ProgressRing } from "@/components/progress-ring";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

/**
 * OriginalityChecker – polished version with:
 * • Glassmorphism cards & Framer‑Motion animations
 * • Word / sentence live stats
 * • Copy‑to‑clipboard toast
 * • Footer credit line
 */
export function OriginalityChecker() {
  const [text, setText] = useState("");
  const [originalityScore, setOriginalityScore] = useState<number | null>(null);
  const [paraphrasedText, setParaphrasedText] = useState<string | null>(null);
  const [originalTextForDiff, setOriginalTextForDiff] = useState<string | null>(null);
  const [isLoadingOriginality, setIsLoadingOriginality] = useState(false);
  const [isLoadingParaphrase, setIsLoadingParaphrase] = useState(false);
  const { toast } = useToast();

  /*──────────── helpers ───────────*/
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const sentenceCount = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;

  /*──────────── handlers ──────────*/
  const handleCheckOriginality = async (txt: string) => {
    if (!txt.trim()) {
      toast({ title: "Hold on ✋", description: "Please enter some text first.", variant: "destructive" });
      return;
    }
    setIsLoadingOriginality(true);
    setParaphrasedText(null);
    setOriginalTextForDiff(null);
    try {
      const { aiPercentage } = await checkTextOriginality({ text: txt });
      setOriginalityScore(aiPercentage);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to check originality.", variant: "destructive" });
      setOriginalityScore(null);
    } finally {
      setIsLoadingOriginality(false);
    }
  };

  const handleParaphrase = async () => {
    if (!text.trim()) {
      toast({ title: "Hold on ✋", description: "Please enter some text to paraphrase.", variant: "destructive" });
      return;
    }
    setIsLoadingParaphrase(true);
    setOriginalTextForDiff(text);
    setOriginalityScore(null);
    try {
      const { paraphrasedText: newText } = await paraphraseText({ text });
      setText(newText);
      setParaphrasedText(newText);
      await handleCheckOriginality(newText);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to paraphrase text.", variant: "destructive" });
    } finally {
      setIsLoadingParaphrase(false);
    }
  };

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val);
    toast({ title: "Copied!", description: "Paraphrased text copied to clipboard." });
  };

  const renderDiff = () => {
    if (!paraphrasedText || !originalTextForDiff) return null;
    const differences = diffWords(originalTextForDiff, paraphrasedText);
    return (
      <p className="text-base leading-relaxed">
        {differences.map((part, i) => {
          if (part.added) return <mark key={i} className="bg-primary/20 text-primary-foreground rounded px-1">{part.value}</mark>;
          if (part.removed) return null;
          return <span key={i}>{part.value}</span>;
        })}
      </p>
    );
  };

  /*──────────── render ───────────*/
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 py-10"
      >
        {/* ── left card ── */}
        <Card className="bg-white/10 dark:bg-card/30 backdrop-blur-xl border border-white/20 dark:border-border/30 shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="p-8 space-y-6">
            <h2 className="text-3xl font-extrabold tracking-tight font-headline">Check Your Text</h2>
            <Textarea
              placeholder="Paste your text here... (up to 3000 characters)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={3000}
              rows={10}
              className="bg-background/70 focus:bg-background border border-border/30 backdrop-blur-sm"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{text.length} / 3000</span>
              <span>{wordCount} words · {sentenceCount} sentences</span>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="flex justify-end">
              <Button onClick={() => handleCheckOriginality(text)} disabled={isLoadingOriginality || isLoadingParaphrase} className="font-bold">
                {isLoadingOriginality && !isLoadingParaphrase ? "Checking..." : "Check Originality"}
              </Button>
            </motion.div>
            {/* paraphrase collapsible */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <Button variant="outline" className="w-full justify-between font-bold">
                    Paraphrase My Text <ChevronsUpDown className="h-4 w-4" />
                  </Button>
                </motion.div>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-4">
                <p className="text-sm text-muted-foreground">Rewrite your text to improve originality. The new version will be automatically checked.</p>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <Button onClick={handleParaphrase} disabled={isLoadingParaphrase || isLoadingOriginality} className="w-full bg-gradient-to-r from-accent to-primary text-accent-foreground font-bold">
                    <Sparkles className="mr-2 h-4 w-4" /> {isLoadingParaphrase ? "Paraphrasing..." : "Paraphrase"}
                  </Button>
                </motion.div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* ── right card ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          className="flex flex-col items-center justify-center p-8 bg-white/10 dark:bg-card/30 backdrop-blur-xl border border-white/20 dark:border-border/30 shadow-2xl rounded-3xl min-h-[420px]"
        >
          {isLoadingOriginality || isLoadingParaphrase ? (
            <div className="flex flex-col items-center gap-4 w-full">
              <Skeleton className="h-48 w-48 rounded-full" />
              <Skeleton className="h-6 w-32" />
              {isLoadingParaphrase && (
                <div className="space-y-2 mt-4 w-full">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              )}
            </div>
          ) : (
            <>
              {originalityScore !== null ? (
                <div className="flex flex-col items-center gap-4 text-center">
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }}>
                    <ProgressRing progress={originalityScore} />
                  </motion.div>
                  <h3 className="text-2xl font-semibold font-headline">AI Content Score</h3>
                  {originalityScore >= 25 && (
                    <Badge variant="destructive" className="text-base">Warning: Likely AI‑Generated</Badge>
                  )}
                  <p className="text-muted-foreground max-w-sm">This score estimates the probability that the text was written by AI. A lower score is better.</p>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Sparkles className="mx-auto h-12 w-12 mb-4" />
                  <h3 className="text-2xl font-headline font-semibold">Results will appear here</h3>
                  <p>Enter some text and click "Check Originality" to start.</p>
                </div>
              )}

              {/* diff view + copy btn */}
              {paraphrasedText && originalTextForDiff && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.2 }} className="mt-8 w-full border-t pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-headline font-semibold">Paraphrased Version <span className="text-primary/70">(changes highlighted)</span></h3>
                    <Button variant="secondary" size="sm" onClick={() => handleCopy(paraphrasedText!)} className="gap-1">
                      <Copy className="h-4 w-4" /> Copy
                    </Button>
                  </div>
                  {renderDiff()}
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </motion.div>

      {/* footer */}
      <footer className="text-center mt-6 pb-4 text-sm text-muted-foreground">
        Built with 💡 and caffeine by <span className="font-semibold text-primary">Sambhav Kumath</span> 🚀
      </footer>
    </>
  );
}
