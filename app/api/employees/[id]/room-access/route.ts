import { type NextRequest, NextResponse } from "next/server"
import { getEmployeeRoomAccessHistory } from "@/lib/database-enhanced"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const employeeId = Number.parseInt(params.id)
    const roomAccess = await getEmployeeRoomAccessHistory(employeeId)
    return NextResponse.json(roomAccess)
  } catch (error) {
    console.error("Failed to fetch employee room access history:", error)
    return NextResponse.json({ error: "Failed to fetch room access history" }, { status: 500 })
  }
}
