import { NextResponse } from "next/server"
import { getTodayAttendance } from "@/lib/database-enhanced"

export async function GET() {
  try {
    const data = await getTodayAttendance()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in GET /api/attendance/today:", error)
    return NextResponse.json({ error: "Failed to fetch today's attendance" }, { status: 500 })
  }
}
