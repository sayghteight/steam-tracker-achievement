import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("q")

  if (!query || query.length < 3) {
    return NextResponse.json({ games: [] })
  }

  // Verificar si el usuario está autenticado para filtrar por juegos poseídos
  let ownedGameIds: string[] = []
  try {
    const cookieStore = cookies()
    const userCookie = cookieStore.get("steam_user")

    if (userCookie) {
      const user = JSON.parse(userCookie.value)
      const STEAM_API_KEY = process.env.STEAM_API_KEY

      if (STEAM_API_KEY) {
        const ownedGamesResponse = await fetch(
          `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${user.steamId}&format=json`,
        )

        if (ownedGamesResponse.ok) {
          const ownedGamesData = await ownedGamesResponse.json()
          ownedGameIds = ownedGamesData.response?.games?.map((game: any) => game.appid.toString()) || []
        }
      }
    }
  } catch (error) {
    console.log("Could not fetch owned games for filtering:", error)
  }

  try {
    // Usar Steam Store API para búsqueda
    const storeResponse = await fetch(
      `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=spanish&cc=ES`,
    )

    if (!storeResponse.ok) {
      throw new Error("Error en la búsqueda de Steam Store")
    }

    const storeData = await storeResponse.json()

    // Filtrar solo juegos (type: 'app') y limitar resultados
    const games =
      storeData.items
        ?.filter((item: any) => item.type === "app")
        ?.slice(0, 12)
        ?.map((item: any) => ({
          id: item.id.toString(),
          name: item.name,
          image: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${item.id}/header.jpg`,
          price: item.price?.final_formatted || "Gratis",
          description: item.short_description || "Sin descripción disponible",
          owned: ownedGameIds.includes(item.id.toString()), // Nuevo campo
        })) || []

    return NextResponse.json({ games })
  } catch (error) {
    console.error("Error searching Steam games:", error)
    return NextResponse.json({ games: [], error: "Error al buscar juegos" }, { status: 500 })
  }
}
