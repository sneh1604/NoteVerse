export interface Note {
  id: string
  title: string
  content: string
  htmlContent: string
  userId: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
  summary?: string | null
  color: string
  isPinned: boolean
  isEncrypted: boolean
  encryptedData?: {
    encryptedContent: string
    encryptedHtmlContent: string
    salt: string
    iv: string
  }
}

export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

export type CreateNoteData = Omit<Note, "id" | "createdAt" | "updatedAt"> & {
  summary?: string | null
}

export type UpdateNoteData = Partial<Omit<Note, "id" | "createdAt" | "updatedAt" | "userId">>

export const NOTE_COLORS = {
  default: {
    name: "Default",
    light: "bg-white border-gray-200",
    dark: "bg-gray-800 border-gray-700",
    value: "default",
  },
  yellow: {
    name: "Yellow",
    light: "bg-yellow-100 border-yellow-300",
    dark: "bg-yellow-900/30 border-yellow-700",
    value: "yellow",
  },
  blue: {
    name: "Blue",
    light: "bg-blue-100 border-blue-300",
    dark: "bg-blue-900/30 border-blue-700",
    value: "blue",
  },
  green: {
    name: "Green",
    light: "bg-green-100 border-green-300",
    dark: "bg-green-900/30 border-green-700",
    value: "green",
  },
  pink: {
    name: "Pink",
    light: "bg-pink-100 border-pink-300",
    dark: "bg-pink-900/30 border-pink-700",
    value: "pink",
  },
  purple: {
    name: "Purple",
    light: "bg-purple-100 border-purple-300",
    dark: "bg-purple-900/30 border-purple-700",
    value: "purple",
  },
} as const

export type NoteColor = keyof typeof NOTE_COLORS
