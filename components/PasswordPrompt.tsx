"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, Unlock, AlertCircle, Copy } from "lucide-react"
import { generateSecurePassword } from "@/lib/encryption"

interface PasswordPromptProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (password: string) => void
  mode: "encrypt" | "decrypt"
  title?: string
  isLoading?: boolean
  error?: string
}

export function PasswordPrompt({
  isOpen,
  onClose,
  onSubmit,
  mode,
  title,
  isLoading = false,
  error,
}: PasswordPromptProps) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === "encrypt" && password !== confirmPassword) {
      return
    }

    if (!password.trim()) {
      return
    }

    onSubmit(password)
  }

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword(16)
    setGeneratedPassword(newPassword)
    setPassword(newPassword)
    setConfirmPassword(newPassword)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error("Failed to copy password:", err)
    }
  }

  const handleClose = () => {
    setPassword("")
    setConfirmPassword("")
    setGeneratedPassword("")
    onClose()
  }

  const isEncryptMode = mode === "encrypt"
  const passwordsMatch = password === confirmPassword
  const canSubmit = password.trim() && (isEncryptMode ? passwordsMatch : true)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEncryptMode ? (
              <>
                <Lock className="h-5 w-5 text-green-600" />
                Encrypt Note
              </>
            ) : (
              <>
                <Unlock className="h-5 w-5 text-blue-600" />
                Unlock Note
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isEncryptMode
              ? "Set a password to encrypt this note. The content will be secured with end-to-end encryption."
              : `Enter the password to decrypt "${title || "this note"}".`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">{isEncryptMode ? "Password" : "Enter Password"}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEncryptMode ? "Create a strong password" : "Enter password"}
                disabled={isLoading}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {isEncryptMode && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {password && confirmPassword && !passwordsMatch && (
                <p className="text-sm text-red-600">Passwords do not match</p>
              )}
            </div>
          )}

          {isEncryptMode && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">Need a secure password?</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleGeneratePassword} disabled={isLoading}>
                  Generate
                </Button>
              </div>
              {generatedPassword && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <code className="flex-1 text-sm font-mono">{generatedPassword}</code>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(generatedPassword)}
                    className="h-6 w-6"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Security Notice */}
          {isEncryptMode && (
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Important:</strong> Store your password safely. If you forget it, the note cannot be recovered.
                The encryption is end-to-end and we cannot access your password or content.
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || isLoading} className="flex-1">
              {isLoading ? "Processing..." : isEncryptMode ? "Encrypt Note" : "Unlock Note"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
