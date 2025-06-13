import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { getTodayAttendance } = await import("@/lib/database-enhanced")
    const attendance = await getTodayAttendance()

    // Ensure we always return an array
    if (!Array.isArray(attendance)) {
      console.error("getTodayAttendance did not return an array:", attendance)
      return NextResponse.json([])
    }

    return NextResponse.json(attendance)
  } catch (error) {
    console.error("Failed to fetch today's attendance:", error)

    // Return empty array instead of error object
    return NextResponse.json([])
  }
}
