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
  errorCode?: string
  locked?: boolean
  remainingAttempts?: number
  debugInfo?: any
}

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000

export async function authenticateUserEnhanced(userId: string, password: string): Promise<AuthResult> {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    step: "starting",
    userId: userId,
  }

  try {
    // Input validation
    debugInfo.step = "input_validation"
    const validationError = validateLoginInput(userId, password)
    if (validationError) {
      debugInfo.validationError = validationError
      await logLoginAttempt({
        user_id: userId,
        ip_address: await getClientIP(),
        success: false,
        error_message: `Validation failed: ${validationError}`,
      })
      return {
        success: false,
        error: validationError,
        errorCode: "VALIDATION_ERROR",
        debugInfo,
      }
    }

    // Database query
    debugInfo.step = "database_query"
    let userResult
    try {
      userResult = await sql`
        SELECT id, user_id, password_hash, full_name, is_active, failed_attempts, locked_until
        FROM admin_users 
        WHERE user_id = ${userId}
      `
      debugInfo.queryExecuted = true
      debugInfo.userFound = userResult.length > 0
    } catch (dbError) {
      debugInfo.databaseError = dbError instanceof Error ? dbError.message : "unknown"
      await logLoginAttempt({
        user_id: userId,
        ip_address: await getClientIP(),
        success: false,
        error_message: `Database error: ${debugInfo.databaseError}`,
      })
      return {
        success: false,
        error: "Database connection error",
        errorCode: "DATABASE_ERROR",
        debugInfo,
      }
    }

    if (userResult.length === 0) {
      debugInfo.step = "user_not_found"
      await logLoginAttempt({
        user_id: userId,
        ip_address: await getClientIP(),
        success: false,
        error_message: "User not found",
      })
      return {
        success: false,
        error: "Invalid credentials",
        errorCode: "USER_NOT_FOUND",
        debugInfo,
      }
    }

    const user = userResult[0] as any
    debugInfo.step = "user_validation"
    debugInfo.userDetails = {
      id: user.id,
      isActive: user.is_active,
      failedAttempts: user.failed_attempts,
      hasPasswordHash: !!user.password_hash,
      passwordHashLength: user.password_hash?.length,
    }

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
        error: "Account is disabled",
        errorCode: "ACCOUNT_DISABLED",
        debugInfo,
      }
    }

    // Check account lock
    debugInfo.step = "lockout_check"
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const remainingTime = Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / 60000)
      debugInfo.accountLocked = true
      debugInfo.lockoutRemaining = remainingTime
      await logLoginAttempt({
        user_id: userId,
        ip_address: await getClientIP(),
        success: false,
        error_message: "Account locked",
      })
      return {
        success: false,
        error: `Account locked. Try again in ${remainingTime} minutes.`,
        errorCode: "ACCOUNT_LOCKED",
        locked: true,
        debugInfo,
      }
    }

    // Password verification
    debugInfo.step = "password_verification"
    let isValidPassword = false
    let passwordError = null

    try {
      if (!user.password_hash) {
        passwordError = "No password hash stored"
        debugInfo.passwordHashMissing = true
      } else {
        debugInfo.passwordHashFormat = user.password_hash.substring(0, 10)
        isValidPassword = await bcrypt.compare(password, user.password_hash)
        debugInfo.passwordVerificationResult = isValidPassword
      }
    } catch (error) {
      passwordError = `Password verification failed: ${error instanceof Error ? error.message : "unknown"}`
      debugInfo.passwordVerificationError = passwordError
    }

    if (!isValidPassword || passwordError) {
      debugInfo.step = "password_failed"
      debugInfo.passwordError = passwordError

      // Increment failed attempts
      const newFailedAttempts = (user.failed_attempts || 0) + 1
      let lockedUntil = null

      if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
        lockedUntil = new Date(Date.now() + LOCKOUT_DURATION)
        debugInfo.accountNowLocked = true
      }

      try {
        await sql`
          UPDATE admin_users 
          SET failed_attempts = ${newFailedAttempts}, 
              locked_until = ${lockedUntil}
          WHERE id = ${user.id}
        `
        debugInfo.failedAttemptsUpdated = true
        debugInfo.newFailedAttempts = newFailedAttempts
      } catch (updateError) {
        debugInfo.updateError = updateError instanceof Error ? updateError.message : "unknown"
      }

      await logLoginAttempt({
        user_id: userId,
        ip_address: await getClientIP(),
        success: false,
        error_message: passwordError || "Invalid password",
      })

      const remainingAttempts = MAX_FAILED_ATTEMPTS - newFailedAttempts

      if (lockedUntil) {
        return {
          success: false,
          error: "Too many failed attempts. Account locked for 15 minutes.",
          errorCode: "ACCOUNT_LOCKED_NOW",
          locked: true,
          debugInfo,
        }
      }

      return {
        success: false,
        error: "Invalid credentials",
        errorCode: "INVALID_PASSWORD",
        remainingAttempts: Math.max(0, remainingAttempts),
        debugInfo,
      }
    }

    // Successful login
    debugInfo.step = "success"
    try {
      await sql`
        UPDATE admin_users 
        SET failed_attempts = 0, 
            locked_until = NULL, 
            last_login = CURRENT_TIMESTAMP
        WHERE id = ${user.id}
      `
      debugInfo.loginSuccessUpdated = true
    } catch (updateError) {
      debugInfo.successUpdateError = updateError instanceof Error ? updateError.message : "unknown"
    }

    await logLoginAttempt({
      user_id: userId,
      ip_address: await getClientIP(),
      success: true,
    })

    return {
      success: true,
      user: {
        id: user.id,
        user_id: user.user_id,
        full_name: user.full_name,
      },
      debugInfo,
    }
  } catch (error) {
    debugInfo.step = "system_error"
    debugInfo.systemError = error instanceof Error ? error.message : "unknown"
    console.error("Authentication system error:", error)

    await logLoginAttempt({
      user_id: userId,
      ip_address: await getClientIP(),
      success: false,
      error_message: `System error: ${debugInfo.systemError}`,
    })

    return {
      success: false,
      error: "Authentication service unavailable",
      errorCode: "SYSTEM_ERROR",
      debugInfo,
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

  return null
}

async function logLoginAttempt(attempt: {
  user_id: string
  ip_address: string
  success: boolean
  error_message?: string
}) {
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
