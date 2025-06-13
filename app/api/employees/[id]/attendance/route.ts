import { type NextRequest, NextResponse } from "next/server"
import { getEmployeeAttendanceHistory } from "@/lib/database-enhanced"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const employeeId = Number.parseInt(params.id)
    const attendance = await getEmployeeAttendanceHistory(employeeId)
    return NextResponse.json(attendance)
  } catch (error) {
    console.error("Failed to fetch employee attendance history:", error)
    return NextResponse.json({ error: "Failed to fetch attendance history" }, { status: 500 })
  }
}
