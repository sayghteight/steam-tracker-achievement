import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const gameId = searchParams.get("id")
  const gameName = searchParams.get("gameName") || "Juego Desconocido"
  const gameLogoUrl = searchParams.get("gameLogoUrl")

  // Cargar la fuente (si es necesario, puedes usar una fuente de Google Fonts)
  const interBold = fetch(new URL("../../../../public/Inter-Bold.ttf", import.meta.url)).then((res) =>
    res.arrayBuffer(),
  )
  const interRegular = fetch(new URL("../../../../public/Inter-Regular.ttf", import.meta.url)).then((res) =>
    res.arrayBuffer(),
  )

  const [interBoldData, interRegularData] = await Promise.all([interBold, interRegular])

  // Cargar la imagen del logo del juego si se proporciona
  let gameLogoImage: ArrayBuffer | undefined
  if (gameLogoUrl) {
    try {
      const logoResponse = await fetch(gameLogoUrl)
      if (logoResponse.ok) {
        gameLogoImage = await logoResponse.arrayBuffer()
      } else {
        console.warn(`Failed to fetch game logo from ${gameLogoUrl}`)
      }
    } catch (error) {
      console.error(`Error fetching game logo ${gameLogoUrl}:`, error)
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
        background: "linear-gradient(135deg, #1a202c 0%, #2d3748 50%, #4a5568 100%)",
        color: "#fff",
        fontFamily: "Inter",
        padding: "40px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background elements */}
      <div
        style={{
          position: "absolute",
          top: "-50px",
          left: "-50px",
          width: "200px",
          height: "200px",
          background: "radial-gradient(circle, #63b3ed 0%, transparent 70%)",
          opacity: 0.1,
          borderRadius: "50%",
          filter: "blur(50px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-50px",
          right: "-50px",
          width: "250px",
          height: "250px",
          background: "radial-gradient(circle, #a78bfa 0%, transparent 70%)",
          opacity: 0.1,
          borderRadius: "50%",
          filter: "blur(50px)",
        }}
      />

      {gameLogoImage && (
        <img
          src={(gameLogoUrl as string) || "/placeholder.svg"}
          alt="Game Logo"
          width={120}
          height={120}
          style={{
            borderRadius: "20px",
            marginBottom: "20px",
            border: "4px solid #a78bfa",
            boxShadow: "0 0 20px rgba(167, 139, 250, 0.5)",
          }}
        />
      )}

      <div
        style={{
          fontSize: "64px",
          fontWeight: "bold",
          marginBottom: "10px",
          background: "linear-gradient(45deg, #fcd34d, #ef4444)",
          WebkitBackgroundClip: "text",
          color: "transparent",
          lineHeight: 1,
        }}
      >
        ¡PLATINO!
      </div>
      <div
        style={{
          fontSize: "36px",
          fontWeight: "bold",
          marginBottom: "20px",
          color: "#e2e8f0",
        }}
      >
        {gameName}
      </div>
      <div
        style={{
          fontSize: "24px",
          color: "#cbd5e0",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span style={{ fontSize: "30px" }}>🏆</span>
        Todos los logros desbloqueados
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          fontSize: "18px",
          color: "#a0aec0",
        }}
      >
        Steam Achievement Tracker
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter",
          data: interRegularData,
          weight: 400,
          style: "normal",
        },
        {
          name: "Inter",
          data: interBoldData,
          weight: 700,
          style: "normal",
        },
      ],
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    },
  )
}
