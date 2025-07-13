import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const steamId = searchParams.get("steamid")
  const appId = searchParams.get("appid")
  const STEAM_API_KEY = process.env.STEAM_API_KEY

  if (!STEAM_API_KEY) {
    return NextResponse.json(
      {
        error: "Steam API Key no configurada",
      },
      { status: 500 },
    )
  }

  if (!steamId || !appId) {
    return NextResponse.json(
      {
        error: "Se requiere steamid y appid",
      },
      { status: 400 },
    )
  }

  try {
    const response = await fetch(
      `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?key=${STEAM_API_KEY}&steamid=${steamId}&appid=${appId}&l=spanish`,
    )

    if (!response.ok) {
      throw new Error("Error obteniendo logros del jugador")
    }

    const data = await response.json()

    if (!data.playerstats?.success) {
      return NextResponse.json({
        achievements: [],
        error: "No se pudieron obtener los logros del jugador",
      })
    }

    const achievements =
      data.playerstats.achievements?.map((achievement: any) => ({
        id: achievement.apiname,
        achieved: achievement.achieved === 1,
        unlockTime: achievement.unlocktime || null,
      })) || []

    return NextResponse.json({ achievements })
  } catch (error) {
    console.error("Error fetching player achievements:", error)
    return NextResponse.json(
      {
        achievements: [],
        error: "Error al obtener logros del jugador",
      },
      { status: 500 },
    )
  }
}
