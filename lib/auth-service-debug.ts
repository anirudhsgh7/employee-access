import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
import { headers } from "next/headers"

const sql = neon(process.env.DATABASE_URL!)

export interface AuthResult {
  success: boolean
  user?: {
    id: number
    user_id: string
    full_name: string
  }
  error?: string
  locked?: boolean
  remainingAttempts?: number
  debugInfo?: {
    userFound: boolean
    userActive: boolean
    accountLocked: boolean
    passwordHashFormat: string
    passwordVerification: string
    step: string
  }
}

export interface LoginAttempt {
  user_id: string
  ip_address: string
  success: boolean
  error_message?: string
}

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes in milliseconds

export async function authenticateUser(userId: string, password: string, includeDebug = false): Promise<AuthResult> {
  const debugInfo: any = {
    step: "starting",
    userFound: false,
    userActive: false,
    accountLocked: false,
    passwordHashFormat: "unknown",
    passwordVerification: "not_attempted",
  }

  try {
    debugInfo.step = "input_validation"

    // Input validation
    const validationError = validateLoginInput(userId, password)
    if (validationError) {
      debugInfo.step = "validation_failed"
      await logLoginAttempt({
        user_id: userId,
        ip_address: await getClientIP(),
        success: false,
        error_message: validationError,
      })
      return {
        success: false,
        error: validationError,
        debugInfo: includeDebug ? debugInfo : undefined,
      }
    }

    debugInfo.step = "database_query"

    // Check if user exists and get user data
    const userResult = await sql`
      SELECT id, user_id, password_hash, full_name, is_active, failed_attempts, locked_until
      FROM admin_users 
      WHERE user_id = ${userId}
    `

    debugInfo.step = "user_verification"

    if (userResult.length === 0) {
      debugInfo.userFound = false
      await logLoginAttempt({
        user_id: userId,
        ip_address: await getClientIP(),
        success: false,
        error_message: "User not found",
      })
      return {
        success: false,
        error: "Invalid credentials",
        debugInfo: includeDebug ? debugInfo : undefined,
      }
    }

    const user = userResult[0] as any
    debugInfo.userFound = true
    debugInfo.userActive = user.is_active
    debugInfo.passwordHashFormat = user.password_hash
      ? user.password_hash.startsWith("$2b$")
        ? "bcrypt"
        : user.password_hash.startsWith("$2a$")
          ? "bcrypt_old"
          : "unknown"
      : "empty"

    // Check if user is active
    if (!user.is_active) {
      debugInfo.step = "user_inactive"
      await logLoginAttempt({
        user_id: userId,
        ip_address: await getClientIP(),
        success: false,
        error_message: "User account inactive",
      })
      return {
        success: false,
        error: "Account is disabled. Contact your administrator.",
        debugInfo: includeDebug ? debugInfo : undefined,
      }
    }

    debugInfo.step = "lockout_check"

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      debugInfo.accountLocked = true
      const remainingTime = Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / 60000)
      await logLoginAttempt({
        user_id: userId,
        ip_address: await getClientIP(),
        success: false,
        error_message: "Account locked",
      })
      return {
        success: false,
        error: `Account is locked. Try again in ${remainingTime} minutes.`,
        locked: true,
        debugInfo: includeDebug ? debugInfo : undefined,
      }
    }

    debugInfo.step = "password_verification"

    // Verify password
    let isValidPassword = false
    try {
      if (!user.password_hash) {
        debugInfo.passwordVerification = "no_hash_stored"
        throw new Error("No password hash stored")
      }

      isValidPassword = await bcrypt.compare(password, user.password_hash)
      debugInfo.passwordVerification = isValidPassword ? "valid" : "invalid"
    } catch (error) {
      debugInfo.passwordVerification = `error: ${error instanceof Error ? error.message : "unknown"}`
      console.error("Password verification error:", error)
      isValidPassword = false
    }

    if (!isValidPassword) {
      debugInfo.step = "password_failed"

      // Increment failed attempts
      const newFailedAttempts = (user.failed_attempts || 0) + 1
      let lockedUntil = null

      if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
        lockedUntil = new Date(Date.now() + LOCKOUT_DURATION)
      }

      await sql`
        UPDATE admin_users 
        SET failed_attempts = ${newFailedAttempts}, 
            locked_until = ${lockedUntil}
        WHERE id = ${user.id}
      `

      await logLoginAttempt({
        user_id: userId,
        ip_address: await getClientIP(),
        success: false,
        error_message: "Invalid password",
      })

      const remainingAttempts = MAX_FAILED_ATTEMPTS - newFailedAttempts

      if (lockedUntil) {
        return {
          success: false,
          error: "Too many failed attempts. Account has been locked for 15 minutes.",
          locked: true,
          debugInfo: includeDebug ? debugInfo : undefined,
        }
      }

      return {
        success: false,
        error: "Invalid credentials",
        remainingAttempts: Math.max(0, remainingAttempts),
        debugInfo: includeDebug ? debugInfo : undefined,
      }
    }

    debugInfo.step = "success"

    // Successful login - reset failed attempts and update last login
    await sql`
      UPDATE admin_users 
      SET failed_attempts = 0, 
          locked_until = NULL, 
          last_login = CURRENT_TIMESTAMP
      WHERE id = ${user.id}
    `

    await logLoginAttempt({ user_id: userId, ip_address: await getClientIP(), success: true })

    return {
      success: true,
      user: {
        id: user.id,
        user_id: user.user_id,
        full_name: user.full_name,
      },
      debugInfo: includeDebug ? debugInfo : undefined,
    }
  } catch (error) {
    debugInfo.step = "system_error"
    debugInfo.systemError = error instanceof Error ? error.message : "unknown error"

    console.error("Authentication error:", error)
    await logLoginAttempt({
      user_id: userId,
      ip_address: await getClientIP(),
      success: false,
      error_message: "System error",
    })
    return {
      success: false,
      error: "Authentication service temporarily unavailable",
      debugInfo: includeDebug ? debugInfo : undefined,
    }
  }
}

function validateLoginInput(userId: string, password: string): string | null {
  if (!userId || !password) {
    return "User ID and password are required"
  }

  if (typeof userId !== "string" || typeof password !== "string") {
    return "Invalid input format"
  }

  if (userId.length < 3 || userId.length > 50) {
    return "User ID must be between 3 and 50 characters"
  }

  if (password.length < 6 || password.length > 100) {
    return "Password must be between 6 and 100 characters"
  }

  // Check for basic SQL injection patterns
  const sqlInjectionPattern = /['";\\]|(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i
  if (sqlInjectionPattern.test(userId) || sqlInjectionPattern.test(password)) {
    return "Invalid characters detected"
  }

  return null
}

async function logLoginAttempt(attempt: LoginAttempt) {
  try {
    await sql`
      INSERT INTO login_attempts (user_id, ip_address, success, error_message)
      VALUES (${attempt.user_id}, ${attempt.ip_address}, ${attempt.success}, ${attempt.error_message || null})
    `
  } catch (error) {
    console.error("Failed to log login attempt:", error)
  }
}

async function getClientIP(): Promise<string> {
  try {
    const headersList = await headers()
    const forwarded = headersList.get("x-forwarded-for")
    const realIP = headersList.get("x-real-ip")

    if (forwarded) {
      return forwarded.split(",")[0].trim()
    }

    if (realIP) {
      return realIP
    }

    return "unknown"
  } catch {
    return "unknown"
  }
}

// Utility function to create a proper bcrypt hash
export async function createSecureHash(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// Utility function to test password verification
export async function testPasswordVerification(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    console.error("Password test error:", error)
    return false
  }
}
