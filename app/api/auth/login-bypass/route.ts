/**
 * ⚠️ TEMPORARY BYPASS LOGIN API ⚠️
 *
 * This is a temporary login endpoint that bypasses normal password verification.
 *
 * TO REVERT:
 * 1. Delete this file
 * 2. Ensure app/api/auth/login/route.ts uses the original authentication
 *
 * SECURITY: This should NEVER be deployed to production
 */

import { type NextRequest, NextResponse } from "next/server"
import { authenticateUserWithBypass, isBypassEnabled } from "@/lib/auth-bypass-temp"
import { setUserCookie } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Check if bypass is enabled
    if (!isBypassEnabled()) {
      return NextResponse.json(
        {
          error: "Bypass authentication is disabled",
          errorCode: "BYPASS_DISABLED",
        },
        { status: 403 },
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

    const { userId, password } = body

    if (!userId || !password) {
      return NextResponse.json(
        {
          error: "User ID and password are required",
          errorCode: "MISSING_CREDENTIALS",
        },
        { status: 400 },
      )
    }

    // Attempt authentication with bypass
    const authResult = await authenticateUserWithBypass(userId.trim(), password.trim())

    if (!authResult.success) {
      return NextResponse.json(
        {
          error: authResult.error,
          errorCode: authResult.errorCode,
          bypassUsed: authResult.bypassUsed,
        },
        { status: 401 },
      )
    }

    // Set session cookie
    await setUserCookie(authResult.user!)

    return NextResponse.json({
      success: true,
      user: {
        user_id: authResult.user!.user_id,
        full_name: authResult.user!.full_name,
      },
      bypassUsed: authResult.bypassUsed,
      warning: authResult.bypassUsed ? "⚠️ Authentication bypass was used - disable in production!" : undefined,
    })
  } catch (error) {
    console.error("Bypass login API error:", error)

    return NextResponse.json(
      {
        error: "Authentication service error",
        errorCode: "CRITICAL_ERROR",
      },
      { status: 503 },
    )
  }
}
