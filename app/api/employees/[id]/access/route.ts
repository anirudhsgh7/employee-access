import { NextResponse } from "next/server"
import { getEmployeeRoomAccess } from "@/lib/database-enhanced" // Corrected import
import { getSession } from "@/lib/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const employeeId = Number.parseInt(params.id)

    if (isNaN(employeeId)) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 })
    }

    const accessPermissions = await getEmployeeRoomAccess(employeeId) // Corrected function call
    return NextResponse.json(accessPermissions)
  } catch (error) {
    console.error("Failed to fetch employee room access:", error)
    return NextResponse.json({ error: "Failed to fetch employee room access" }, { status: 500 })
  }
}
