import { type NextRequest, NextResponse } from "next/server"
import { getEmployeeAccess } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const employeeId = Number.parseInt(params.id)
    const access = await getEmployeeAccess(employeeId)
    return NextResponse.json(access)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch employee access" }, { status: 500 })
  }
}
