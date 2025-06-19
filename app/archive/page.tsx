"use client"

import { ComingSoon } from "@/components/ComingSoon"
import { useAuth } from "@/hooks/useAuth"
import { useNotes } from "@/hooks/useNotes"
import { NoteCard } from "@/components/NoteCard"
import { Archive } from "lucide-react"

export default function ArchivePage() {
  const { user } = useAuth()
  const { 
    archivedNotes,
    togglePin,
    changeColor,
    toggleEncryption,
    toggleArchive,
    deleteNote,
    updateNote
  } = useNotes(user?.uid || null)

  const handleEditNote = async (note: any) => {
    // Handle edit if needed
  }

  if (!user) {
    return <div>Please login to view archived notes</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-2">
          <Archive className="h-5 w-5" />
          <h1 className="text-2xl font-bold">Archived Notes</h1>
        </div>

        {archivedNotes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No archived notes found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
            {archivedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEditNote}
                onDelete={deleteNote}
                onTogglePin={togglePin}
                onChangeColor={changeColor}
                onToggleEncryption={toggleEncryption}
                onToggleArchive={toggleArchive}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
