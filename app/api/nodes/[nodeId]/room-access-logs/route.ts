import { NextResponse } from "next/server"
import { getRoomAccessLogsByNodeId } from "@/lib/database-enhanced"

export async function GET(req: Request, { params }: { params: { nodeId: string } }) {
  try {
    const { searchParams } = new URL(req.url)
    const limitParam = searchParams.get("limit")
    const limit = limitParam ? Math.min(Math.max(Number.parseInt(limitParam, 10) || 50, 1), 500) : 100

    const nodeId = decodeURIComponent(params.nodeId)
    if (!nodeId) {
      return NextResponse.json({ error: "Missing nodeId" }, { status: 400 })
    }

    const logs = await getRoomAccessLogsByNodeId(nodeId, limit)
    return NextResponse.json(logs, { status: 200 })
  } catch (error) {
    console.error("Failed to fetch room access logs by node:", error)
    return NextResponse.json({ error: "Failed to fetch room access logs" }, { status: 500 })
  }
}
