import { type NextRequest, NextResponse } from "next/server"
import { getNodeActivityLogs } from "@/lib/database-enhanced"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const nodeId = searchParams.get("nodeId")
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    const logs = await getNodeActivityLogs(nodeId || undefined, limit)
    return NextResponse.json(logs)
  } catch (error) {
    console.error("Failed to fetch node activity logs:", error)
    return NextResponse.json({ error: "Failed to fetch activity logs" }, { status: 500 })
  }
}
