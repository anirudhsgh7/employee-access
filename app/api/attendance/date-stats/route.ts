import { type NextRequest, NextResponse } from "next/server"
import { getAttendanceStatsByDate } from "@/lib/database-enhanced"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    if (!date) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 })
    }

    const stats = await getAttendanceStatsByDate(date)
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Failed to fetch attendance stats by date:", error)
    return NextResponse.json({ totalEmployees: 0, totalCheckIns: 0, totalCheckOuts: 0 }, { status: 500 })
  }
}
