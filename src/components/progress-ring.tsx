"use client"

import { motion, animate } from "framer-motion"
import React, { useEffect, useRef } from "react"

interface ProgressRingProps {
  progress: number
}

export function ProgressRing({ progress }: ProgressRingProps) {
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const strokeOffset = circumference * (1 - progress / 100)

  const numberRef = useRef<HTMLSpanElement>(null)
  
  // Animate the progress number
  useEffect(() => {
    const node = numberRef.current
    if (!node) return
    const from = parseInt(node.textContent || "0", 10)
    
    const controls = animate(from, progress, {
      duration: 1.5,
      ease: "circOut",
      onUpdate(value) {
        if(node) {
          node.textContent = `${Math.round(value)}%`
        }
      },
    })
    return () => controls.stop()
  }, [progress])

  return (
    <div className="relative flex items-center justify-center">
      <svg className="h-48 w-48 -rotate-90 transform" viewBox="0 0 200 200">
        <circle
          className="stroke-muted"
          cx="100"
          cy="100"
          r={radius}
          strokeWidth="16"
          fill="transparent"
        />
        <motion.circle
          cx="100"
          cy="100"
          r={radius}
          strokeWidth="16"
          fill="transparent"
          strokeLinecap="round"
          className="stroke-primary"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: strokeOffset }}
          transition={{ duration: 1.5, ease: "circOut" }}
        />
      </svg>
      <span
        ref={numberRef}
        className="absolute text-4xl font-bold font-headline text-foreground"
      >
        0%
      </span>
    </div>
  )
}
