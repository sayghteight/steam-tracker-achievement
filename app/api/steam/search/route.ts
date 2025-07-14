import { NextRequest, NextResponse } from "next/server"

const STEAM_API_KEY = process.env.STEAM_API_KEY

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  if (!STEAM_API_KEY) {
    return NextResponse.json({ error: "Steam API Key not configured" }, { status: 500 })
  }

  try {
    // This endpoint is not officially documented by Steam for direct game search by name.
    // A common workaround is to use the Steam Store API's search functionality,
    // which is typically done via a web scrape or a more complex proxy.
    // For a direct API, we might need to fetch all games and filter, which is inefficient.
    // For demonstration, we'll simulate a search or use a simplified approach if available.

    // A more robust solution would involve a backend service that scrapes Steam Store search
    // or uses a third-party game database API (e.g., IGDB) that maps to Steam App IDs.

    // For now, let's try to fetch a list of popular games and filter them.
    // This is a placeholder and might not return accurate results for all queries.
    const response = await fetch(
      `https://api.steampowered.com/ISteamApps/GetAppList/v2/?key=${STEAM_API_KEY}`,
    )
    const data = await response.json()

    if (data.applist && data.applist.apps) {
      const filteredApps = data.applist.apps.filter((app: any) =>
        app.name.toLowerCase().includes(query.toLowerCase()),
      )

      // Limit results to avoid overwhelming the response
      const limitedApps = filteredApps.slice(0, 20)

      return NextResponse.json({ games: limitedApps })
    } else {
      return NextResponse.json({ games: [] })
    }
  } catch (error) {
    console.error("Error searching games:", error)
    return NextResponse.json({ error: "Failed to search games" }, { status: 500 })
  }
}
