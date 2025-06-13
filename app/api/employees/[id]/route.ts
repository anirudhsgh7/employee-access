import { type NextRequest, NextResponse } from "next/server"
import { getEmployee, updateEmployee } from "@/lib/database-enhanced"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Remove the requireAuth call that's causing the 400 error
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 })
    }

    const employee = await getEmployee(id)
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    return NextResponse.json(employee)
  } catch (error) {
    console.error("Error in GET /api/employees/[id]:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch employee" },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Remove the requireAuth call that's causing the 400 error
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 })
    }

    const data = await request.json()

    // Validate required fields
    if (data.first_name === "" || data.last_name === "" || data.email === "") {
      return NextResponse.json({ error: "Required fields cannot be empty" }, { status: 400 })
    }

    // Validate email format if provided
    if (data.email && !data.email.includes("@")) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate phone number if provided
    if (data.phone_number && !/^\d{10}$/.test(data.phone_number)) {
      return NextResponse.json({ error: "Phone number must be exactly 10 digits" }, { status: 400 })
    }

    const employee = await updateEmployee(id, data)
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    return NextResponse.json(employee)
  } catch (error) {
    console.error("Error in PUT /api/employees/[id]:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update employee" },
      { status: 500 },
    )
  }
}
