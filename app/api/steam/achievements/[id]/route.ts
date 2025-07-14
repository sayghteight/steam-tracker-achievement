import { NextRequest, NextResponse } from "next/server"

const STEAM_API_KEY = process.env.STEAM_API_KEY

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const appId = params.id

  if (!appId) {
    return NextResponse.json({ error: "App ID is required" }, { status: 400 })
  }

  if (!STEAM_API_KEY) {
    return NextResponse.json({ error: "Steam API Key not configured" }, { status: 500 })
  }

  try {
    // Fetch global achievement percentages
    const globalAchievementsResponse = await fetch(
      `http://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=${appId}&format=json`,
    )
    const globalAchievementsData = await globalAchievementsResponse.json()
    const globalPercentages =
      globalAchievementsData?.achievementpercentages?.achievements?.reduce((acc: any, ach: any) => {
        acc[ach.name] = ach.percent
        return acc
      }, {}) || {}

    // Fetch schema for achievement details (name, description, icons)
    const schemaResponse = await fetch(
      `http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${STEAM_API_KEY}&appid=${appId}&l=spanish`,
    )
    const schemaData = await schemaResponse.json()

    if (!schemaData || !schemaData.game || !schemaData.game.availableGameStats) {
      return NextResponse.json({ achievements: [] })
    }

    const gameAchievements = schemaData.game.availableGameStats.achievements || []

    const achievementsWithDetails = gameAchievements.map((ach: any) => {
      const percentage = globalPercentages[ach.name]
      let rarity = "common" // Default rarity

      if (percentage !== undefined) {
        if (percentage < 5) {
          rarity = "mythic"
        } else if (percentage < 10) {
          rarity = "legendary"
        } else if (percentage < 20) {
          rarity = "epic"
        } else if (percentage < 40) {
          rarity = "rare"
        } else if (percentage < 70) {
          rarity = "uncommon"
        } else {
          rarity = "common"
        }
      }

      return {
        id: ach.name,
        name: ach.displayName,
        description: ach.description || "No description available.",
        icon: ach.icon,
        iconGray: ach.icongray,
        hidden: ach.hidden === 1,
        percentage: percentage,
        rarity: rarity,
      }
    })

    return NextResponse.json({ achievements: achievementsWithDetails })
  } catch (error) {
    console.error("Error fetching achievements:", error)
    return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 })
  }
}
