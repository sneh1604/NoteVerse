"use client"

import { useState, useMemo, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useNotes } from "@/hooks/useNotes"
import { Header } from "@/components/Header"
import { NoteCard } from "@/components/NoteCard"
import { NoteEditor } from "@/components/NoteEditor"
import { LoginScreen } from "@/components/LoginScreen"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, FileText, AlertTriangle, RefreshCw, Pin, Sparkles } from "lucide-react"
import type { Note, CreateNoteData, UpdateNoteData } from "@/types/note"
import { Toaster } from "@/components/ui/toaster"
import { isGeminiConfigured } from "@/lib/ai"
import { PasswordPrompt } from "@/components/PasswordPrompt"
import { Sidebar } from "@/components/Sidebar"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"


export default function NotesApp() {
  const {
    user,
    loading: authLoading,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    resetPassword,
    logout,
  } = useAuth()
  const {
    notes,
    loading: notesLoading,
    error: notesError,
    addNote,
    updateNote,
    deleteNote,
    togglePin,
    changeColor,
    toggleEncryption,
  } = useNotes(user?.uid || null)

   const [mounted, setMounted] = useState(false)
   const { theme } = useTheme()

  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [authError, setAuthError] = useState<string>("")
  const [showIndexGuide, setShowIndexGuide] = useState(false)
  const [showGeminiGuide, setShowGeminiGuide] = useState(false)

  const [showEncryptPrompt, setShowEncryptPrompt] = useState(false)
  const [encryptingNoteId, setEncryptingNoteId] = useState<string | null>(null)
  const [isEncrypting, setIsEncrypting] = useState(false)
  const [encryptError, setEncryptError] = useState("")

  const [sidebarOpen, setSidebarOpen] = useState(true)

  const geminiConfigured = isGeminiConfigured()

   useEffect(() => {
    setMounted(true)
  }, [])
  const filteredNotes = useMemo(() => {
    if (!searchTerm.trim()) return notes

    const term = searchTerm.toLowerCase()
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(term) ||
        note.content.toLowerCase().includes(term) ||
        note.tags?.some((tag) => tag.toLowerCase().includes(term)),
    )
  }, [notes, searchTerm])

  // Separate pinned and unpinned notes
  const { pinnedNotes, unpinnedNotes } = useMemo(() => {
    const pinned = filteredNotes.filter((note) => note.isPinned)
    const unpinned = filteredNotes.filter((note) => !note.isPinned)
    return { pinnedNotes: pinned, unpinnedNotes: unpinned }
  }, [filteredNotes])

  const handleNewNote = () => {
    setSelectedNote(null)
    setIsEditorOpen(true)
  }

  const handleEditNote = (note: Note) => {
    setSelectedNote(note)
    setIsEditorOpen(true)
  }

  const handleDeleteNote = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        await deleteNote(id)
      } catch (error) {
        console.error("Failed to delete note:", error)
      }
    }
  }

  const handleTogglePin = async (id: string, isPinned: boolean) => {
    try {
      await togglePin(id, isPinned)
    } catch (error) {
      console.error("Failed to toggle pin:", error)
    }
  }

  const handleChangeColor = async (id: string, color: string) => {
    try {
      await changeColor(id, color)
    } catch (error) {
      console.error("Failed to change color:", error)
    }
  }

  const handleSaveNote = async (noteData: CreateNoteData) => {
    try {
      await addNote(noteData)
    } catch (error) {
      console.error("Failed to save note:", error)
    }
  }

  const handleUpdateNote = async (id: string, updates: UpdateNoteData) => {
    try {
      await updateNote(id, updates)
    } catch (error) {
      console.error("Failed to update note:", error)
    }
  }

  const handleGoogleSignIn = async () => {
    setAuthError("")
    try {
      await signInWithGoogle()
    } catch (error: any) {
      if (error.code === "auth/unauthorized-domain") {
        setAuthError(
          "This domain is not authorized for Google Sign-In. Please add your domain to Firebase Console → Authentication → Settings → Authorized domains",
        )
      } else {
        setAuthError("Sign-in failed. Please try again.")
      }
    }
  }

  const handleEmailSignIn = async (email: string, password: string) => {
    setAuthError("")
    return await signInWithEmail(email, password)
  }

  const handleEmailSignUp = async (email: string, password: string, displayName: string) => {
    setAuthError("")
    return await signUpWithEmail(email, password, displayName)
  }

  const handlePasswordReset = async (email: string) => {
    return await resetPassword(email)
  }

  const handleToggleEncryption = async (id: string, password?: string) => {
    if (password) {
      // Direct encryption/decryption with password
      try {
        await toggleEncryption(id, password)
      } catch (error) {
        console.error("Failed to toggle encryption:", error)
      }
    } else {
      // Show password prompt for encryption
      setEncryptingNoteId(id)
      setShowEncryptPrompt(true)
    }
  }

  if (authLoading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <LoginScreen
        onGoogleSignIn={handleGoogleSignIn}
        onEmailSignIn={handleEmailSignIn}
        onEmailSignUp={handleEmailSignUp}
        onPasswordReset={handlePasswordReset}
        loading={authLoading}
        error={authError}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onLogout={logout}
        onNewNote={handleNewNote}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />

      <Sidebar isOpen={sidebarOpen} />

      <main
        className={cn(
          "transition-all duration-300 ease-in-out",
          "pt-16 min-h-screen",
          sidebarOpen ? "pl-64" : "pl-[72px]",
        )}
      >
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Database Error Alert */}
          <div className="max-w-7xl mx-auto space-y-4">
            {notesError && (
              <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Database optimization needed for better performance.</span>
                  <Button variant="outline" size="sm" onClick={() => setShowIndexGuide(true)}>
                    Fix Now
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {notesLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Loading your notes...</span>
              </div>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-16 max-w-md mx-auto">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{searchTerm ? "No notes found" : "No notes yet"}</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Create your first note to get started with AI-powered note-taking"}
              </p>
              {!searchTerm && (
                <Button onClick={handleNewNote}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Note
                </Button>
              )}
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Pinned Notes Section */}
              {pinnedNotes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Pin className="h-4 w-4 text-orange-500" />
                    <h2 className="text-lg font-semibold text-muted-foreground">Pinned</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {pinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onEdit={handleEditNote}
                        onDelete={handleDeleteNote}
                        onTogglePin={handleTogglePin}
                        onChangeColor={handleChangeColor}
                        onToggleEncryption={handleToggleEncryption}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Notes Section */}
              {unpinnedNotes.length > 0 && (
                <div className="space-y-4">
                  {pinnedNotes.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-muted-foreground">Others</h2>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {unpinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onEdit={handleEditNote}
                        onDelete={handleDeleteNote}
                        onTogglePin={handleTogglePin}
                        onChangeColor={handleChangeColor}
                        onToggleEncryption={handleToggleEncryption}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <PasswordPrompt
            isOpen={showEncryptPrompt}
            onClose={() => {
              setShowEncryptPrompt(false)
              setEncryptingNoteId(null)
              setEncryptError("")
            }}
            onSubmit={async (password) => {
              if (!encryptingNoteId) return

              setIsEncrypting(true)
              setEncryptError("")

              try {
                await toggleEncryption(encryptingNoteId, password)
                setShowEncryptPrompt(false)
                setEncryptingNoteId(null)
              } catch (error: any) {
                setEncryptError(error.message || "Encryption failed")
              } finally {
                setIsEncrypting(false)
              }
            }}
            mode="encrypt"
            isLoading={isEncrypting}
            error={encryptError}
          />
        </div>
      </main>

      <NoteEditor
        note={selectedNote}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveNote}
        onUpdate={handleUpdateNote}
        userId={user.uid}
      />

      <Toaster />
    </div>
  )
}
