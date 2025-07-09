import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(process.env.DATABASE_URL!);

    // Fetch all attendance records with employee name, newest first
    const rows: any[] = await sql`
      SELECT 
        ar.*,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name
      FROM attendance_records ar
      LEFT JOIN employees e ON ar.employee_id = e.id
      ORDER BY ar.tap_time DESC
    `;
    // Return as JSON array
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error in GET /api/attendance/logs:", error);
    return NextResponse.json([], { status: 500 });
  }
}
