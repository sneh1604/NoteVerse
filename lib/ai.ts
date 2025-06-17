import { GoogleGenerativeAI } from "@google/generative-ai"

let aiClient: GoogleGenerativeAI | null = null

// Initialize the Gemini AI client with proper error handling
const getGeminiClient = () => {
  if (aiClient) return aiClient

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set")
  }

  try {
    aiClient = new GoogleGenerativeAI(apiKey)
    return aiClient
  } catch (error) {
    console.error("Failed to initialize Gemini client:", error)
    throw new Error("Failed to initialize Gemini AI client")
  }
}

export async function summarizeText(text: string): Promise<string> {
  try {
    if (!text.trim()) {
      return "No content to summarize."
    }

    const genAI = getGeminiClient()
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    })

    const prompt = `Please provide a concise summary of the following text in 2-3 sentences. Focus on the main points and key information:\n\n${text}`

    const result = await model.generateContent(prompt)

    if (!result.response) {
      throw new Error("No response from Gemini API")
    }

    const response = await result.response
    const summary = response.text()

    if (!summary || summary.trim() === "") {
      return "Unable to generate summary for this content."
    }

    return summary.trim()
  } catch (error: any) {
    console.error("Error summarizing text:", error)

    // Handle specific error types
    if (error.message?.includes("API_KEY_INVALID")) {
      throw new Error("Invalid API key. Please check your configuration.")
    }

    if (error.message?.includes("PERMISSION_DENIED") || error.status === 403) {
      return "API access denied. Please verify your Gemini API key has proper permissions."
    }

    if (error.message?.includes("QUOTA_EXCEEDED")) {
      return "API quota exceeded. Please check your Gemini API usage limits."
    }

    if (error.message?.includes("RATE_LIMIT_EXCEEDED")) {
      return "Rate limit exceeded. Please wait a moment and try again."
    }

    return "Unable to generate summary at this time. Please try again later."
  }
}

export async function getAutoComplete(text: string, context: string): Promise<string> {
  return withRetry(async () => {
    try {
      if (!text.trim()) {
        return ""
      }

      const genAI = getGeminiClient()
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.8,
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 50,
        },
      })

      const prompt = `Context: "${context}"\n\nComplete this text naturally with just a few words (maximum 8 words): "${text}"`

      const result = await model.generateContent(prompt)

      if (!result.response) {
        return ""
      }

      const response = await result.response
      const completion = response.text()

      // Clean up the completion
      if (completion && completion.trim() !== "") {
        return completion.trim().replace(/^["']|["']$/g, "") // Remove quotes if present
      }

      return ""
    } catch (error: any) {
      console.error("Error getting auto-completion:", error)
      // Fail silently for auto-complete to not interrupt typing
      return ""
    }
  })
}

export async function enhanceWriting(text: string): Promise<string> {
  try {
    if (!text.trim()) {
      return text
    }

    const genAI = getGeminiClient()
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    })

    const prompt = `Please improve the following text while maintaining its original meaning, tone, and approximate length. Focus on grammar, clarity, and readability:\n\n${text}`

    const result = await model.generateContent(prompt)

    if (!result.response) {
      throw new Error("No response from Gemini API")
    }

    const response = await result.response
    const enhanced = response.text()

    if (!enhanced || enhanced.trim() === "") {
      return text
    }

    return enhanced.trim()
  } catch (error: any) {
    console.error("Error enhancing writing:", error)

    // Handle specific error types
    if (error.message?.includes("API_KEY_INVALID")) {
      throw new Error("Invalid API key. Please check your Gemini API key configuration.")
    }

    if (error.message?.includes("PERMISSION_DENIED") || error.status === 403) {
      throw new Error("API access denied. Please verify your Gemini API key has proper permissions.")
    }

    if (error.message?.includes("QUOTA_EXCEEDED")) {
      throw new Error("API quota exceeded. Please check your Gemini API usage limits.")
    }

    if (error.message?.includes("RATE_LIMIT_EXCEEDED")) {
      throw new Error("Rate limit exceeded. Please wait a moment and try again.")
    }

    throw new Error("Unable to enhance writing at this time. Please try again later.")
  }
}

// New function to get word definition
export async function getWordDefinition(word: string): Promise<string> {
  try {
    const genAI = getGeminiClient()
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.2,
        topK: 1,
        topP: 1,
        maxOutputTokens: 100,
      },
    })

    const prompt = `Provide a brief, clear definition of the word "${word}" in one short sentence. Keep it simple and concise.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const definition = response.text()

    return definition.trim() || `No definition found for "${word}"`
  } catch (error) {
    console.error("Error getting word definition:", error)
    return "Unable to fetch definition"
  }
}

// Utility function to check if Gemini API is configured
export function isGeminiConfigured(): boolean {
  try {
    const client = getGeminiClient()
    return !!client
  } catch {
    return false
  }
}

// Test function to verify API key works
export async function testGeminiConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const genAI = getGeminiClient()
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const result = await model.generateContent("Say 'Hello' in one word.")
    const response = await result.response
    const text = response.text()

    if (text && text.trim().length > 0) {
      return { success: true }
    } else {
      return { success: false, error: "Empty response from API" }
    }
  } catch (error: any) {
    console.error("Gemini connection test failed:", error)
    return {
      success: false,
      error: error.message || "Failed to connect to Gemini API",
    }
  }
}

// Add a new function to validate API key
export async function validateApiKey(): Promise<{ isValid: boolean; error?: string }> {
  try {
    const genAI = getGeminiClient()
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const result = await model.generateContent("Test")
    return { isValid: true }
  } catch (error: any) {
    if (error.message?.includes("API_KEY_INVALID")) {
      return { isValid: false, error: "Invalid API key" }
    }
    if (error.message?.includes("PERMISSION_DENIED")) {
      return { isValid: false, error: "API access denied" }
    }
    return { isValid: false, error: error.message }
  }
}

// Add retry mechanism for API calls
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    if (retries === 0 || error.message?.includes("API_KEY_INVALID")) {
      throw error
    }
    await new Promise(resolve => setTimeout(resolve, delay))
    return withRetry(fn, retries - 1, delay * 2)
  }
}
