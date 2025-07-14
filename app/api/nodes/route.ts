import { type NextRequest, NextResponse } from "next/server"
import { getNFCNodes, createNFCNode } from "@/lib/database-enhanced"

export async function GET() {
  try {
    const nodes = await getNFCNodes()
    return NextResponse.json(nodes)
  } catch (error) {
    console.error("Failed to fetch NFC nodes:", error)
    return NextResponse.json({ error: "Failed to fetch nodes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const nodeData = await request.json()

    // Validate required fields
    if (!nodeData.node_id || !nodeData.node_name || !nodeData.location) {
      return NextResponse.json({ error: "Missing required fields: node_id, node_name, location" }, { status: 400 })
    }

    const newNode = await createNFCNode(nodeData)
    return NextResponse.json(newNode, { status: 201 })
  } catch (error) {
    console.error("Failed to create NFC node:", error)
    return NextResponse.json({ error: "Failed to create node" }, { status: 500 })
  }
}
