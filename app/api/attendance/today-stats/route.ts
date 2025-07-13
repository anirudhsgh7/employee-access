import { NextResponse } from "next/server"
import { getTodayAttendanceStats } from "@/lib/database-enhanced"

export async function GET() {
  try {
    const stats = await getTodayAttendanceStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Failed to fetch today's attendance stats:", error)
    return NextResponse.json({ totalEmployees: 0, totalCheckIns: 0, totalCheckOuts: 0 }, { status: 500 })
  }
}
