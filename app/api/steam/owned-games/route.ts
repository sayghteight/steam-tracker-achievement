import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const STEAM_API_KEY = process.env.STEAM_API_KEY

  if (!STEAM_API_KEY) {
    return NextResponse.json({ error: "Steam API Key no configurada" }, { status: 500 })
  }

  try {
    // Obtener usuario autenticado
    const cookieStore = cookies()
    const userCookie = cookieStore.get("steam_user")

    if (!userCookie) {
      return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 })
    }

    const user = JSON.parse(userCookie.value)
    const steamId = user.steamId

    // Obtener juegos del usuario
    const gamesResponse = await fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1&format=json`,
    )

    if (!gamesResponse.ok) {
      throw new Error("Error obteniendo juegos del usuario")
    }

    const gamesData = await gamesResponse.json()
    const games = gamesData.response?.games || []

    // Formatear juegos
    const formattedGames = games.map((game: any) => ({
      id: game.appid.toString(),
      name: game.name,
      playtime: game.playtime_forever || 0,
      playtime2weeks: game.playtime_2weeks || 0,
      image: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.appid}/header.jpg`,
      lastPlayed: game.rtime_last_played ? new Date(game.rtime_last_played * 1000).toISOString() : null,
    }))

    return NextResponse.json({
      games: formattedGames,
      totalGames: games.length,
    })
  } catch (error) {
    console.error("Error fetching owned games:", error)
    return NextResponse.json({ error: "Error al obtener juegos del usuario" }, { status: 500 })
  }
}
