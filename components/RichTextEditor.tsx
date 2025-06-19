"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Sparkles,
  FileText,
  Wand2,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { summarizeText, getAutoComplete, enhanceWriting, isGeminiConfigured, testGeminiConnection } from "@/lib/ai"
import { useToast } from "@/hooks/use-toast"

interface RichTextEditorProps {
  content: string
  onChange: (content: string, htmlContent: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  className = "",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [showApiKeyWarning, setShowApiKeyWarning] = useState(false)
  const [apiStatus, setApiStatus] = useState<"unknown" | "working" | "error">("unknown")
  const isUpdatingRef = useRef(false)
  const lastContentRef = useRef("")
  const { toast } = useToast()

  const geminiConfigured = isGeminiConfigured()

  useEffect(() => {
    if (geminiConfigured) {
      testGeminiConnection().then((result) => {
        setApiStatus(result.success ? "working" : "error")
        if (!result.success) {
          console.error("Gemini API test failed:", result.error)
        }
      })
    }
  }, [geminiConfigured])

  useEffect(() => {
    if (editorRef.current && content !== lastContentRef.current && !isUpdatingRef.current) {
      const editor = editorRef.current

      const selection = window.getSelection()
      let cursorPosition = 0
      let restoreCursor = false

      if (selection && selection.rangeCount > 0 && editor.contains(selection.focusNode)) {
        const range = selection.getRangeAt(0)
        cursorPosition = range.startOffset
        restoreCursor = true
      }

      editor.innerHTML = content
      lastContentRef.current = content

      if (restoreCursor && document.activeElement === editor) {
        try {
          const textNodes = getTextNodes(editor)
          let totalLength = 0

          for (const node of textNodes) {
            const nodeLength = node.textContent?.length || 0
            if (totalLength + nodeLength >= cursorPosition) {
              const range = document.createRange()
              const offset = Math.min(cursorPosition - totalLength, nodeLength)
              range.setStart(node, offset)
              range.collapse(true)
              selection?.removeAllRanges()
              selection?.addRange(range)
              break
            }
            totalLength += nodeLength
          }
        } catch (error) {
          const range = document.createRange()
          range.selectNodeContents(editor)
          range.collapse(false)
          selection?.removeAllRanges()
          selection?.addRange(range)
        }
      }
    }
  }, [content])

  const getTextNodes = (element: Node): Text[] => {
    const textNodes: Text[] = []
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null)

    let node
    while ((node = walker.nextNode())) {
      textNodes.push(node as Text)
    }
    return textNodes
  }

  const execCommand = useCallback((command: string, value?: string) => {
    try {
      document.execCommand(command, false, value)
      setTimeout(handleContentChange, 0)
    } catch (error) {
      console.error(`Error executing command ${command}:`, error)
    }
  }, [])

