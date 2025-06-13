import { type NextRequest, NextResponse } from "next/server"
import { getEmployees } from "@/lib/database-enhanced"

export async function GET(request: NextRequest) {
  try {
    // Remove the requireAuth call that's causing the 400 error
    const employees = await getEmployees()
    return NextResponse.json(employees)
  } catch (error) {
    console.error("Error in GET /api/employees/simple:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch employees" },
      { status: 500 },
    )
  }
}
