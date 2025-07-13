import { type NextRequest, NextResponse } from "next/server"
import { getEmployeeAttendanceHistory, getEmployeeAttendanceByDate } from "@/lib/database-enhanced"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const employeeId = Number.parseInt(params.id)
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    let attendance
    if (date) {
      // Get attendance for specific date
      attendance = await getEmployeeAttendanceByDate(employeeId, date)
    } else {
      // Get today's attendance by default
      attendance = await getEmployeeAttendanceHistory(employeeId, 50)
    }

    return NextResponse.json(attendance)
  } catch (error) {
    console.error("Failed to fetch employee attendance:", error)
    return NextResponse.json([], { status: 500 })
  }
}
