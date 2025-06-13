/**
 * MAIN LOGIN API - MODIFIED FOR TEMPORARY BYPASS
 *
 * ⚠️ BYPASS MODE ACTIVE ⚠️
 *
 * This API has been temporarily modified to support authentication bypass.
 *
 * TO REVERT TO ORIGINAL:
 * 1. Change USE_BYPASS to false
 * 2. Or replace authenticateUserWithBypass with authenticateUserEnhanced
 */

import { type NextRequest, NextResponse } from "next/server"
import { authenticateUserWithBypass } from "@/lib/auth-bypass-temp"
import { authenticateUserEnhanced } from "@/lib/auth-service-enhanced"
import { setUserCookie } from "@/lib/auth"
import { loginRateLimiter } from "@/lib/rate-limiter"
import { headers } from "next/headers"

// 🚨 BYPASS CONTROL - SET TO FALSE TO USE NORMAL AUTHENTICATION
const USE_BYPASS = true

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const clientIP = getClientIP(headersList)

    // Rate limiting check (still applies even with bypass)
    if (loginRateLimiter.isRateLimited(clientIP)) {
      const resetTime = loginRateLimiter.getResetTime(clientIP)
      const remainingTime = Math.ceil((resetTime - Date.now()) / 60000)

      return NextResponse.json(
        {
          error: "Too many login attempts from this IP",
          errorCode: "RATE_LIMITED",
          rateLimited: true,
          retryAfter: remainingTime,
        },
        {
          status: 429,
          headers: {
            "Retry-After": remainingTime.toString(),
          },
        },
      )
    }

    // Parse request
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        {
          error: "Invalid request format",
          errorCode: "INVALID_JSON",
        },
        { status: 400 },
      )
    }

    const { userId, password, includeDebug } = body

    if (!userId || !password) {
      return NextResponse.json(
        {
          error: "User ID and password are required",
          errorCode: "MISSING_CREDENTIALS",
        },
        { status: 400 },
      )
    }

    // 🚨 CHOOSE AUTHENTICATION METHOD
    const authResult = USE_BYPASS
      ? await authenticateUserWithBypass(userId.trim(), password.trim())
      : await authenticateUserEnhanced(userId.trim(), password.trim())

    if (!authResult.success) {
      const statusCode = authResult.locked ? 423 : 401

      const response: any = {
        error: authResult.error,
        errorCode: authResult.errorCode,
        locked: authResult.locked,
      }

      if (authResult.remainingAttempts !== undefined) {
        response.remainingAttempts = authResult.remainingAttempts
      }

      if (authResult.bypassUsed !== undefined) {
        response.bypassUsed = authResult.bypassUsed
      }

      if (includeDebug || process.env.NODE_ENV === "development") {
        response.debugInfo = authResult.debugInfo
      }

      return NextResponse.json(response, { status: statusCode })
    }

    // Set session cookie
    await setUserCookie(authResult.user!)

    const response: any = {
      success: true,
      user: {
        user_id: authResult.user!.user_id,
        full_name: authResult.user!.full_name,
      },
    }

    if (authResult.bypassUsed) {
      response.bypassUsed = true
      response.warning = "⚠️ Authentication bypass was used - disable in production!"
    }

    if (includeDebug || process.env.NODE_ENV === "development") {
      response.debugInfo = authResult.debugInfo
    }

    return NextResponse.json(response, {
      headers: {
        "X-RateLimit-Remaining": loginRateLimiter.getRemainingAttempts(clientIP).toString(),
        "X-Bypass-Mode": USE_BYPASS ? "enabled" : "disabled",
      },
    })
  } catch (error) {
    console.error("Login API critical error:", error)

    return NextResponse.json(
      {
        error: "Authentication service critical error",
        errorCode: "CRITICAL_ERROR",
        details: process.env.NODE_ENV === "development" ? (error as Error).message : undefined,
      },
      { status: 503 },
    )
  }
}

function getClientIP(headersList: Headers): string {
  const forwarded = headersList.get("x-forwarded-for")
  const realIP = headersList.get("x-real-ip")
  const remoteAddr = headersList.get("x-vercel-forwarded-for")

  if (forwarded) return forwarded.split(",")[0].trim()
  if (realIP) return realIP
  if (remoteAddr) return remoteAddr.split(",")[0].trim()

  return "unknown"
}
