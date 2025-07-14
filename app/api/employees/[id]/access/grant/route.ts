import { NextResponse } from "next/server"
import { grantRoomAccess } from "@/lib/database-enhanced" // Corrected import
import { getSession } from "@/lib/auth"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const employeeId = Number.parseInt(params.id)
    const { roomId } = await request.json()

    if (isNaN(employeeId) || isNaN(roomId)) {
      return NextResponse.json({ error: "Invalid employee ID or room ID" }, { status: 400 })
    }

    const grantedAccess = await grantRoomAccess(employeeId, roomId, session.user.id) // Corrected function call
    return NextResponse.json(grantedAccess)
  } catch (error) {
    console.error("Failed to grant room access:", error)
    return NextResponse.json({ error: "Failed to grant room access" }, { status: 500 })
  }
}
