"use client"

import { AuthForm } from "./AuthForm"
import { FileText, Sparkles, Shield } from "lucide-react"

interface LoginScreenProps {
  onGoogleSignIn: () => void
  onEmailSignIn: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>
  onEmailSignUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<{ success: boolean; error: string | null }>
  onPasswordReset: (email: string) => Promise<{ success: boolean; error: string | null }>
  loading: boolean
  error?: string
}

export function LoginScreen({
  onGoogleSignIn,
  onEmailSignIn,
  onEmailSignUp,
  onPasswordReset,
  loading,
  error,
}: LoginScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Features Section */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              RichNotes
            </h1>
            <p className="text-xl text-muted-foreground">
              Your intelligent note-taking companion with AI-powered features
            </p>
          </div>

          <div className="grid gap-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Rich Text Editor</h3>
                <p className="text-muted-foreground">
                  Format your notes with bold, italic, alignment, and more. Built from scratch for optimal performance.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">AI-Powered Features</h3>
                <p className="text-muted-foreground">
                  Auto-complete with Tab, summarize your notes, and enhance your writing with Grok AI integration.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Secure Cloud Storage</h3>
                <p className="text-muted-foreground">
                  Your notes are safely stored in Firebase with real-time sync across all your devices.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <div className="flex justify-center">
          <AuthForm
            onGoogleSignIn={onGoogleSignIn}
            onEmailSignIn={onEmailSignIn}
            onEmailSignUp={onEmailSignUp}
            onPasswordReset={onPasswordReset}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  )
}
