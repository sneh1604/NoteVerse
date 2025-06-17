"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, ExternalLink } from "lucide-react"
import { useState } from "react"

export function IndexSetupGuide() {
  const [copied, setCopied] = useState(false)

  const indexUrl =
    "https://console.firebase.google.com/v1/r/project/noteverse-5721/firestore/indexes?create_composite=Ckxwcm9qZWN0cy9ub3RldmVyc2UtNTcyMS9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvbm90ZXMvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaDQoJdXBkYXRlZEF0EAIaDAoIX19uYW1lX18QAg"

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto border-orange-200 dark:border-orange-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Firestore Index Required
        </CardTitle>
        <CardDescription>
          Your app needs a composite index to efficiently query notes. This is a one-time setup.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Quick Fix Options:</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Option 1
              </Badge>
              <span className="text-sm">Click the auto-generated link (recommended)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Option 2
              </Badge>
              <span className="text-sm">Create the index manually in Firebase Console</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Option 1: Auto-Create Index (Easiest)
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Firebase generated a direct link to create the required index. Click the button below:
            </p>
            <Button asChild className="w-full sm:w-auto">
              <a href={indexUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Create Index Automatically
              </a>
            </Button>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Option 2: Manual Setup</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">
                  1
                </Badge>
                <div>
                  <p className="font-medium">Go to Firebase Console</p>
                  <p className="text-muted-foreground">Navigate to Firestore Database → Indexes</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">
                  2
                </Badge>
                <div>
                  <p className="font-medium">Create Composite Index</p>
                  <p className="text-muted-foreground">Click "Create Index" and configure:</p>
                  <div className="mt-2 bg-muted p-3 rounded-md font-mono text-xs">
                    <div>
                      Collection ID: <strong>notes</strong>
                    </div>
                    <div>Fields:</div>
                    <div className="ml-4">• userId (Ascending)</div>
                    <div className="ml-4">• updatedAt (Descending)</div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">
                  3
                </Badge>
                <div>
                  <p className="font-medium">Wait for Index Creation</p>
                  <p className="text-muted-foreground">It may take a few minutes to build the index</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Current Status</h3>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span>App is running with fallback query (notes may load slower)</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Once the index is created, the app will automatically use the optimized query.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Why is this needed?</h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Firestore requires composite indexes when querying with multiple conditions (filtering by userId AND
            ordering by updatedAt). This ensures optimal performance for your notes app.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
