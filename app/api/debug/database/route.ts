import { NextResponse } from "next/server"

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: false,
        message: "DATABASE_URL not configured",
        details: { error: "Missing DATABASE_URL environment variable" },
      })
    }

    const { neon } = await import("@neondatabase/serverless")
    const sql = neon(process.env.DATABASE_URL)

    // Test basic connection
    const result = await sql`SELECT 1 as test, CURRENT_TIMESTAMP as timestamp`

    // Test if our tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('employees', 'admin_users', 'attendance_records')
    `

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      details: {
        connection: result[0],
        tables: tables.map((t: any) => t.table_name),
        tablesFound: tables.length,
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Database connection failed",
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
    })
  }
}
