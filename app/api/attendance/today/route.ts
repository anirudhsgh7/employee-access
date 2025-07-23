import { NextResponse } from "next/server";
import { getTodayAttendance } from "@/lib/database-enhanced";

export async function GET() {
  try {
    const attendance = await getTodayAttendance(); // Use the function that filters by CURRENT_DATE
    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Error in GET /api/attendance/today:", error);
    return NextResponse.json({ error: "Failed to fetch today's attendance" }, { status: 500 });
  }
}
