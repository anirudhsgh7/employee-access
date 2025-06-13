import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { testPasswordVerification, createSecureHash } from "@/lib/auth-service-debug"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Debug endpoint not available in production" }, { status: 403 })
  }

  try {
    const { action, userId, password } = await request.json()

    switch (action) {
      case "check_user":
        const userResult = await sql`
          SELECT 
            id, user_id, full_name, is_active, failed_attempts, locked_until,
            LENGTH(password_hash) as hash_length,
            SUBSTRING(password_hash, 1, 10) as hash_prefix,
            CASE 
              WHEN password_hash LIKE '$2b$%' THEN 'bcrypt'
              WHEN password_hash LIKE '$2a$%' THEN 'bcrypt_old'
              ELSE 'unknown'
            END as hash_format
          FROM admin_users 
          WHERE user_id = ${userId}
        `

        return NextResponse.json({
          user: userResult[0] || null,
          found: userResult.length > 0,
        })

      case "test_password":
        const user = await sql`
          SELECT password_hash FROM admin_users WHERE user_id = ${userId}
        `

        if (user.length === 0) {
          return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const isValid = await testPasswordVerification(password, user[0].password_hash)

        return NextResponse.json({
          passwordValid: isValid,
          hashFormat: user[0].password_hash.substring(0, 7),
        })

      case "create_hash":
        const newHash = await createSecureHash(password)

        return NextResponse.json({
          originalPassword: password,
          newHash: newHash,
          hashLength: newHash.length,
        })

      case "fix_admin_password":
        const correctHash = await createSecureHash("admin123")

        await sql`
          UPDATE admin_users 
          SET password_hash = ${correctHash}, failed_attempts = 0, locked_until = NULL
          WHERE user_id = 'admin'
        `

        return NextResponse.json({
          message: "Admin password hash updated successfully",
          newHashLength: correctHash.length,
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Debug API error:", error)
    return NextResponse.json(
      {
        error: "Debug operation failed",
        details: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
