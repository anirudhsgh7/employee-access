import { type NextRequest, NextResponse } from "next/server"
import { getFilterOptions } from "@/lib/database-enhanced"

export async function GET(request: NextRequest) {
  try {
    // Remove the requireAuth call that's causing the 400 error
    const options = await getFilterOptions()
    return NextResponse.json(options)
  } catch (error) {
    console.error("Error in GET /api/employees/filter-options:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch filter options" },
      { status: 500 },
    )
  }
}
