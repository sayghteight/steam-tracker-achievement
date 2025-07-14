import { NextResponse } from "next/server"

// Define los tipos para el estado del servicio
interface ServiceStatus {
  name: string
  status: "Operational" | "Degraded Performance" | "Outage"
  description: string
}

// Función para simular el estado de un servicio
function simulateServiceStatus(serviceName: string): ServiceStatus {
  const statuses = ["Operational", "Degraded Performance", "Outage"] as const
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

  let description = ""
  switch (randomStatus) {
    case "Operational":
      description = "El servicio está funcionando correctamente."
      break
    case "Degraded Performance":
      description = "El servicio está experimentando un rendimiento reducido."
      break
    case "Outage":
      description = "El servicio no está disponible actualmente."
      break
  }

  return {
    name: serviceName,
    status: randomStatus,
    description: description,
  }
}

export async function GET() {
  // Simula un pequeño retraso para emular una llamada de red
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const services: ServiceStatus[] = [
    simulateServiceStatus("Steam Store"),
    simulateServiceStatus("Steam Community"),
    simulateServiceStatus("Steam API"),
    simulateServiceStatus("Steam Login"),
    simulateServiceStatus("Steam Matchmaking"),
    simulateServiceStatus("Steam Cloud"),
  ]

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    services,
  })
}
