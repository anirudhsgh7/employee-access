/**
 * ⚠️ TEMPORARY AUTHENTICATION BYPASS ⚠️
 *
 * This file contains a temporary bypass for authentication issues.
 *
 * SECURITY WARNING: This bypass should ONLY be used for debugging/emergency access
 * and MUST be removed before production deployment.
 *
 * TO REVERT TO NORMAL AUTHENTICATION:
 * 1. Change BYPASS_ENABLED to false
 * 2. Or delete this file and update the login API to use the original auth service
 *
 * Created: 2025-06-12
 * Reason: Emergency access due to bcrypt hash verification issues
 */

import { neon } from "@neondatabase/serverless"
import { headers } from "next/headers"

const sql = neon(process.env.DATABASE_URL!)

// 🚨 BYPASS CONTROL - SET TO FALSE TO DISABLE BYPASS
const BYPASS_ENABLED = true

// 🚨 HARDCODED CREDENTIALS FOR BYPASS
const BYPASS_CREDENTIALS = {
  userId: "admin",
  password: "admin123",
}

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
  bypassUsed?: boolean
  debugInfo?: any
}

export async function authenticateUserWithBypass(userId: string, password: string): Promise<AuthResult> {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    bypassEnabled: BYPASS_ENABLED,
    step: "starting",
  }

  try {
    // 🚨 TEMPORARY BYPASS LOGIC
    if (BYPASS_ENABLED && userId === BYPASS_CREDENTIALS.userId && password === BYPASS_CREDENTIALS.password) {
      console.warn("🚨 AUTHENTICATION BYPASS USED - This should be disabled in production!")

      // Still check if user exists in database
      const userResult = await sql`
        SELECT id, user_id, full_name, is_active
        FROM admin_users 
        WHERE user_id = ${userId}
      `

      if (userResult.length === 0) {
        // Create the admin user if it doesn't exist
        await sql`
          INSERT INTO admin_users (user_id, password_hash, full_name, is_active, failed_attempts, locked_until, created_at)
          VALUES (${userId}, 'BYPASS_TEMP_HASH', 'System Administrator', true, 0, NULL, CURRENT_TIMESTAMP)
          ON CONFLICT (user_id) DO UPDATE SET
            failed_attempts = 0,
            locked_until = NULL,
            is_active = true
        `

        const newUserResult = await sql`
          SELECT id, user_id, full_name, is_active
          FROM admin_users 
          WHERE user_id = ${userId}
        `

        if (newUserResult.length > 0) {
          const user = newUserResult[0] as any

          // Log successful bypass login
          await logLoginAttempt({
            user_id: userId,
            ip_address: await getClientIP(),
            success: true,
            error_message: "BYPASS_LOGIN_USED",
          })

          return {
            success: true,
            user: {
              id: user.id,
              user_id: user.user_id,
              full_name: user.full_name,
            },
            bypassUsed: true,
            debugInfo,
          }
        }
      } else {
        const user = userResult[0] as any

        // Reset any lockout status when using bypass
        await sql`
          UPDATE admin_users 
          SET failed_attempts = 0, 
              locked_until = NULL, 
              last_login = CURRENT_TIMESTAMP
          WHERE id = ${user.id}
        `

        // Log successful bypass login
        await logLoginAttempt({
          user_id: userId,
          ip_address: await getClientIP(),
          success: true,
          error_message: "BYPASS_LOGIN_USED",
        })

        return {
          success: true,
          user: {
            id: user.id,
            user_id: user.user_id,
            full_name: user.full_name,
          },
          bypassUsed: true,
          debugInfo,
        }
      }
    }

    // If bypass is disabled or credentials don't match bypass, return failure
    debugInfo.step = "bypass_not_used"

    await logLoginAttempt({
      user_id: userId,
      ip_address: await getClientIP(),
      success: false,
      error_message: "Invalid credentials (bypass disabled or wrong credentials)",
    })

    return {
      success: false,
      error: BYPASS_ENABLED ? "Invalid credentials" : "Authentication bypass is disabled. Use normal authentication.",
      errorCode: "INVALID_CREDENTIALS",
      bypassUsed: false,
      debugInfo,
    }
  } catch (error) {
    debugInfo.step = "system_error"
    debugInfo.systemError = error instanceof Error ? error.message : "unknown"
    console.error("Authentication bypass error:", error)

    return {
      success: false,
      error: "Authentication service unavailable",
      errorCode: "SYSTEM_ERROR",
      bypassUsed: false,
      debugInfo,
    }
  }
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

/**
 * 🔧 BYPASS CONTROL FUNCTIONS
 */

export function isBypassEnabled(): boolean {
  return BYPASS_ENABLED
}

export function getBypassCredentials() {
  if (!BYPASS_ENABLED) {
    return null
  }
  return BYPASS_CREDENTIALS
}

/**
 * 📝 REVERT INSTRUCTIONS:
 *
 * To disable the bypass and return to normal authentication:
 *
 * 1. Set BYPASS_ENABLED = false in this file
 * 2. Or update app/api/auth/login/route.ts to use authenticateUserEnhanced instead of authenticateUserWithBypass
 * 3. Or delete this file entirely and revert the login API
 *
 * Files modified for bypass:
 * - lib/auth-bypass-temp.ts (this file) - NEW FILE
 * - app/api/auth/login/route.ts - MODIFIED to use bypass
 *
 * Original authentication files (unchanged):
 * - lib/auth-service-enhanced.ts - Original enhanced auth service
 * - lib/auth-service-debug.ts - Debug auth service
 */
