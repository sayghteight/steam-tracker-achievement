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
    // Fetch game details from Steam Store API
    const storeResponse = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&l=spanish`)
    const storeData = await storeResponse.json()

    if (!storeData || !storeData[appId] || !storeData[appId].success) {
      return NextResponse.json({ error: "Game not found or not accessible" }, { status: 404 })
    }

    const gameDetails = storeData[appId].data

    const game = {
      id: appId,
      name: gameDetails.name,
      description: gameDetails.about_the_game,
      image: gameDetails.header_image,
      screenshots: gameDetails.screenshots ? gameDetails.screenshots.map((s: any) => s.path_full) : [],
      developers: gameDetails.developers || [],
      publishers: gameDetails.publishers || [],
      release_date: gameDetails.release_date ? gameDetails.release_date.date : "N/A",
      genres: gameDetails.genres ? gameDetails.genres.map((g: any) => g.description) : [],
    }

    return NextResponse.json({ game })
  } catch (error) {
    console.error("Error fetching game details:", error)
    return NextResponse.json({ error: "Failed to fetch game details" }, { status: 500 })
  }
}
