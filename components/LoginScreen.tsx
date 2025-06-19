"use client"

import { AuthForm } from "./AuthForm"
import { FileText, Sparkles, Shield, StickyNote, Palette, Brain } from "lucide-react"

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
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Features */}
      <div className="hidden lg:flex flex-col w-1/2 bg-gradient-to-br from-yellow-50/50 via-orange-50/50 to-amber-50/50 dark:from-yellow-900/10 dark:via-orange-900/10 dark:to-amber-900/10 p-12">
        <div className="flex items-center gap-3 mb-12">
          <StickyNote className="h-10 w-10 text-amber-600" />
          <h1 className="text-4xl font-bold">NoteVerse</h1>
        </div>

        <div className="flex flex-col gap-8 max-w-xl">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold">Your thoughts, organized</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Capture ideas, stay organized, and collaborate seamlessly with AI-powered note-taking
            </p>
          </div>

          <div className="grid gap-6">
            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                <Brain className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">AI-Powered Features</h3>
                <p className="text-muted-foreground">Smart auto-complete, summarization, and writing enhancement</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                <Palette className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Rich Organization</h3>
                <p className="text-muted-foreground">Colorize, pin, tag, and organize your notes effortlessly</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">End-to-End Encryption</h3>
                <p className="text-muted-foreground">Keep your sensitive notes secure with optional encryption</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center lg:hidden space-y-2 mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <StickyNote className="h-8 w-8 text-amber-600" />
              <h1 className="text-3xl font-bold">NoteVerse</h1>
            </div>
            <p className="text-muted-foreground">
              Your intelligent note-taking companion
            </p>
          </div>

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
