import { type NextRequest, NextResponse } from "next/server"
import { getAttendanceByDate } from "@/lib/database-enhanced"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    if (!date) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 })
    }

    const attendance = await getAttendanceByDate(date)

    // Ensure we always return an array
    if (!Array.isArray(attendance)) {
      console.error("getAttendanceByDate did not return an array:", attendance)
      return NextResponse.json([])
    }

    return NextResponse.json(attendance)
  } catch (error) {
    console.error("Failed to fetch attendance by date:", error)
    // Return empty array instead of error object
    return NextResponse.json([])
  }
}
