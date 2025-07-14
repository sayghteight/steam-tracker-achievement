import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"
import { Star } from "lucide-react"

export const runtime = "edge" // Usar el runtime Edge para un rendimiento óptimo

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const gameId = params.id

  try {
    // Obtener el nombre del juego usando nuestra API existente
    const gameResponse = await fetch(`${request.nextUrl.origin}/api/steam/game/${gameId}`)
    const gameData = await gameResponse.json()

    if (gameData.error || !gameData.game) {
      return new ImageResponse(
        (
          <div
            style={{
              display: "flex",
              fontSize: 24,
              color: "white",
              backgroundImage: "linear-gradient(to right, #ef4444, #f97316)",
              width: "600px",
              height: "300px",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "20px",
            }}
          >
            Error al cargar el juego
          </div>
        ),
        {
          width: 600,
          height: 300,
        },
      );
    }

    const gameName = gameData.game.name

    return new ImageResponse(
      <div
        style={{
          display: "flex",
          fontSize: 32,
          color: "white",
          background: "linear-gradient(to right, #8b5cf6, #ec4899)", // Purple to Pink gradient
          width: "100%",
          height: "100%",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 40,
          borderRadius: 20,
          border: "4px solid #c084fc", // Light purple border
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
          <Star color="#fde047" size={64} style={{ marginRight: 20, animation: "spin 2s linear infinite" }} />
          <span style={{ fontSize: 48, fontWeight: "bold", textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>
            ¡PLATINO CONSEGUIDO!
          </span>
        </div>
        <span style={{ fontSize: 28, color: "#d8b4fe", textAlign: "center" }}>en {gameName}</span>
        <div style={{ display: "flex", marginTop: 30, fontSize: 20, color: "#a78bfa" }}>Steam Achievement Tracker</div>
      </div>,
      {
        width: 800,
        height: 400,
        headers: {
          "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        },
      },
    )
  } catch (error) {
    console.error("Error generating badge:", error)
    return new ImageResponse(
      <div
        style={{
          display: "flex",
          fontSize: 24,
          color: "white",
          background: "linear-gradient(to right, #ef4444, #f97316)",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        Error interno del servidor
      </div>,
      {
        width: 600,
        height: 300,
      },
    )
  }
}
