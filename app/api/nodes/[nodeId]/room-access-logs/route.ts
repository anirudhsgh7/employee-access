import { NextResponse } from "next/server"
import { getRoomAccessLogsByNodeId } from "@/lib/database-enhanced"

export async function GET(_req: Request, context: { params: { nodeId?: string } }) {
  try {
    const nodeId = context.params?.nodeId
    if (!nodeId) {
      return NextResponse.json({ error: "Missing nodeId" }, { status: 400 })
    }

    const logs = await getRoomAccessLogsByNodeId(nodeId, 200)
    return new NextResponse(JSON.stringify({ logs }), {
      status: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
    })
  } catch (error: any) {
    console.error("GET /api/nodes/[nodeId]/room-access-logs error:", error)
    return NextResponse.json({ error: "Failed to fetch room access logs" }, { status: 500 })
  }
}
