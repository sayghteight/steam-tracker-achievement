import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const gameId = params.id

  try {
    const gameResponse = await fetch(`${request.nextUrl.origin}/api/steam/game/${gameId}`)
    const gameData = await gameResponse.json()

    if (gameData.error || !gameData.game) {
      return new ImageResponse(
        (
          <div tw="flex items-center justify-center w-[600px] h-[300px] text-white bg-gradient-to-r from-red-500 to-orange-400 text-2xl p-5">
            Error al cargar el juego
          </div>
        ),
        {
          width: 600,
          height: 300,
        },
      )
    }

    const gameName = gameData.game.name

    return new ImageResponse(
      (
        <div tw="flex flex-col items-center justify-center w-[800px] h-[400px] bg-gradient-to-r from-purple-500 to-pink-500 text-white p-10 border-4 border-purple-300">
          <div tw="flex items-center mb-5">
            <div tw="text-yellow-300 text-6xl mr-5">⭐</div>
            <span tw="text-5xl font-bold drop-shadow">¡PLATINO CONSEGUIDO!</span>
          </div>
          <span tw="text-2xl text-purple-200 text-center">en {gameName}</span>
          <div tw="flex mt-8 text-lg text-purple-400">Steam Achievement Tracker</div>
        </div>
      ),
      {
        width: 800,
        height: 400,
        headers: {
          "Cache-Control": "public, max-age=3600",
        },
      },
    )
  } catch (error) {
    console.error("Error generating badge:", error)
    return new ImageResponse(
      (
        <div tw="flex items-center justify-center w-[600px] h-[300px] text-white bg-gradient-to-r from-red-500 to-orange-400 text-2xl p-5">
          Error interno del servidor
        </div>
      ),
      {
        width: 600,
        height: 300,
      },
    )
  }
}
