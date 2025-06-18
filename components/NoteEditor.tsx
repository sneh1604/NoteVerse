"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { X, Plus, Save, Palette, Pin, PinOff, Lock, Unlock } from "lucide-react"
import { RichTextEditor } from "./RichTextEditor"
import type { Note, CreateNoteData, UpdateNoteData, NoteColor } from "@/types/note"
import { NOTE_COLORS } from "@/types/note"
import { useTheme } from "next-themes"
import { PasswordPrompt } from "./PasswordPrompt"
import { encryptContent, decryptContent } from "@/lib/encryption"

interface NoteEditorProps {
  note: Note | null
  isOpen: boolean
  onClose: () => void
  onSave: (note: CreateNoteData) => void
  onUpdate: (id: string, updates: UpdateNoteData) => void
  userId: string
}

export function NoteEditor({ note, isOpen, onClose, onSave, onUpdate, userId }: NoteEditorProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [htmlContent, setHtmlContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [color, setColor] = useState<string>("default")
  const [isPinned, setIsPinned] = useState(false)
  const { theme } = useTheme()

  const [showEncryptPrompt, setShowEncryptPrompt] = useState(false)
  const [isEncrypting, setIsEncrypting] = useState(false)
  const [encryptError, setEncryptError] = useState("")

  // Memoize color classes to prevent expensive recalculations
  const colorClasses = useMemo(() => {
    const colorConfig = NOTE_COLORS[color as NoteColor] || NOTE_COLORS.default
    return theme === "dark" ? colorConfig.dark : colorConfig.light
  }, [color, theme])

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setHtmlContent(note.htmlContent || note.content)
      setTags(note.tags || [])
      setColor(note.color || "default")
      setIsPinned(note.isPinned || false)
    } else {
      setTitle("")
      setContent("")
      setHtmlContent("")
      setTags([])
      setColor("default")
      setIsPinned(false)
    }
    setNewTag("")
  }, [note, isOpen])

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return

    const baseNoteData = {
      title: title.trim(),
      content,
      htmlContent,
      userId,
      tags: tags || [],
      color,
      isPinned,
    }

    if (note) {
      // For updates, only include fields that have changed or are defined
      const updates: UpdateNoteData = {
        ...baseNoteData,
        // Only include summary if it exists
        ...(note.summary !== undefined && { summary: note.summary }),
      }
      onUpdate(note.id, updates)
    } else {
      // For new notes, create clean data
      const newNoteData: CreateNoteData = {
        ...baseNoteData,
        isEncrypted: false,
        // Don't include summary for new notes unless it's explicitly set
      }
      onSave(newNoteData)
    }

    onClose()
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  // Optimized color change handler
  const handleColorChange = (colorKey: string) => {
    // Use requestAnimationFrame to prevent UI blocking
    requestAnimationFrame(() => {
      setColor(colorKey)
    })
  }

  const getColorPreview = (colorKey: string) => {
    const colorConfig = NOTE_COLORS[colorKey as NoteColor] || NOTE_COLORS.default
    return theme === "dark" ? colorConfig.dark : colorConfig.light
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-4xl max-h-[90vh] overflow-hidden flex flex-col ${colorClasses}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{note ? "Edit Note" : "Create New Note"}</span>
            <div className="flex items-center gap-2">
              {/* Pin Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPinned(!isPinned)}
                className={isPinned ? "text-orange-500" : ""}
              >
                {isPinned ? <Pin className="h-4 w-4 fill-current" /> : <PinOff className="h-4 w-4" />}
              </Button>

              {/* Encryption Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEncryptPrompt(true)}
                className={note?.isEncrypted ? "text-blue-500" : ""}
              >
                {note?.isEncrypted ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              </Button>

              {/* Color Picker */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Palette className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {Object.entries(NOTE_COLORS).map(([key, colorConfig]) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() => handleColorChange(key)}
                      className="flex items-center gap-2"
                    >
                      <div className={`w-4 h-4 rounded-full border-2 ${getColorPreview(key)}`} />
                      {colorConfig.name}
                      {color === key && <span className="ml-auto">✓</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Title */}
          <Input
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold bg-transparent border-0 shadow-none focus-visible:ring-0 px-0"
          />

          {/* Tags */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge key={`${tag}-${index}`} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-transparent"
              />
              <Button onClick={addTag} size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className="flex-1 overflow-hidden">
            <RichTextEditor
              content={htmlContent}
              onChange={(textContent, htmlContent) => {
                setContent(textContent)
                setHtmlContent(htmlContent)
              }}
              placeholder="Start writing your note..."
              className="h-full bg-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!title.trim() && !content.trim()}>
              <Save className="h-4 w-4 mr-2" />
              {note ? "Update" : "Save"} Note
            </Button>
          </div>
        </div>

        <PasswordPrompt
          isOpen={showEncryptPrompt}
          onClose={() => {
            setShowEncryptPrompt(false)
            setEncryptError("")
          }}
          onSubmit={async (password) => {
            setIsEncrypting(true)
            setEncryptError("")

            try {
              if (note?.isEncrypted) {
                // Decrypt existing note
                if (note.encryptedData) {
                  const decrypted = await decryptContent(note.encryptedData, password)
                  setContent(decrypted)
                  setHtmlContent(decrypted)
                  // Update note to remove encryption
                  onUpdate(note.id, {
                    isEncrypted: false,
                    content: decrypted,
                    htmlContent: decrypted,
                    encryptedData: undefined,
                  })
                }
              } else {
                // Encrypt current content
                const encrypted = await encryptContent(htmlContent || content, password)
                // Update note with encryption
                if (note) {
                  onUpdate(note.id, {
                    isEncrypted: true,
                    encryptedData: {
                      encryptedContent: encrypted.encryptedContent,
                      encryptedHtmlContent: encrypted.encryptedContent,
                      salt: encrypted.salt,
                      iv: encrypted.iv,
                    },
                  })
                }
              }
              setShowEncryptPrompt(false)
            } catch (error: any) {
              setEncryptError(error.message || "Encryption failed")
            } finally {
              setIsEncrypting(false)
            }
          }}
          mode={note?.isEncrypted ? "decrypt" : "encrypt"}
          isLoading={isEncrypting}
          error={encryptError}
        />
      </DialogContent>
    </Dialog>
  )
}
export default NoteEditor