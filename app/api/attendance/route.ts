import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { uid } = await request.json();
    if (!uid) {
      return NextResponse.json({ success: false, error: "UID is required" }, { status: 400 });
    }

    // Look up the employee by active NFC card UID
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(process.env.DATABASE_URL!);
    // Find active card
    const cardRows: any[] = await sql`
      SELECT employee_id 
      FROM nfc_cards 
      WHERE card_uid = ${uid} AND is_active = true
      LIMIT 1
    `;
    if (!cardRows.length) {
      return NextResponse.json({ success: false, error: "Card not recognized" }, { status: 404 });
    }
    const employeeId = cardRows[0].employee_id;

    // Check if attendance already recorded today
    const already: any[] = await sql`
      SELECT 1 FROM attendance_records
      WHERE employee_id = ${employeeId}
        AND DATE(tap_time) = CURRENT_DATE
      LIMIT 1
    `;
    if (already.length === 0) {
      // Insert new attendance record
      await sql`
        INSERT INTO attendance_records (employee_id, nfc_card_uid) 
        VALUES (${employeeId}, ${uid})
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in POST /api/attendance:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
