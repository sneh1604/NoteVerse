"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2, Calendar, Pin, PinOff, Palette, Lock, Unlock, Shield } from "lucide-react"
import type { Note } from "@/types/note"
import { NOTE_COLORS, type NoteColor } from "@/types/note"
import { format } from "date-fns"
import { useTheme } from "next-themes"
import { PasswordPrompt } from "./PasswordPrompt"
import { decryptContent } from "@/lib/encryption"

interface NoteCardProps {
  note: Note
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
  onTogglePin: (id: string, isPinned: boolean) => void
  onChangeColor: (id: string, color: string) => void
  onToggleEncryption: (id: string, password?: string) => void
}

export function NoteCard({ note, onEdit, onDelete, onTogglePin, onChangeColor, onToggleEncryption }: NoteCardProps) {
  const [showFullContent, setShowFullContent] = useState(false)
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null)
  const [isDecrypting, setIsDecrypting] = useState(false)
  const [decryptError, setDecryptError] = useState("")
  const { theme } = useTheme()

  // Memoize expensive calculations to prevent freezing
  const colorClasses = useMemo(() => {
    const colorConfig = NOTE_COLORS[note.color as NoteColor] || NOTE_COLORS.default
    const baseClasses = theme === "dark" ? colorConfig.dark : colorConfig.light

    // Add encryption styling
    if (note.isEncrypted && !decryptedContent) {
      return `${baseClasses} border-2 border-dashed opacity-75`
    }

    return baseClasses
  }, [note.color, note.isEncrypted, decryptedContent, theme])

  const displayContent = useMemo(() => {
    if (note.isEncrypted && !decryptedContent) {
      return "🔒 This note is encrypted. Click to unlock and view content."
    }

    const content = decryptedContent || note.htmlContent || note.content
    // Strip HTML safely
    const tmp = document.createElement("div")
    tmp.innerHTML = content
    return tmp.textContent || tmp.innerText || ""
  }, [note.isEncrypted, note.htmlContent, note.content, decryptedContent])

  const truncatedContent = useMemo(() => {
    const maxLength = 150
    if (displayContent.length <= maxLength) return displayContent
    return displayContent.substring(0, maxLength) + "..."
  }, [displayContent])

  const formattedDate = useMemo(() => {
    try {
      return format(note.updatedAt, "MMM d, yyyy")
    } catch (error) {
      return "Invalid date"
    }
  }, [note.updatedAt])

  const handleDecrypt = async (password: string) => {
    if (!note.encryptedData) return

    setIsDecrypting(true)
    setDecryptError("")

    try {
      const decrypted = await decryptContent(note.encryptedData, password)
      setDecryptedContent(decrypted)
      setShowPasswordPrompt(false)
    } catch (error) {
      setDecryptError("Invalid password. Please try again.")
    } finally {
      setIsDecrypting(false)
    }
  }

  const handleCardClick = () => {
    if (note.isEncrypted && !decryptedContent) {
      setShowPasswordPrompt(true)
    } else {
      onEdit(note)
    }
  }

  const handleToggleEncryption = () => {
    if (note.isEncrypted) {
      // Decrypt the note (remove encryption)
      setShowPasswordPrompt(true)
    } else {
      // Encrypt the note
      onToggleEncryption(note.id)
    }
  }

  // Optimized color change handler to prevent freezing
  const handleColorChange = (colorKey: string) => {
    // Use requestAnimationFrame to prevent blocking the UI
    requestAnimationFrame(() => {
      onChangeColor(note.id, colorKey)
    })
  }

  const getColorPreview = (colorKey: string) => {
    const colorConfig = NOTE_COLORS[colorKey as NoteColor] || NOTE_COLORS.default
    const previewClasses = theme === "dark" ? colorConfig.dark : colorConfig.light
    return previewClasses
  }

  return (
    <>
      <Card className={`hover:shadow-md transition-all cursor-pointer group relative ${colorClasses}`}>
        {note.isPinned && (
          <div className="absolute top-2 right-2 z-10">
            <Pin className="h-4 w-4 text-orange-500 fill-orange-500" />
          </div>
        )}

        {note.isEncrypted && (
          <div className="absolute top-2 left-2 z-10">
            <Shield className="h-4 w-4 text-blue-500 fill-blue-500" />
          </div>
        )}

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg line-clamp-2 flex-1 mr-2" onClick={handleCardClick}>
              {note.isEncrypted && !decryptedContent ? (
                <span className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  {note.title || "Encrypted Note"}
                </span>
              ) : (
                note.title || "Untitled Note"
              )}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCardClick}>
                  <Edit className="h-4 w-4 mr-2" />
                  {note.isEncrypted && !decryptedContent ? "Unlock & Edit" : "Edit"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTogglePin(note.id, note.isPinned)}>
                  {note.isPinned ? (
                    <>
                      <PinOff className="h-4 w-4 mr-2" />
                      Unpin
                    </>
                  ) : (
                    <>
                      <Pin className="h-4 w-4 mr-2" />
                      Pin to top
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleToggleEncryption}>
                  {note.isEncrypted ? (
                    <>
                      <Unlock className="h-4 w-4 mr-2" />
                      Remove Encryption
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Encrypt Note
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="p-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="w-full justify-start h-auto p-2">
                        <Palette className="h-4 w-4 mr-2" />
                        Change color
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="left" align="start">
                      {Object.entries(NOTE_COLORS).map(([key, color]) => (
                        <DropdownMenuItem
                          key={key}
                          onClick={() => handleColorChange(key)}
                          className="flex items-center gap-2"
                        >
                          <div className={`w-4 h-4 rounded-full border-2 ${getColorPreview(key)}`} />
                          {color.name}
                          {note.color === key && <span className="ml-auto">✓</span>}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(note.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formattedDate}
            {note.isEncrypted && (
              <Badge variant="secondary" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Encrypted
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="text-sm text-muted-foreground mb-3 cursor-pointer" onClick={handleCardClick}>
            {showFullContent ? (
              note.isEncrypted && !decryptedContent ? (
                <p className="italic">{displayContent}</p>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: decryptedContent || note.htmlContent || note.content }} />
              )
            ) : (
              <p className={note.isEncrypted && !decryptedContent ? "italic" : ""}>{truncatedContent}</p>
            )}
            {displayContent.length > 150 && !(note.isEncrypted && !decryptedContent) && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowFullContent(!showFullContent)
                }}
                className="text-primary hover:underline mt-1 text-xs"
              >
                {showFullContent ? "Show less" : "Show more"}
              </button>
            )}
          </div>

          {note.tags && note.tags.length > 0 && !(note.isEncrypted && !decryptedContent) && (
            <div className="flex flex-wrap gap-1">
              {note.tags.slice(0, 3).map((tag, index) => (
                <Badge key={`${tag}-${index}`} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {note.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{note.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <PasswordPrompt
        isOpen={showPasswordPrompt}
        onClose={() => {
          setShowPasswordPrompt(false)
          setDecryptError("")
        }}
        onSubmit={handleDecrypt}
        mode="decrypt"
        title={note.title}
        isLoading={isDecrypting}
        error={decryptError}
      />
    </>
  )
}
export default NoteCard