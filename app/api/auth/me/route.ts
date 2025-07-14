import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const STEAM_API_KEY = process.env.STEAM_API_KEY

export async function GET() {
  const steamId = cookies().get("steamId")?.value

  if (!steamId) {
    return NextResponse.json({ isLoggedIn: false }, { status: 200 })
  }

  if (!STEAM_API_KEY) {
    return NextResponse.json({ error: "Steam API Key not configured" }, { status: 500 })
  }

  try {
    const response = await fetch(
      `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}`,
    )
    const data = await response.json()

    if (data.response.players && data.response.players.length > 0) {
      const player = data.response.players[0]
      return NextResponse.json({
        isLoggedIn: true,
        player: {
          steamId: player.steamid,
          personaName: player.personaname,
          avatar: player.avatarmedium,
        },
      })
    } else {
      return NextResponse.json({ isLoggedIn: false }, { status: 200 })
    }
  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
  }
}
