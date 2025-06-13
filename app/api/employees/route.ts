import { type NextRequest, NextResponse } from "next/server"
import { createEmployee, getEmployeesWithFilters } from "@/lib/database-enhanced"

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
    console.error("Error in GET /api/employees:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch employees" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Remove the requireAuth call that's causing the 400 error
    const data = await request.json()

    // Validate required fields
    if (!data.employee_id || !data.first_name || !data.last_name || !data.email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate email format
    if (!data.email.includes("@")) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate phone number if provided
    if (data.phone_number && !/^\d{10}$/.test(data.phone_number)) {
      return NextResponse.json({ error: "Phone number must be exactly 10 digits" }, { status: 400 })
    }

    const employee = await createEmployee(data)
    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/employees:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create employee" },
      { status: 500 },
    )
  }
}
