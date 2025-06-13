import { NextResponse } from "next/server"

export async function GET() {
  try {
    const checks = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length || 0,
    }

    const success = checks.DATABASE_URL

    return NextResponse.json({
      success,
      message: success ? "Environment variables configured correctly" : "Missing required environment variables",
      details: checks,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to check environment variables",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
