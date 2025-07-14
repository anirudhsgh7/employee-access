// app/api/node/heartbeat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { updateNodeHeartbeat } from "@/lib/database-enhanced";
import { neon } from "@neondatabase/serverless";

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ success: false, error: "Node name is required" }, { status: 400 });
    }
    const sql = neon(process.env.DATABASE_URL!);
    // Find the node by its name in the database
    const result = await sql`SELECT node_id FROM nfc_nodes WHERE node_name = ${name} LIMIT 1`;
    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Node not found" }, { status: 404 });
    }
    const nodeId = result[0].node_id;
    // Use the existing helper to update heartbeat
    await updateNodeHeartbeat(nodeId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Heartbeat update failed:", error);
    return NextResponse.json({ error: "Failed to update heartbeat" }, { status: 500 });
  }
}
