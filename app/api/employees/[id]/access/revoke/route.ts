import { NextResponse } from "next/server"
import { revokeRoomAccess } from "@/lib/database-enhanced" // Corrected import
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

    await revokeRoomAccess(employeeId, roomId) // Corrected function call
    return NextResponse.json({ message: "Room access revoked successfully" })
  } catch (error) {
    console.error("Failed to revoke room access:", error)
    return NextResponse.json({ error: "Failed to revoke room access" }, { status: 500 })
  }
}
