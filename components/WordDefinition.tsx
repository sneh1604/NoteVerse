"use client"

import { useState, useCallback } from "react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Loader2 } from "lucide-react"
import { getWordDefinition } from "@/lib/ai"

interface WordDefinitionProps {
  word: string
  children: React.ReactNode
}

export function WordDefinition({ word, children }: WordDefinitionProps) {
  const [definition, setDefinition] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchDefinition = useCallback(async () => {
    if (definition || loading) return
    setLoading(true)
    try {
      const result = await getWordDefinition(word)
      setDefinition(result)
    } catch (error) {
      console.error("Failed to fetch definition:", error)
    } finally {
      setLoading(false)
    }
  }, [word, definition, loading])

  return (
    <HoverCard openDelay={300} closeDelay={200}>
      <HoverCardTrigger asChild>
        <span 
          className="cursor-help border-b border-dotted border-muted-foreground/50"
          onMouseEnter={fetchDefinition}
        >
          {children}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 text-sm">
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading definition...
          </div>
        ) : (
          <p className="text-muted-foreground">{definition}</p>
        )}
      </HoverCardContent>
    </HoverCard>
  )
}
