"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, ExternalLink, Copy, TestTube } from "lucide-react"
import { useState } from "react"
import { testGeminiConnection } from "@/lib/ai"

export function GeminiSetupGuide() {
  const [copied, setCopied] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      const result = await testGeminiConnection()
      setTestResult(result)
    } catch (error) {
      setTestResult({ success: false, error: "Test failed" })
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-blue-500" />
          Gemini API Setup Guide
        </CardTitle>
        <CardDescription>
          Configure Google Gemini API to enable AI-powered features like summarization, auto-complete, and writing
          enhancement.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Quick Setup Steps:</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Step 1
              </Badge>
              <span className="text-sm">Get your free Gemini API key from Google AI Studio</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Step 2
              </Badge>
              <span className="text-sm">Add it to your environment variables</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Step 3
              </Badge>
              <span className="text-sm">Test the connection to verify it works</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Step 1: Get Gemini API Key
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Get your free API key from Google AI Studio. No credit card required for basic usage (15 requests/minute,
              1,500 requests/day).
            </p>
            <Button asChild className="w-full sm:w-auto">
              <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Get Gemini API Key
              </a>
            </Button>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Step 2: Add to Environment Variables</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Copy your API key and add it to the environment variables section in your project settings:
            </p>
            <div className="bg-muted p-3 rounded-md font-mono text-sm flex items-center justify-between">
              <code>GEMINI_API_KEY=your_api_key_here</code>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard("GEMINI_API_KEY=")} className="ml-2">
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Replace "your_api_key_here" with your actual API key from Google AI Studio
            </p>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Step 3: Test Connection</h3>
            <p className="text-sm text-muted-foreground mb-3">
              After adding your API key, test the connection to make sure everything works:
            </p>
            <div className="flex items-center gap-3">
              <Button onClick={handleTestConnection} disabled={testing} variant="outline">
                <TestTube className="h-4 w-4 mr-2" />
                {testing ? "Testing..." : "Test API Connection"}
              </Button>

              {testResult && (
                <div
                  className={`flex items-center gap-2 text-sm ${
                    testResult.success ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {testResult.success ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      API connection successful!
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4" />
                      {testResult.error || "Connection failed"}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">AI Features Available</h3>
            <div className="grid gap-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Auto-Complete</p>
                  <p className="text-muted-foreground">Press Tab while typing to get AI suggestions</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Summarization</p>
                  <p className="text-muted-foreground">Generate concise summaries of your notes</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-purple-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Writing Enhancement</p>
                  <p className="text-muted-foreground">Improve grammar, clarity, and style</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Free Tier Limits</h4>
          <p className="text-sm text-green-700 dark:text-green-300">
            Gemini API offers generous free usage limits: 15 requests per minute and 1,500 requests per day. Perfect for
            personal note-taking!
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Troubleshooting</h4>
          <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <p>• Make sure your API key is correctly copied (no extra spaces)</p>
            <p>• Verify the environment variable name is exactly: GEMINI_API_KEY</p>
            <p>• Check that your Google Cloud project has the Gemini API enabled</p>
            <p>• Ensure you haven't exceeded the free tier limits</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
