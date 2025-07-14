import { type NextRequest, NextResponse } from "next/server"
import { updateNFCNode, deleteNFCNode } from "@/lib/database-enhanced"

export async function PUT(request: NextRequest, { params }: { params: { nodeId: string } }) {
  try {
    const nodeData = await request.json()
    const updatedNode = await updateNFCNode(params.nodeId, nodeData)

    if (!updatedNode) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 })
    }

    return NextResponse.json(updatedNode)
  } catch (error) {
    console.error("Failed to update NFC node:", error)
    return NextResponse.json({ error: "Failed to update node" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { nodeId: string } }) {
  try {
    await deleteNFCNode(params.nodeId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete NFC node:", error)
    return NextResponse.json({ error: "Failed to delete node" }, { status: 500 })
  }
}
