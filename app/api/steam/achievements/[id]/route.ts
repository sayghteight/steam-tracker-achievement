import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const gameId = params.id
  const steamId = request.nextUrl.searchParams.get("steamId")
  const STEAM_API_KEY = process.env.STEAM_API_KEY

  if (!STEAM_API_KEY) {
    return NextResponse.json({ error: "STEAM_API_KEY no está configurada" }, { status: 500 })
  }

  if (!gameId) {
    return NextResponse.json({ error: "ID del juego no proporcionado" }, { status: 400 })
  }

  if (!steamId) {
    return NextResponse.json({ error: "Steam ID del usuario no proporcionado" }, { status: 400 })
  }

  try {
    // 1. Obtener el esquema de logros del juego (nombres, descripciones, iconos, porcentajes globales)
    const schemaResponse = await fetch(
      `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${STEAM_API_KEY}&appid=${gameId}`,
    )
    const schemaData = await schemaResponse.json()

    if (
      !schemaResponse.ok ||
      !schemaData ||
      !schemaData.game ||
      !schemaData.game.availableGameStats ||
      !schemaData.game.availableGameStats.achievements
    ) {
      console.warn(`No se encontró esquema de logros para el juego ${gameId}. Intentando solo logros del jugador.`)
      // Si no hay logros en el esquema, devolvemos un array vacío o manejamos según la lógica de la app
      return NextResponse.json({ achievements: [] }, { status: 200 })
    }

    const gameAchievementsSchema = schemaData.game.availableGameStats.achievements || []

    // 2. Obtener los logros del jugador para este juego
    const playerAchievementsResponse = await fetch(
      `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${gameId}&key=${STEAM_API_KEY}&steamid=${steamId}`,
    )
    const playerAchievementsData = await playerAchievementsResponse.json()

    if (
      !playerAchievementsResponse.ok ||
      !playerAchievementsData ||
      !playerAchievementsData.playerstats ||
      !playerAchievementsData.playerstats.achievements
    ) {
      console.warn(`No se encontraron logros del jugador para el juego ${gameId} y Steam ID ${steamId}.`)
      // Si no hay logros del jugador, devolvemos solo los del esquema (sin estado de "achieved")
      const achievementsWithRarity = await Promise.all(
        gameAchievementsSchema.map(async (ach: any) => {
          const rarityResponse = await fetch(
            `https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=${gameId}&format=json`,
          )
          const rarityData = await rarityResponse.json()
          const globalPercentage = rarityData?.achievementpercentages?.achievements?.find(
            (p: any) => p.name === ach.apiname,
          )?.percent

          let rarity = "common"
          if (globalPercentage !== undefined) {
            if (globalPercentage < 5) rarity = "mythic"
            else if (globalPercentage < 10) rarity = "legendary"
            else if (globalPercentage < 20) rarity = "epic"
            else if (globalPercentage < 40) rarity = "rare"
            else rarity = "common"
          }

          return {
            id: ach.apiname,
            name: ach.displayName,
            description: ach.description || "Logro secreto o sin descripción.",
            icon: ach.icon,
            iconGray: ach.icongray,
            hidden: ach.hidden === 1,
            percentage: globalPercentage,
            rarity: rarity,
            achieved: false, // Por defecto false si no hay datos del jugador
          }
        }),
      )
      return NextResponse.json({ achievements: achievementsWithRarity }, { status: 200 })
    }

    const playerAchievements = playerAchievementsData.playerstats.achievements

    // 3. Combinar los datos del esquema con los logros del jugador
    const combinedAchievements = await Promise.all(
      gameAchievementsSchema.map(async (schemaAch: any) => {
        const playerAch = playerAchievements.find((pa: any) => pa.apiname === schemaAch.apiname)

        // Obtener porcentaje global y calcular rareza
        const rarityResponse = await fetch(
          `https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=${gameId}&format=json`,
        )
        const rarityData = await rarityResponse.json()
        const globalPercentage = rarityData?.achievementpercentages?.achievements?.find(
          (p: any) => p.name === schemaAch.apiname,
        )?.percent

        let rarity = "common"
        if (globalPercentage !== undefined) {
          if (globalPercentage < 5) rarity = "mythic"
          else if (globalPercentage < 10) rarity = "legendary"
          else if (globalPercentage < 20) rarity = "epic"
          else if (globalPercentage < 40) rarity = "rare"
          else rarity = "common"
        }

        return {
          id: schemaAch.apiname,
          name: schemaAch.displayName,
          description: schemaAch.description || "Logro secreto o sin descripción.",
          icon: schemaAch.icon,
          iconGray: schemaAch.icongray,
          hidden: schemaAch.hidden === 1,
          percentage: globalPercentage,
          rarity: rarity,
          achieved: playerAch ? playerAch.achieved === 1 : false, // Si no se encuentra en los logros del jugador, se asume no conseguido
        }
      }),
    )

    return NextResponse.json({ achievements: combinedAchievements }, { status: 200 })
  } catch (error) {
    console.error("Error al obtener logros:", error)
    return NextResponse.json({ error: "Error interno del servidor al obtener logros" }, { status: 500 })
  }
}
