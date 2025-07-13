import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const gameId = params.id

  try {
    // Obtener detalles del juego desde Steam Store API
    const storeResponse = await fetch(`https://store.steampowered.com/api/appdetails?appids=${gameId}&l=spanish`)

    if (!storeResponse.ok) {
      throw new Error("Error obteniendo detalles del juego")
    }

    const storeData = await storeResponse.json()
    const gameData = storeData[gameId]

    if (!gameData?.success) {
      return NextResponse.json({ error: "Juego no encontrado" }, { status: 404 })
    }

    const game = {
      id: gameId,
      name: gameData.data.name,
      description: gameData.data.short_description || gameData.data.detailed_description,
      image: gameData.data.header_image,
      screenshots: gameData.data.screenshots?.map((s: any) => s.path_full) || [],
      developers: gameData.data.developers || [],
      publishers: gameData.data.publishers || [],
      price: gameData.data.price || 'free',
      release_date: gameData.data.release_date?.date || "Fecha desconocida",
      genres: gameData.data.genres?.map((g: any) => g.description) || [],
    }

    return NextResponse.json({ game })
  } catch (error) {
    console.error("Error fetching game details:", error)
    return NextResponse.json({ error: "Error al obtener detalles del juego" }, { status: 500 })
  }
}
