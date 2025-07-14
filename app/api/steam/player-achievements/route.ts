import { NextRequest, NextResponse } from "next/server"

const STEAM_API_KEY = process.env.STEAM_API_KEY

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const steamId = searchParams.get("steamId")
  const appId = searchParams.get("appId")

  if (!steamId || !appId) {
    return NextResponse.json({ error: "Steam ID and App ID are required" }, { status: 400 })
  }

  if (!STEAM_API_KEY) {
    return NextResponse.json({ error: "Steam API Key not configured" }, { status: 500 })
  }

  try {
    const response = await fetch(
      `http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${appId}&key=${STEAM_API_KEY}&steamid=${steamId}&l=spanish`,
    )
    const data = await response.json()

    if (data.playerstats && data.playerstats.achievements) {
      return NextResponse.json({ achievements: data.playerstats.achievements })
    } else if (data.playerstats && data.playerstats.error) {
      return NextResponse.json({ error: data.playerstats.error }, { status: 404 })
    } else {
      return NextResponse.json({ achievements: [] })
    }
  } catch (error) {
    console.error("Error fetching player achievements:", error)
    return NextResponse.json({ error: "Failed to fetch player achievements" }, { status: 500 })
  }
}
