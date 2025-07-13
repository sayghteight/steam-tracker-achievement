import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const STEAM_API_KEY = process.env.STEAM_API_KEY

  if (!STEAM_API_KEY) {
    return NextResponse.redirect(new URL("/login?error=no_api_key", request.url))
  }

  try {
    // Verificar la respuesta de Steam OpenID
    const openidMode = searchParams.get("openid.mode")
    const openidIdentity = searchParams.get("openid.identity")

    if (openidMode !== "id_res" || !openidIdentity) {
      return NextResponse.redirect(new URL("/login?error=invalid_response", request.url))
    }

    // Extraer Steam ID de la identidad
    const steamIdMatch = openidIdentity.match(/\/id\/(\d+)$/)
    if (!steamIdMatch) {
      return NextResponse.redirect(new URL("/login?error=invalid_steam_id", request.url))
    }

    const steamId = steamIdMatch[1]

    // Verificar la autenticación con Steam
    const verificationParams = new URLSearchParams()
    for (const [key, value] of searchParams.entries()) {
      verificationParams.append(key, value)
    }
    verificationParams.set("openid.mode", "check_authentication")

    const verificationResponse = await fetch("https://steamcommunity.com/openid/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: verificationParams.toString(),
    })

    const verificationText = await verificationResponse.text()
    if (!verificationText.includes("is_valid:true")) {
      return NextResponse.redirect(new URL("/login?error=verification_failed", request.url))
    }

    // Obtener información del usuario desde Steam API
    const playerResponse = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}`,
    )

    if (!playerResponse.ok) {
      return NextResponse.redirect(new URL("/login?error=steam_api_error", request.url))
    }

    const playerData = await playerResponse.json()
    const player = playerData.response?.players?.[0]

    if (!player) {
      return NextResponse.redirect(new URL("/login?error=player_not_found", request.url))
    }

    // Obtener juegos del usuario
    let gameCount = 0
    try {
      const gamesResponse = await fetch(
        `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1`,
      )
      if (gamesResponse.ok) {
        const gamesData = await gamesResponse.json()
        gameCount = gamesData.response?.game_count || 0
      }
    } catch (error) {
      console.log("Could not fetch games count:", error)
    }

    // Obtener nivel de Steam
    let level = 1
    try {
      const levelResponse = await fetch(
        `https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${STEAM_API_KEY}&steamid=${steamId}`,
      )
      if (levelResponse.ok) {
        const levelData = await levelResponse.json()
        level = levelData.response?.player_level || 1
      }
    } catch (error) {
      console.log("Could not fetch Steam level:", error)
    }

    // Crear objeto de usuario
    const user = {
      steamId: steamId,
      displayName: player.personaname,
      avatar: player.avatarfull,
      profileUrl: player.profileurl,
      gameCount: gameCount,
      level: level,
      achievementCount: 0, // Se calculará después
      lastLogin: new Date().toISOString(),
    }

    // Guardar en cookies (en producción usar una base de datos)
    const cookieStore = cookies()
    cookieStore.set("steam_user", JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 días
    })

    return NextResponse.redirect(new URL("/login?success=true", request.url))
  } catch (error) {
    console.error("Steam auth error:", error)
    return NextResponse.redirect(new URL("/login?error=server_error", request.url))
  }
}
