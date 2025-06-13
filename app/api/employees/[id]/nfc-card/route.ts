import { type NextRequest, NextResponse } from "next/server"
import { assignNFCCard } from "@/lib/database"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const employeeId = Number.parseInt(params.id)
    const { cardUid } = await request.json()

    await assignNFCCard(employeeId, cardUid)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to assign NFC card" }, { status: 500 })
  }
}
