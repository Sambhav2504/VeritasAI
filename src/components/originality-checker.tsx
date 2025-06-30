"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { checkTextOriginality } from "@/ai/flows/check-text-originality"
import { paraphraseText } from "@/ai/flows/paraphrase-text"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ProgressRing } from "@/components/progress-ring"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronsUpDown, Sparkles } from "lucide-react"
import { diffWords } from 'diff'

export function OriginalityChecker() {
  const [text, setText] = useState("")
  const [originalityScore, setOriginalityScore] = useState<number | null>(null)
  const [paraphrasedText, setParaphrasedText] = useState<string | null>(null)
  const [originalTextForDiff, setOriginalTextForDiff] = useState<string | null>(null)
  const [isLoadingOriginality, setIsLoadingOriginality] = useState(false)
  const [isLoadingParaphrase, setIsLoadingParaphrase] = useState(false)
  const { toast } = useToast()

  const handleCheckOriginality = async (textToCheck: string) => {
    if (!textToCheck.trim()) {
      toast({ title: "Error", description: "Please enter some text.", variant: "destructive" })
      return
    }
    setIsLoadingOriginality(true)
    setParaphrasedText(null)
    setOriginalTextForDiff(null)
    try {
      const result = await checkTextOriginality({ text: textToCheck })
      setOriginalityScore(result.aiPercentage)
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Failed to check originality.", variant: "destructive" })
      setOriginalityScore(null)
    } finally {
      setIsLoadingOriginality(false)
    }
  }

  const handleParaphrase = async () => {
    if (!text.trim()) {
      toast({ title: "Error", description: "Please enter some text to paraphrase.", variant: "destructive" })
      return
    }
    setIsLoadingParaphrase(true)
    setOriginalityScore(null)
    setOriginalTextForDiff(text)
    try {
      const result = await paraphraseText({ text })
      const newText = result.paraphrasedText
      
      setText(newText)
      setParaphrasedText(newText)
      
      // Re-check score for the new text
      await handleCheckOriginality(newText)
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "Failed to paraphrase text.", variant: "destructive" })
    } finally {
      setIsLoadingParaphrase(false)
    }
  }

  const renderDiff = () => {
    if (!paraphrasedText || !originalTextForDiff) return null
    const differences = diffWords(originalTextForDiff, paraphrasedText)
    return (
      <p className="text-base leading-relaxed">
        {differences.map((part, index) => {
          if (part.added) {
            return <mark key={index} className="bg-primary/20 text-primary-foreground rounded px-1">{part.value}</mark>
          }
          if (part.removed) {
            return null // Don't show removed words from original
          }
          return <span key={index}>{part.value}</span>
        })}
      </p>
    )
  }

  return (
    <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 py-10">
      <Card className="bg-white/30 dark:bg-card/40 backdrop-blur-xl border-border/20 shadow-xl rounded-2xl">
        <CardContent className="p-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-headline font-bold">Check Your Text</h2>
            <Textarea
              placeholder="Paste your text here... (up to 3000 characters)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={3000}
              rows={12}
              className="bg-background/80 focus:bg-background"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{text.length} / 3000</span>
              <Button onClick={() => handleCheckOriginality(text)} disabled={isLoadingOriginality || isLoadingParaphrase} className="font-bold transition-transform hover:scale-105">
                {isLoadingOriginality && !isLoadingParaphrase ? "Checking..." : "Check Originality"}
              </Button>
            </div>

            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between font-bold transition-transform hover:scale-105">
                  Paraphrase My Text
                  <ChevronsUpDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-4">
                 <p className="text-sm text-muted-foreground">Rewrite your text to improve originality. The new version will be automatically checked.</p>
                <Button onClick={handleParaphrase} disabled={isLoadingParaphrase || isLoadingOriginality} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold transition-transform hover:scale-105">
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isLoadingParaphrase ? "Paraphrasing..." : "Paraphrase"}
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex flex-col items-center justify-center p-6 bg-white/30 dark:bg-card/40 backdrop-blur-xl border-border/20 shadow-xl rounded-2xl min-h-[400px]">
        {isLoadingOriginality || isLoadingParaphrase ? (
            <div className="flex flex-col items-center justify-center gap-4 w-full">
                <Skeleton className="h-48 w-48 rounded-full" />
                <Skeleton className="h-6 w-32 rounded-md" />
                {isLoadingParaphrase && <div className="space-y-2 mt-4 w-full"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div>}
            </div>
        ) : (
          <>
            {originalityScore !== null ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <ProgressRing progress={originalityScore} />
                <h3 className="text-xl font-headline font-semibold">AI Content Score</h3>
                {originalityScore >= 25 && (
                  <Badge variant="destructive" className="text-base">Warning: Likely AI-Generated</Badge>
                )}
                <p className="text-muted-foreground max-w-sm">
                  This score estimates the probability that the text was written by AI. A lower score is better.
                </p>
              </div>
            ) : (
                <div className="text-center text-muted-foreground">
                    <Sparkles className="mx-auto h-12 w-12 mb-4" />
                    <h3 className="text-xl font-headline font-semibold">Results will appear here</h3>
                    <p>Enter some text and click "Check Originality" to start.</p>
                </div>
            )}
            {paraphrasedText && originalTextForDiff && (
              <div className="mt-8 w-full border-t pt-6">
                <h3 className="text-xl font-headline font-semibold mb-2">Paraphrased Version (showing changes)</h3>
                {renderDiff()}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
