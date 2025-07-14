import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const gameId = params.id
  const { searchParams } = new URL(request.url)
  const gameName = searchParams.get("gameName") || "Juego Desconocido"

  try {
    // Fetch game details to get the actual game name if not provided
    let displayGameName = gameName
    if (gameName === "Juego Desconocido") {
      const gameResponse = await fetch(`${request.nextUrl.origin}/api/steam/game/${gameId}`)
      if (gameResponse.ok) {
        const gameData = await gameResponse.json()
        if (gameData.game && gameData.game.name) {
          displayGameName = gameData.game.name
        }
      }
    }

    return new ImageResponse(
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(to bottom right, #1a202c, #2d3748)", // Dark gradient background
          color: "white",
          fontFamily: "sans-serif",
          padding: "40px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background particles/glow */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "10%",
            width: "150px",
            height: "150px",
            background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
            filter: "blur(50px)",
            opacity: "0.3",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "15%",
            right: "10%",
            width: "200px",
            height: "200px",
            background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
            filter: "blur(60px)",
            opacity: "0.3",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            border: "2px solid #a78bfa", // Purple border
            borderRadius: "15px",
            padding: "30px 50px",
            background: "rgba(0,0,0,0.4)", // Semi-transparent dark background
            boxShadow: "0 10px 20px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              fontSize: "60px",
              fontWeight: "bold",
              marginBottom: "10px",
              background: "linear-gradient(to right, #fde047, #fbbf24)", // Gold gradient for text
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <span style={{ fontSize: "80px" }}>⭐</span>
            PLATINO CONSEGUIDO
            <span style={{ fontSize: "80px" }}>⭐</span>
          </div>
          <div
            style={{
              fontSize: "32px",
              color: "#cbd5e1", // Slate-300
              maxWidth: "600px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            en {displayGameName}
          </div>
          <div
            style={{
              fontSize: "20px",
              color: "#9ca3af", // Gray-400
              marginTop: "20px",
            }}
          >
            steam-achievement-tracker.vercel.app
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    )
  } catch (e: any) {
    console.error("Error generating image:", e)
    return new ImageResponse(
      <div
        style={{
          fontSize: 48,
          background: "black",
          color: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Error al generar el badge: {e.message}
      </div>,
      {
        width: 1200,
        height: 630,
      },
    )
  }
}
