import { type NextRequest, NextResponse } from "next/server"
import { grantAccess } from "@/lib/database"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const employeeId = Number.parseInt(params.id)
    const { roomId } = await request.json()

    await grantAccess(employeeId, roomId, "System Administrator")

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to grant access" }, { status: 500 })
  }
}
