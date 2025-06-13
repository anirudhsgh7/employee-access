import { type NextRequest, NextResponse } from "next/server"
import { revokeAccess } from "@/lib/database"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const employeeId = Number.parseInt(params.id)
    const { roomId } = await request.json()

    await revokeAccess(employeeId, roomId)

    return NextResponse.json({ success: true })
  } catch (success) {
    return NextResponse.json({ error: "Failed to revoke access" }, { status: 500 })
  }
}
