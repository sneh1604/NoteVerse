// Client-side encryption utilities using Web Crypto API
export interface EncryptedData {
  encryptedContent: string
  salt: string
  iv: string
}

/**
 * Derives a cryptographic key from a password using PBKDF2
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordBuffer = encoder.encode(password)

  // Import the password as a key
  const passwordKey = await crypto.subtle.importKey("raw", passwordBuffer, "PBKDF2", false, ["deriveKey"])

  // Derive the actual encryption key
  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000, // High iteration count for security
      hash: "SHA-256",
    },
    passwordKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"],
  )
}

/**
 * Encrypts text content with a password
 */
export async function encryptContent(content: string, password: string): Promise<EncryptedData> {
  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(content)

    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const iv = crypto.getRandomValues(new Uint8Array(12))

    // Derive key from password
    const key = await deriveKey(password, salt)

    // Encrypt the content
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      data,
    )

    // Convert to base64 for storage
    const encryptedArray = new Uint8Array(encryptedBuffer)
    const encryptedContent = btoa(String.fromCharCode(...encryptedArray))
    const saltBase64 = btoa(String.fromCharCode(...salt))
    const ivBase64 = btoa(String.fromCharCode(...iv))

    return {
      encryptedContent,
      salt: saltBase64,
      iv: ivBase64,
    }
  } catch (error) {
    console.error("Encryption failed:", error)
    throw new Error("Failed to encrypt content")
  }
}

/**
 * Decrypts encrypted content with a password
 */
export async function decryptContent(encryptedData: EncryptedData, password: string): Promise<string> {
  try {
    // Convert from base64
    const encryptedArray = new Uint8Array(
      atob(encryptedData.encryptedContent)
        .split("")
        .map((char) => char.charCodeAt(0)),
    )
    const salt = new Uint8Array(
      atob(encryptedData.salt)
        .split("")
        .map((char) => char.charCodeAt(0)),
    )
    const iv = new Uint8Array(
      atob(encryptedData.iv)
        .split("")
        .map((char) => char.charCodeAt(0)),
    )

    // Derive key from password
    const key = await deriveKey(password, salt)

    // Decrypt the content
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encryptedArray,
    )

    // Convert back to string
    const decoder = new TextDecoder()
    return decoder.decode(decryptedBuffer)
  } catch (error) {
    console.error("Decryption failed:", error)
    throw new Error("Invalid password or corrupted data")
  }
}

/**
 * Validates if a password can decrypt the encrypted data
 */
export async function validatePassword(encryptedData: EncryptedData, password: string): Promise<boolean> {
  try {
    await decryptContent(encryptedData, password)
    return true
  } catch {
    return false
  }
}

/**
 * Generates a secure random password
 */
export function generateSecurePassword(length = 16): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)

  return Array.from(array, (byte) => charset[byte % charset.length]).join("")
}

/**
 * Checks if the browser supports the required crypto features
 */
export function isCryptoSupported(): boolean {
  return !!(typeof crypto !== "undefined" && crypto.subtle && crypto.getRandomValues)
}
