"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Chrome, Mail, Eye, EyeOff, Loader2 } from "lucide-react"

interface AuthFormProps {
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

export function AuthForm({
  onGoogleSignIn,
  onEmailSignIn,
  onEmailSignUp,
  onPasswordReset,
  loading,
  error,
}: AuthFormProps) {
  const [activeTab, setActiveTab] = useState("signin")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  })

  const [signUpData, setSignUpData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [resetEmail, setResetEmail] = useState("")

  const clearMessages = () => {
    setLocalError("")
    setSuccessMessage("")
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()

    if (!signInData.email || !signInData.password) {
      setLocalError("Please fill in all fields")
      return
    }

    setIsSubmitting(true)
    const result = await onEmailSignIn(signInData.email, signInData.password)

    if (!result.success && result.error) {
      setLocalError(result.error)
    }

    setIsSubmitting(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()

    if (!signUpData.displayName || !signUpData.email || !signUpData.password || !signUpData.confirmPassword) {
      setLocalError("Please fill in all fields")
      return
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      setLocalError("Passwords do not match")
      return
    }

    if (signUpData.password.length < 6) {
      setLocalError("Password must be at least 6 characters long")
      return
    }

    setIsSubmitting(true)
    const result = await onEmailSignUp(signUpData.email, signUpData.password, signUpData.displayName)

    if (!result.success && result.error) {
      setLocalError(result.error)
    }

    setIsSubmitting(false)
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()

    if (!resetEmail) {
      setLocalError("Please enter your email address")
      return
    }

    setIsSubmitting(true)
    const result = await onPasswordReset(resetEmail)

    if (result.success) {
      setSuccessMessage("Password reset email sent! Check your inbox.")
      setResetEmail("")
    } else if (result.error) {
      setLocalError(result.error)
    }

    setIsSubmitting(false)
  }

  const displayError = error || localError

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to NoteVerse
        </CardTitle>
        <CardDescription>Sign in to access your AI-powered notes</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Button onClick={onGoogleSignIn} disabled={loading || isSubmitting} className="w-full" size="lg">
          <Chrome className="mr-2 h-5 w-5" />
          {loading ? "Signing in..." : "Continue with Google"}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
          </div>
        </div>

        {displayError && (
          <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            {displayError}
          </div>
        )}

        {successMessage && (
          <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            {successMessage}
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value)
            clearMessages()
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="Enter your email"
                  value={signInData.email}
                  onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="text-center">
              <Button variant="link" className="text-sm" onClick={() => setActiveTab("reset")}>
                Forgot your password?
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={signUpData.displayName}
                  onChange={(e) => setSignUpData({ ...signUpData, displayName: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={signUpData.email}
                  onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password (min. 6 characters)"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {activeTab === "reset" && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Reset Password</h3>
              <p className="text-sm text-muted-foreground">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("signin")}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Back to Sign In
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </CardContent>
    </Card>
  )
}
