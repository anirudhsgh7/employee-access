// app/api/attendance/date/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getAttendanceByDate } from "@/lib/database-enhanced"; // Import your function

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date"); // Get the date from the query parameter

    if (!date) {
      return NextResponse.json({ error: "Date query parameter is required" }, { status: 400 });
    }

    const attendance = await getAttendanceByDate(date); // Use the function that filters by the provided date
    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Error in GET /api/attendance/date:", error);
    return NextResponse.json({ error: "Failed to fetch attendance for date" }, { status: 500 });
  }
}
