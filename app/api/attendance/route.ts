import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { uid, nodeId } = await request.json()
    if (!uid) {
      return NextResponse.json({ success: false, error: "UID is required" }, { status: 400 })
    }

    // Look up the employee by active NFC card UID
    const { neon } = await import("@neondatabase/serverless")
    const sql = neon(process.env.DATABASE_URL!)

    // Find active card
    const cardRows: any[] = await sql`
      SELECT employee_id 
      FROM nfc_cards 
      WHERE card_uid = ${uid} AND is_active = true
      LIMIT 1
    `

    if (!cardRows.length) {
      return NextResponse.json({ success: false, error: "Card not recognized" }, { status: 404 })
    }

    const employeeId = cardRows[0].employee_id

    // Get node information if provided
    let nodeLocation = "Main Entrance"
    const actualNodeId = nodeId || "NODE_001"

    if (nodeId) {
      const nodeRows: any[] = await sql`
        SELECT location FROM nfc_nodes WHERE node_id = ${nodeId} AND is_active = true LIMIT 1
      `
      if (nodeRows.length > 0) {
        nodeLocation = nodeRows[0].location
      }
    }

    // Check the last attendance record for this employee today
    const lastRecord: any[] = await sql`
      SELECT tap_type FROM attendance_records
      WHERE employee_id = ${employeeId}
        AND DATE(tap_time) = CURRENT_DATE
      ORDER BY tap_time DESC
      LIMIT 1
    `

    // Determine tap type (IN if no record or last was OUT, OUT if last was IN)
    const tapType = !lastRecord.length || lastRecord[0].tap_type === "OUT" ? "IN" : "OUT"

    // Insert new attendance record
    await sql`
      INSERT INTO attendance_records (employee_id, nfc_card_uid, tap_type, location, node_id, node_location) 
      VALUES (${employeeId}, ${uid}, ${tapType}, ${nodeLocation}, ${actualNodeId}, ${nodeLocation})
    `

    // Update node heartbeat
    if (nodeId) {
      await sql`
        UPDATE nfc_nodes 
        SET last_heartbeat = CURRENT_TIMESTAMP 
        WHERE node_id = ${nodeId}
      `
    }

    return NextResponse.json({ success: true, tapType, location: nodeLocation })
  } catch (error) {
    console.error("Error in POST /api/attendance:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
