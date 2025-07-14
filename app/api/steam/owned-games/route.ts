import { NextRequest, NextResponse } from "next/server"

const STEAM_API_KEY = process.env.STEAM_API_KEY

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const steamId = searchParams.get("steamId")

  if (!steamId) {
    return NextResponse.json({ error: "Steam ID is required" }, { status: 400 })
  }

  if (!STEAM_API_KEY) {
    return NextResponse.json({ error: "Steam API Key not configured" }, { status: 500 })
  }

  try {
    const response = await fetch(
      `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${steamId}&format=json&include_appinfo=true&include_played_free_games=true`,
    )
    const data = await response.json()

    if (data.response && data.response.games) {
      const games = data.response.games.map((game: any) => ({
        appId: game.appid,
        name: game.name,
        playtimeForever: game.playtime_forever,
        imgIconUrl: `http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`,
        imgLogoUrl: `http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_logo_url}.jpg`,
        hasCommunityVisibleStats: game.has_community_visible_stats || false,
      }))
      return NextResponse.json({ games })
    } else {
      return NextResponse.json({ games: [] })
    }
  } catch (error) {
    console.error("Error fetching owned games:", error)
    return NextResponse.json({ error: "Failed to fetch owned games" }, { status: 500 })
  }
}
