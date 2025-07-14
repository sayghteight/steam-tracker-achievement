import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  cookies().delete("steamId")
  return NextResponse.json({ message: "Logged out" }, { status: 200 })
}