  const handleContentChange = useCallback(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      isUpdatingRef.current = true

      const htmlContent = editorRef.current.innerHTML
      const textContent = editorRef.current.textContent || ""

      let cleanedHtml = htmlContent
      if (htmlContent.includes("<div>") || htmlContent.includes("<div><br></div>")) {
        cleanedHtml = htmlContent
          .replace(/<div><br><\/div>/g, "<br>")
          .replace(/<div>/g, "<br>")
          .replace(/<\/div>/g, "")
          .replace(/^<br>/, "") 
      }

      lastContentRef.current = cleanedHtml

      if (cleanedHtml !== htmlContent) {
        const selection = window.getSelection()
        const range = selection?.rangeCount ? selection.getRangeAt(0) : null
        const cursorOffset = range?.startOffset || 0

        editorRef.current.innerHTML = cleanedHtml

        if (range && editorRef.current.firstChild) {
          try {
            const newRange = document.createRange()
            newRange.setStart(
              editorRef.current.firstChild,
              Math.min(cursorOffset, editorRef.current.firstChild.textContent?.length || 0),
            )
            newRange.collapse(true)
            selection?.removeAllRanges()
            selection?.addRange(newRange)
          } catch (error) {
          }
        }
      }

      onChange(textContent, cleanedHtml)

      setTimeout(() => {
        isUpdatingRef.current = false
      }, 10)
    }
  }, [onChange])

  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault()
        document.execCommand("insertHTML", false, "<br>")
        setTimeout(handleContentChange, 0)
        return
      }

      if (e.key === "Tab" && !e.shiftKey && geminiConfigured && apiStatus === "working") {
        e.preventDefault()
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          const textBefore = range.startContainer.textContent?.substring(0, range.startOffset) || ""
          const lastSentence = textBefore.split(".").pop()?.trim() || ""

          if (lastSentence.length > 10) {
            setIsAiLoading(true)
            try {
              const completion = await getAutoComplete(lastSentence, editorRef.current?.textContent || "")
              if (completion) {
                document.execCommand("insertText", false, " " + completion)
                setTimeout(handleContentChange, 0)
              }
            } catch (error) {
              console.error("Auto-complete error:", error)
            } finally {
              setIsAiLoading(false)
            }
          }
        }
        return
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault()
            execCommand("bold")
            break
          case "i":
            e.preventDefault()
            execCommand("italic")
            break
          case "u":
            e.preventDefault()
            execCommand("underline")
            break
        }
      }
    },
    [execCommand, geminiConfigured, apiStatus, handleContentChange],
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault()
      const text = e.clipboardData.getData("text/plain")
      document.execCommand("insertText", false, text)
      setTimeout(handleContentChange, 0)
    },
    [handleContentChange],
  )

  const handleSummarize = async () => {
    if (!geminiConfigured) {
      setShowApiKeyWarning(true)
      return
    }

    if (apiStatus === "error") {
      toast({
        title: "API Connection Error",
        description: "Gemini API is not responding. Please check your API key.",
        variant: "destructive",
      })
      return
    }

    if (!editorRef.current?.textContent?.trim()) {
      toast({
        title: "No content to summarize",
        description: "Please write some content first.",
        variant: "destructive",
      })
      return
    }

    setIsAiLoading(true)
    try {
      const summary = await summarizeText(editorRef.current.textContent)

      const summaryHtml = `<div style="background: rgba(59, 130, 246, 0.1); padding: 12px; border-radius: 8px; margin: 16px 0; border-left: 4px solid rgb(59, 130, 246);"><strong>📝 Summary:</strong> ${summary}</div>`

      const selection = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(editorRef.current)
      range.collapse(false)
      selection?.removeAllRanges()
      selection?.addRange(range)

      document.execCommand("insertHTML", false, summaryHtml)
      setTimeout(handleContentChange, 0)

      toast({
        title: "Summary generated",
        description: "AI summary has been added to your note.",
      })
    } catch (error: any) {
      toast({
        title: "Error generating summary",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsAiLoading(false)
    }
  }

  const handleEnhanceWriting = async () => {
    if (!geminiConfigured) {
      setShowApiKeyWarning(true)
      return
    }

    if (apiStatus === "error") {
      toast({
        title: "API Connection Error",
        description: "Gemini API is not responding. Please check your API key.",
        variant: "destructive",
      })
      return
    }

    const selection = window.getSelection()
    let textToEnhance = ""

    if (selection && selection.toString().trim()) {
      textToEnhance = selection.toString()
    } else if (editorRef.current?.textContent?.trim()) {
      textToEnhance = editorRef.current.textContent
    } else {
      toast({
        title: "No content to enhance",
        description: "Please select text or write some content first.",
        variant: "destructive",
      })
      return
    }

    setIsAiLoading(true)
    try {
      const enhanced = await enhanceWriting(textToEnhance)

      if (selection && selection.toString().trim()) {
        document.execCommand("insertText", false, enhanced)
      } else {
        editorRef.current!.innerHTML = enhanced
      }

      setTimeout(handleContentChange, 0)

      toast({
        title: "Writing enhanced",
        description: "Your text has been improved by AI.",
      })
    } catch (error: any) {
      toast({
        title: "Error enhancing writing",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsAiLoading(false)
    }
  }

  const getApiStatusIcon = () => {
    switch (apiStatus) {
      case "working":
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case "error":
        return <AlertCircle className="h-3 w-3 text-red-500" />
      default:
        return <Sparkles className="h-3 w-3" />
    }
  }

  const getApiStatusText = () => {
    if (!geminiConfigured) return "AI features disabled"

    switch (apiStatus) {
      case "working":
        return "AI ready - Press Tab for auto-complete"
      case "error":
        return "AI connection error"
      default:
        return "Testing AI connection..."
    }
  }

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      {showApiKeyWarning && (
        <Alert className="m-4 border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <p className="font-medium">Gemini API Key Required</p>
              <p className="text-sm">Add your GEMINI_API_KEY to environment variables to use AI features.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowApiKeyWarning(false)}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-1 p-2 border-b bg-muted/50">
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

        <Button
          variant="ghost"
          size="sm"
          onClick={handleSummarize}
          disabled={isAiLoading || !geminiConfigured || apiStatus === "error"}
          className="h-8 px-2"
        >
          <FileText className="h-4 w-4 mr-1" />
          {isAiLoading ? "Summarizing..." : "Summarize"}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleEnhanceWriting}
          disabled={isAiLoading || !geminiConfigured || apiStatus === "error"}
          className="h-8 px-2"
        >
          <Wand2 className="h-4 w-4 mr-1" />
          {isAiLoading ? "Enhancing..." : "Enhance"}
        </Button>

        <div className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
          {getApiStatusIcon()}
          {getApiStatusText()}
        </div>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleContentChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        className="min-h-[300px] p-4 focus:outline-none prose prose-sm max-w-none dark:prose-invert"
        style={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          direction: "ltr",
          textAlign: "left",
        }}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: rgb(156, 163, 175);
          pointer-events: none;
          position: absolute;
        }
        
        [contenteditable] {
          outline: none;
        }
        
        [contenteditable] br {
          display: block;
          margin: 0;
          padding: 0;
        }
      `}</style>
    </div>
  )
}
