import { type NextRequest, NextResponse } from "next/server"
import { runAuthenticationDiagnostics, createValidAdminUser } from "@/lib/auth-test-service"

export async function POST(request: NextRequest) {
  try {
    const { action, userId, password } = await request.json()

    switch (action) {
      case "diagnose":
        if (!userId || !password) {
          return NextResponse.json({ error: "userId and password required" }, { status: 400 })
        }

        const diagnostics = await runAuthenticationDiagnostics(userId, password)
        const overallSuccess = diagnostics.every((result) => result.success)

        return NextResponse.json({
          success: overallSuccess,
          diagnostics,
          summary: {
            totalSteps: diagnostics.length,
            passedSteps: diagnostics.filter((r) => r.success).length,
            failedSteps: diagnostics.filter((r) => !r.success).length,
            criticalErrors: diagnostics.filter((r) => !r.success && r.error).map((r) => r.error),
          },
        })

      case "fix_admin":
        const fixResult = await createValidAdminUser()
        return NextResponse.json(fixResult)

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Diagnosis API error:", error)
    return NextResponse.json(
      {
        error: "Diagnosis failed",
        details: error instanceof Error ? error.message : "unknown error",
      },
      { status: 500 },
    )
  }
}
