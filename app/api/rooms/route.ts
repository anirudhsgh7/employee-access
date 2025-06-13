import { NextResponse } from "next/server"
import { getRooms } from "@/lib/database"

export async function GET() {
  try {
    const rooms = await getRooms()
    return NextResponse.json(rooms)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 })
  }
}
