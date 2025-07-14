import { type NextRequest, NextResponse } from "next/server"
import { getEmployeeAttendanceHistory, getEmployeeAttendanceByDate } from "@/lib/database-enhanced"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const employeeId = Number.parseInt(params.id)

    if (isNaN(employeeId)) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    let attendance
    if (date) {
      // Get attendance for specific date
      attendance = await getEmployeeAttendanceByDate(employeeId, date)
    } else {
      // Always default to today's attendance
      attendance = await getEmployeeAttendanceHistory(employeeId)
    }

    return NextResponse.json(attendance)
  } catch (error) {
    console.error("Failed to fetch employee attendance:", error)
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 })
  }
}
