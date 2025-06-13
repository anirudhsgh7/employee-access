import bcrypt from "bcryptjs"

export async function generateSecurePassword(): Promise<{ password: string; hash: string }> {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
  let password = ""

  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  const hash = await bcrypt.hash(password, 12)

  return { password, hash }
}

export function validatePasswordStrength(password: string): {
  isValid: boolean
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) score += 1
  else feedback.push("Password should be at least 8 characters long")

  if (/[a-z]/.test(password)) score += 1
  else feedback.push("Password should contain lowercase letters")

  if (/[A-Z]/.test(password)) score += 1
  else feedback.push("Password should contain uppercase letters")

  if (/\d/.test(password)) score += 1
  else feedback.push("Password should contain numbers")

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
  else feedback.push("Password should contain special characters")

  return {
    isValid: score >= 4,
    score,
    feedback,
  }
}
