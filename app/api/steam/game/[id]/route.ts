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
    const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${gameId}&l=spanish`)

    if (!response.ok) {
      throw new Error("Error obteniendo detalles del juego")
    }

    const data = await response.json()
    const gameData = data[gameId]?.data

    console.log(data)

    if (!gameData) {
      return NextResponse.json({ game: null, error: "Juego no encontrado" }, { status: 404 })
    }

    const game = {
      id: gameData.steam_appid,
      name: gameData.name,
      description: gameData.short_description,
      image: gameData.header_image,
      screenshots: gameData.screenshots?.map((s: any) => s.path_full) || [],
      developers: gameData.developers || [],
      publishers: gameData.publishers || [],
      release_date: gameData.release_date?.date || "Fecha desconocida",
      genres: gameData.genres?.map((g: any) => g.description) || [],
    }

    return NextResponse.json({ game })
  } catch (error) {
    console.error("Error fetching game details:", error)
    return NextResponse.json({ game: null, error: "Error al obtener detalles del juego" }, { status: 500 })
  }
}
