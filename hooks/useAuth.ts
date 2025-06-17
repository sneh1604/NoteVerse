"use client"

import { useState, useEffect } from "react"
import {
  type User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
import type { User } from "@/types/note"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    try {
      // Configure the Google provider with additional settings
      googleProvider.setCustomParameters({
        prompt: "select_account",
      })

      const result = await signInWithPopup(auth, googleProvider)
      console.log("Successfully signed in:", result.user)
    } catch (error: any) {
      console.error("Error signing in with Google:", error)

      // Handle specific Firebase auth errors
      if (error.code === "auth/unauthorized-domain") {
        alert(
          "Authentication Error: This domain is not authorized for Google Sign-In. Please contact the administrator or try from an authorized domain.",
        )
      } else if (error.code === "auth/popup-closed-by-user") {
        console.log("Sign-in popup was closed by user")
      } else if (error.code === "auth/popup-blocked") {
        alert("Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.")
      } else {
        alert("Sign-in failed. Please try again.")
      }
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)

      // Update the user's display name
      if (result.user && displayName.trim()) {
        await updateProfile(result.user, {
          displayName: displayName.trim(),
        })
      }

      console.log("Successfully signed up:", result.user)
      return { success: true, error: null }
    } catch (error: any) {
      console.error("Error signing up with email:", error)

      let errorMessage = "Sign-up failed. Please try again."

      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "An account with this email already exists."
          break
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address."
          break
        case "auth/weak-password":
          errorMessage = "Password should be at least 6 characters long."
          break
        case "auth/operation-not-allowed":
          errorMessage = "Email/password accounts are not enabled."
          break
      }

      return { success: false, error: errorMessage }
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      console.log("Successfully signed in:", result.user)
      return { success: true, error: null }
    } catch (error: any) {
      console.error("Error signing in with email:", error)

      let errorMessage = "Sign-in failed. Please try again."

      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email address."
          break
        case "auth/wrong-password":
          errorMessage = "Incorrect password."
          break
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address."
          break
        case "auth/user-disabled":
          errorMessage = "This account has been disabled."
          break
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later."
          break
      }

      return { success: false, error: errorMessage }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
      return { success: true, error: null }
    } catch (error: any) {
      console.error("Error sending password reset email:", error)

      let errorMessage = "Failed to send reset email. Please try again."

      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email address."
          break
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address."
          break
      }

      return { success: false, error: errorMessage }
    }
  }

  return { user, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, resetPassword, logout }
}
