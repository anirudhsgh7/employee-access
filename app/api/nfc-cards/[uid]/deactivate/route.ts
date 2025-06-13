import { type NextRequest, NextResponse } from "next/server"
import { deactivateNFCCard } from "@/lib/database"

export async function POST(request: NextRequest, { params }: { params: { uid: string } }) {
  try {
    await deactivateNFCCard(params.uid)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to deactivate NFC card" }, { status: 500 })
  }
}
