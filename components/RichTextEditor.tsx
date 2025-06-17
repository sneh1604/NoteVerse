"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback, useLayoutEffect } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  Type, Sparkles, FileText, Wand2, AlertCircle, CheckCircle
} from "lucide-react"
import { summarizeText, enhanceWriting, isGeminiConfigured, testGeminiConnection } from "@/lib/ai"
import { useToast } from "@/hooks/use-toast"
import { apiStatusAtom, type ApiStatus } from '@/lib/apiConfig'
import { useAtom } from 'jotai'
import { WordDefinition } from "@/components/WordDefinition"
import { createRoot, Root } from "react-dom/client"

interface RichTextEditorProps {
  content: string
  onChange: (content: string, htmlContent: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ content, onChange, placeholder = "Start writing...", className = "" }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const rootsMapRef = useRef<Map<HTMLElement, Root>>(new Map())
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [showApiKeyWarning, setShowApiKeyWarning] = useState(false)
  const [apiStatus, setApiStatus] = useAtom(apiStatusAtom)
  const { toast } = useToast()

  const geminiConfigured = isGeminiConfigured()

  const safeUnmountRoots = useCallback(() => {
    // Clear previous cleanup if pending
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current)
    }

    // Schedule cleanup for next tick
    cleanupTimeoutRef.current = setTimeout(() => {
      rootsMapRef.current.forEach((root) => {
        try {
          root.unmount()
        } catch (error) {
          console.error('Error unmounting root:', error)
        }
      })
      rootsMapRef.current.clear()
    }, 0)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current)
      }
      safeUnmountRoots()
    }
  }, [safeUnmountRoots])

  const updateWordDefinitions = useCallback(() => {
    if (!editorRef.current) return

    // Schedule cleanup of existing roots
    safeUnmountRoots()

    // Create new roots after a small delay
    setTimeout(() => {
      const hoverables = editorRef.current?.getElementsByClassName('hoverable-word')
      if (!hoverables) return

      Array.from(hoverables).forEach((element) => {
        const htmlElement = element as HTMLElement
        if (!rootsMapRef.current.has(htmlElement)) {
          const word = htmlElement.textContent || ""
          try {
            const root = createRoot(htmlElement)
            rootsMapRef.current.set(htmlElement, root)
            root.render(
              <WordDefinition word={word}>
                {word}
              </WordDefinition>
            )
          } catch (error) {
            console.error('Error creating root:', error)
          }
        }
      })
    }, 0)
  }, [])

  // Initialize content effect
  useEffect(() => {
    if (editorRef.current && content) {
      editorRef.current.innerHTML = content
      updateWordDefinitions()
    }
  }, [content, updateWordDefinitions])

  // Test API connection
  useEffect(() => {
    const checkApiConnection = async () => {
      if (geminiConfigured) {
        try {
          const result = await testGeminiConnection()
          setApiStatus(result.success ? 'working' : 'error')
        } catch {
          setApiStatus('error')
        }
      } else {
        setApiStatus('unconfigured')
      }
    }
    checkApiConnection()
  }, [geminiConfigured, setApiStatus])

  const execCommand = useCallback((command: string, value?: string) => {
    try {
      document.execCommand(command, false, value)
      handleContentChange()
    } catch (error) {
      console.error(`Error executing command ${command}:`, error)
    }
  }, [])

  const wrapWordsWithDefinition = useCallback((content: string) => {
    if (!content) return content
    const words = content.split(/(\s+)/)
    return words.map((word, i) => {
      if (word.trim().length > 3 && /^[a-zA-Z]+$/.test(word)) {
        return `<span class="hoverable-word">${word}</span>`
      }
      return word
    }).join('')
  }, [])

  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      const htmlContent = editorRef.current.innerHTML
      const processedContent = wrapWordsWithDefinition(htmlContent)
      editorRef.current.innerHTML = processedContent
      updateWordDefinitions()
      const textContent = editorRef.current.textContent || ""
      onChange(textContent, processedContent)
    }
  }, [onChange, updateWordDefinitions, wrapWordsWithDefinition])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      execCommand('insertText', '    ')
    }

    // Keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault()
          execCommand('bold')
          break
        case 'i':
          e.preventDefault()
          execCommand('italic')
          break
        case 'u':
          e.preventDefault()
          execCommand('underline')
          break
      }
    }
  }, [execCommand])

  const handleAiOperation = async (operation: 'summarize' | 'enhance') => {
    if (!geminiConfigured) {
      setShowApiKeyWarning(true)
      return
    }

    if (apiStatus !== 'working') {
      toast({
        title: "API Connection Error",
        description: "Please check your API key configuration.",
        variant: "destructive",
      })
      return
    }

    const text = operation === 'enhance' && window.getSelection()?.toString()
      ? window.getSelection()?.toString()
      : editorRef.current?.textContent

    if (!text?.trim()) {
      toast({
        title: "No content",
        description: `Please ${operation === 'enhance' ? 'select text or ' : ''}write some content first.`,
        variant: "destructive",
      })
      return
    }

    setIsAiLoading(true)
    try {
      const result = operation === 'summarize' 
        ? await summarizeText(text)
        : await enhanceWriting(text)

      if (operation === 'summarize') {
        const summary = `<div class="ai-summary">${result}</div>`
        editorRef.current!.innerHTML = summary + editorRef.current!.innerHTML
      } else {
        document.execCommand('insertText', false, result)
      }

      handleContentChange()
      toast({
        title: `${operation === 'summarize' ? 'Summary' : 'Enhancement'} complete`,
        description: "Content has been updated.",
      })
    } catch (error) {
      toast({
        title: `Failed to ${operation}`,
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsAiLoading(false)
    }
  }

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      {showApiKeyWarning && (
        <Alert className="m-4 border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Gemini API Key required for AI features</span>
            <Button variant="outline" size="sm" onClick={() => setShowApiKeyWarning(false)}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/50">
        <div className="flex items-center gap-1">
          {/* Basic formatting controls */}
          <Button variant="ghost" size="sm" onClick={() => execCommand("bold")} className="h-8 w-8 p-0">
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => execCommand("italic")} className="h-8 w-8 p-0">
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => execCommand("underline")} className="h-8 w-8 p-0">
            <Underline className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Alignment */}
          <Button variant="ghost" size="sm" onClick={() => execCommand("justifyLeft")} className="h-8 w-8 p-0">
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => execCommand("justifyCenter")} className="h-8 w-8 p-0">
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => execCommand("justifyRight")} className="h-8 w-8 p-0">
            <AlignRight className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Font Size */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Type className="h-4 w-4 mr-1" />
                Size
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => execCommand("fontSize", "1")}>Small</DropdownMenuItem>
              <DropdownMenuItem onClick={() => execCommand("fontSize", "3")}>Normal</DropdownMenuItem>
              <DropdownMenuItem onClick={() => execCommand("fontSize", "5")}>Large</DropdownMenuItem>
              <DropdownMenuItem onClick={() => execCommand("fontSize", "7")}>Extra Large</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-6" />

          {/* AI Features */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAiOperation('summarize')}
            disabled={isAiLoading}
            className="h-8"
          >
            <FileText className="h-4 w-4 mr-1" />
            {isAiLoading ? "Processing..." : "Summarize"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAiOperation('enhance')}
            disabled={isAiLoading}
            className="h-8"
          >
            <Wand2 className="h-4 w-4 mr-1" />
            {isAiLoading ? "Processing..." : "Enhance"}
          </Button>
        </div>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleContentChange}
        onKeyDown={handleKeyDown}
        className="min-h-[300px] p-4 focus:outline-none prose prose-sm max-w-none dark:prose-invert"
        style={{ whiteSpace: "pre-wrap" }}
        data-placeholder={placeholder}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: rgb(156, 163, 175);
          pointer-events: none;
        }
        .ai-summary {
          background: rgba(59, 130, 246, 0.1);
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          border-left: 4px solid rgb(59, 130, 246);
        }
      `}</style>
    </div>
  )
}
export default RichTextEditor