import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Simulate checking Steam API status
    // In a real application, you might make a small, quick API call to Steam
    // For example, fetching a very small piece of public data.
    // For now, we'll just return a success status.
    const steamStatus = {
      status: "operational",
      message: "Steam API is online and responding.",
      timestamp: new Date().toISOString(),
    }
    return NextResponse.json(steamStatus)
  } catch (error) {
    console.error("Error checking Steam API status:", error)
    return NextResponse.json({ status: "degraded", message: "Failed to reach Steam API." }, { status: 500 })
  }
}
