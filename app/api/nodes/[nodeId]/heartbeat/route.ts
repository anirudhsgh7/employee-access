import { type NextRequest, NextResponse } from "next/server"
import { updateNodeHeartbeat } from "@/lib/database-enhanced"

export async function POST(request: NextRequest, { params }: { params: { nodeId: string } }) {
  try {
    await updateNodeHeartbeat(params.nodeId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update node heartbeat:", error)
    return NextResponse.json({ error: "Failed to update heartbeat" }, { status: 500 })
  }
}
