// Client-side encryption utilities using Web Crypto API
export interface EncryptedData {
  encryptedContent: string
  salt: string
  iv: string
}


async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordBuffer = encoder.encode(password)

  const passwordKey = await crypto.subtle.importKey("raw", passwordBuffer, "PBKDF2", false, ["deriveKey"])

  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000, 
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


export async function encryptContent(content: string, password: string): Promise<EncryptedData> {
  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(content)

    const salt = crypto.getRandomValues(new Uint8Array(16))
    const iv = crypto.getRandomValues(new Uint8Array(12))

    const key = await deriveKey(password, salt)

    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      data,
    )

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


export async function decryptContent(encryptedData: EncryptedData, password: string): Promise<string> {
  try {
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

    const key = await deriveKey(password, salt)

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encryptedArray,
    )

    const decoder = new TextDecoder()
    return decoder.decode(decryptedBuffer)
  } catch (error) {
    console.error("Decryption failed:", error)
    throw new Error("Invalid password or corrupted data")
  }
}


export async function validatePassword(encryptedData: EncryptedData, password: string): Promise<boolean> {
  try {
    await decryptContent(encryptedData, password)
    return true
  } catch {
    return false
  }
}

export function generateSecurePassword(length = 16): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)

  return Array.from(array, (byte) => charset[byte % charset.length]).join("")
}


export function isCryptoSupported(): boolean {
  return !!(typeof crypto !== "undefined" && crypto.subtle && crypto.getRandomValues)
}
