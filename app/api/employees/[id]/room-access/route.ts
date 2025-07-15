import { type NextRequest, NextResponse } from "next/server"
import { getEmployeeRoomAccess } from "@/lib/database-enhanced"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const employeeId = Number.parseInt(params.id)
    const roomAccess = await getEmployeeRoomAccess(employeeId)
    return NextResponse.json(roomAccess)
  } catch (error) {
    console.error("Failed to fetch employee room access:", error)
    return NextResponse.json({ error: "Failed to fetch room access" }, { status: 500 })
  }
}