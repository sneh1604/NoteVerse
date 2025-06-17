import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Removes undefined values from an object to prevent Firestore errors
 */
export function cleanFirestoreData<T extends Record<string, any>>(data: T): Partial<T> {
  const cleaned: Partial<T> = {}

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      // Handle nested objects
      if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
        const cleanedNested = cleanFirestoreData(value)
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key as keyof T] = cleanedNested as T[keyof T]
        }
      } else {
        cleaned[key as keyof T] = value
      }
    }
  }

  return cleaned
}

/**
 * Validates note data before saving
 */
export function validateNoteData(note: any): boolean {
  return (
    typeof note.title === "string" &&
    typeof note.content === "string" &&
    typeof note.htmlContent === "string" &&
    typeof note.userId === "string" &&
    Array.isArray(note.tags)
  )
}
