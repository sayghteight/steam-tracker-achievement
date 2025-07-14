import { type NextRequest, NextResponse } from "next/server"

const STEAM_API_KEY = process.env.STEAM_API_KEY

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const gameId = params.id

  if (!STEAM_API_KEY) {
    return NextResponse.json({ error: "STEAM_API_KEY no está configurada." }, { status: 500 })
  }

  if (!gameId) {
    return NextResponse.json({ error: "ID del juego no proporcionado." }, { status: 400 })
  }

  try {
    // Fetch player achievements
    const playerAchievementsRes = await fetch(
      `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${gameId}&key=${STEAM_API_KEY}&steamid=76561198067000000`, // Replace with dynamic steamid later
    )
    const playerAchievementsData = await playerAchievementsRes.json()

    // Fetch global achievement percentages
    const globalAchievementsRes = await fetch(
      `https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=${gameId}`,
    )
    const globalAchievementsData = await globalAchievementsRes.json()

    // Fetch game schema (achievement details like name, description, icons)
    const gameSchemaRes = await fetch(
      `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${STEAM_API_KEY}&appid=${gameId}`,
    )
    const gameSchemaData = await gameSchemaRes.json()

    if (
      !playerAchievementsData?.playerstats ||
      !globalAchievementsData?.achievementpercentages ||
      !gameSchemaData?.game
    ) {
      return NextResponse.json({ error: "Datos de logros no encontrados para este juego." }, { status: 404 })
    }

    const playerAchievements = playerAchievementsData.playerstats.achievements || []
    const globalPercentages = globalAchievementsData.achievementpercentages.achievements || []
    const gameSchema = gameSchemaData.game

    const combinedAchievements = playerAchievements.map((playerAch: any) => {
      const globalPercent = globalPercentages.find((globalAch: any) => globalAch.name === playerAch.apiname)
      const schemaAch = gameSchema.availableGameStats?.achievements?.find(
        (schemaAch: any) => schemaAch.apiname === playerAch.apiname,
      )

      return {
        ...playerAch,
        name: schemaAch?.displayName || playerAch.apiname,
        description: schemaAch?.description || "No description available.",
        icon: schemaAch?.icon || "/placeholder.svg",
        icongray: schemaAch?.icon_gray || "/placeholder.svg",
        hidden: schemaAch?.hidden || 0,
        percent: globalPercent?.percent || 0,
      }
    })

    return NextResponse.json({
      game: {
        gameName: gameSchema.gameName || "Nombre de juego desconocido",
        gameLogoUrl: gameSchema.gameIcon || "/placeholder.svg", // Use gameIcon from schema
        achievements: combinedAchievements,
      },
    })
  } catch (error) {
    console.error("Error fetching Steam achievements:", error)
    return NextResponse.json({ error: "Error interno del servidor al obtener logros de Steam." }, { status: 500 })
  }
}
