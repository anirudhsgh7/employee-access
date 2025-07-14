// app/api/nodes/[nodeId]/heartbeat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { updateNodeHeartbeat } from "@/lib/database-enhanced";
import { neon } from "@neondatabase/serverless";

export async function POST(req: NextRequest, { params }: { params: { nodeId: string } }) {
  const nodeId = params.nodeId;

  if (!nodeId) {
    return NextResponse.json({ success: false, error: "Node ID missing in URL" }, { status: 400 });
  }

  try {
    await updateNodeHeartbeat(nodeId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update heartbeat:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
