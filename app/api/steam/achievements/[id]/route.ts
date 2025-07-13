import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const gameId = params.id
  const STEAM_API_KEY = process.env.STEAM_API_KEY

  if (!STEAM_API_KEY) {
    return NextResponse.json(
      {
        error: "Steam API Key no configurada. Añade STEAM_API_KEY a las variables de entorno.",
      },
      { status: 500 },
    )
  }

  try {
    // Obtener esquema de logros del juego
    const achievementsResponse = await fetch(
      `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${STEAM_API_KEY}&appid=${gameId}&l=spanish`,
    )

    if (!achievementsResponse.ok) {
      throw new Error("Error obteniendo logros del juego")
    }

    const achievementsData = await achievementsResponse.json()

    if (!achievementsData.game?.availableGameStats?.achievements) {
      return NextResponse.json({
        achievements: [],
        message: "Este juego no tiene logros disponibles o no son públicos",
      })
    }

    const achievements = achievementsData.game.availableGameStats.achievements.map((achievement: any) => ({
      id: achievement.name,
      name: achievement.displayName,
      description: achievement.description || "Sin descripción",
      icon: achievement.icon,
      iconGray: achievement.icongray,
      hidden: achievement.hidden === 1,
    }))

    // Obtener estadísticas globales de logros para calcular rareza
    try {
      const globalStatsResponse = await fetch(
        `https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/?gameid=${gameId}`,
      )

      if (globalStatsResponse.ok) {
        const globalStatsData = await globalStatsResponse.json()
        const globalAchievements = globalStatsData.achievementpercentages?.achievements || []

        // Añadir porcentaje de rareza a cada logro
        achievements.forEach((achievement: any) => {
          const globalAchievement = globalAchievements.find((ga: any) => ga.name === achievement.id)
          if (globalAchievement) {
            achievement.percentage = Number.parseFloat(globalAchievement.percent)
            achievement.rarity = getRarityFromPercentage(achievement.percentage)
          } else {
            achievement.percentage = 0
            achievement.rarity = "unknown"
          }
        })
      }
    } catch (error) {
      console.log("No se pudieron obtener estadísticas globales:", error)
    }

    return NextResponse.json({ achievements })
  } catch (error) {
    console.error("Error fetching achievements:", error)
    return NextResponse.json(
      {
        achievements: [],
        error: "Error al obtener logros del juego",
      },
      { status: 500 },
    )
  }
}

function getRarityFromPercentage(percentage: number): string {
  if (percentage >= 50) return "common"
  if (percentage >= 20) return "uncommon"
  if (percentage >= 10) return "rare"
  if (percentage >= 5) return "epic"
  if (percentage >= 1) return "legendary"
  return "mythic"
}
