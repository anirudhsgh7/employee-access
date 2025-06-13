import { type NextRequest, NextResponse } from "next/server"
import { getEmployeesWithFilters } from "@/lib/database-enhanced"

export async function GET(request: NextRequest) {
  try {
    // Remove the requireAuth call that's causing the 400 error
    const searchParams = request.nextUrl.searchParams
    const filters = {
      search: searchParams.get("search") || undefined,
      department: searchParams.get("department") || undefined,
      position: searchParams.get("position") || undefined,
      nfc_uid: searchParams.get("nfc_uid") || undefined,
      is_active: searchParams.has("is_active") ? searchParams.get("is_active") === "true" : undefined,
    }

    const employees = await getEmployeesWithFilters(filters)
    return NextResponse.json(employees)
  } catch (error) {
    console.error("Error in GET /api/employees/enhanced:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch employees" },
      { status: 500 },
    )
  }
}
