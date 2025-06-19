"use client"

import { useState, useEffect } from "react"
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Note } from "@/types/note"
import { cleanFirestoreData, validateNoteData } from "@/lib/utils"
import type { CreateNoteData, UpdateNoteData } from "@/types/note"
import { encryptContent, decryptContent } from "@/lib/encryption"

export function useNotes(userId: string | null) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setNotes([])
      setLoading(false)
      return
    }

    const setupQuery = async () => {
      try {
        const optimizedQuery = query(
          collection(db, "notes"),
          where("userId", "==", userId),
          orderBy("updatedAt", "desc"),
        )

        const unsubscribe = onSnapshot(
          optimizedQuery,
          (snapshot) => {
            const notesData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
              updatedAt: doc.data().updatedAt?.toDate() || new Date(),
              color: doc.data().color || "default",
              isPinned: doc.data().isPinned || false,
              isEncrypted: doc.data().isEncrypted || false,
              encryptedData: doc.data().encryptedData || undefined,
            })) as Note[]

            const sortedNotes = notesData.sort((a, b) => {
              if (a.isPinned && !b.isPinned) return -1
              if (!a.isPinned && b.isPinned) return 1
              return b.updatedAt.getTime() - a.updatedAt.getTime()
            })

            setNotes(sortedNotes)
            setLoading(false)
            setError(null)
          },
          (error) => {
            console.error("Firestore query error:", error)

            if (error.code === "failed-precondition") {
              console.log("Falling back to simple query without ordering...")
              setupSimpleQuery()
            } else {
              setError("Failed to load notes. Please try again.")
              setLoading(false)
            }
          },
        )

        return unsubscribe
      } catch (error) {
        console.error("Error setting up optimized query:", error)
        return setupSimpleQuery()
      }
    }

    const setupSimpleQuery = () => {
      try {
        const simpleQuery = query(collection(db, "notes"), where("userId", "==", userId))

        const unsubscribe = onSnapshot(
          simpleQuery,
          (snapshot) => {
            const notesData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate() || new Date(),
              updatedAt: doc.data().updatedAt?.toDate() || new Date(),
              color: doc.data().color || "default",
              isPinned: doc.data().isPinned || false,
              isEncrypted: doc.data().isEncrypted || false,
              encryptedData: doc.data().encryptedData || undefined,
            })) as Note[]

            const sortedNotes = notesData.sort((a, b) => {
              if (a.isPinned && !b.isPinned) return -1
              if (!a.isPinned && b.isPinned) return 1
              return b.updatedAt.getTime() - a.updatedAt.getTime()
            })

            setNotes(sortedNotes)
            setLoading(false)
            setError(null)
          },
          (error) => {
            console.error("Simple query error:", error)
            setError("Failed to load notes. Please check your connection.")
            setLoading(false)
          },
        )

        return unsubscribe
      } catch (error) {
        console.error("Error setting up simple query:", error)
        setError("Failed to initialize notes. Please refresh the page.")
        setLoading(false)
        return () => {}
      }
    }

    let unsubscribe: (() => void) | undefined

    setupQuery().then((unsub) => {
      unsubscribe = unsub
    })

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [userId])

  const addNote = async (noteData: CreateNoteData) => {
    try {
      const noteToSave = {
        ...noteData,
        tags: noteData.tags || [],
        color: noteData.color || "default",
        isPinned: noteData.isPinned || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      if (!validateNoteData(noteToSave)) {
        console.error("Invalid note data:", noteToSave)
        throw new Error("Invalid note data")
      }

      const cleanNote = cleanFirestoreData(noteToSave)

      await addDoc(collection(db, "notes"), cleanNote)
    } catch (error) {
      console.error("Error adding note:", error)
      throw error
    }
  }

  const updateNote = async (id: string, updates: UpdateNoteData) => {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      }

      const cleanUpdates = cleanFirestoreData(updateData)

      if (Object.keys(cleanUpdates).length === 0) {
        console.warn("No valid updates provided")
        return
      }

      await updateDoc(doc(db, "notes", id), cleanUpdates)
    } catch (error) {
      console.error("Error updating note:", error)
      throw error
    }
  }

  const deleteNote = async (id: string) => {
    try {
      await deleteDoc(doc(db, "notes", id))
    } catch (error) {
      console.error("Error deleting note:", error)
      throw error
    }
  }

  const togglePin = async (id: string, isPinned: boolean) => {
    try {
      await updateNote(id, { isPinned: !isPinned })
    } catch (error) {
      console.error("Error toggling pin:", error)
      throw error
    }
  }

  const changeColor = async (id: string, color: string) => {
    try {
      await updateNote(id, { color })
    } catch (error) {
      console.error("Error changing color:", error)
      throw error
    }
  }

  const toggleEncryption = async (id: string, password?: string) => {
    try {
      const noteToUpdate = notes.find((note) => note.id === id)
      if (!noteToUpdate) return

      if (noteToUpdate.isEncrypted && password && noteToUpdate.encryptedData) {
        // Decrypt the note
        const decrypted = await decryptContent(noteToUpdate.encryptedData, password)
        await updateNote(id, {
          isEncrypted: false,
          content: decrypted,
          htmlContent: decrypted,
          encryptedData: undefined,
        })
      } else if (!noteToUpdate.isEncrypted && password) {
        // Encrypt the note
        const encrypted = await encryptContent(noteToUpdate.htmlContent || noteToUpdate.content, password)
        await updateNote(id, {
          isEncrypted: true,
          encryptedData: {
            encryptedContent: encrypted.encryptedContent,
            encryptedHtmlContent: encrypted.encryptedContent,
            salt: encrypted.salt,
            iv: encrypted.iv,
          },
        })
      }
    } catch (error) {
      console.error("Error toggling encryption:", error)
      throw error
    }
  }

  const toggleArchive = async (id: string) => {
    try {
      const note = notes.find(n => n.id === id);
      if (!note) return;
      await updateNote(id, { isArchived: !note.isArchived });
    } catch (error) {
      console.error("Error toggling archive:", error);
      throw error;
    }
  };

  return { 
    notes: notes.filter(note => !note.isArchived), 
    archivedNotes: notes.filter(note => note.isArchived),
    loading, 
    error, 
    addNote, 
    updateNote, 
    deleteNote, 
    togglePin, 
    changeColor, 
    toggleEncryption,
    toggleArchive 
  };
}
