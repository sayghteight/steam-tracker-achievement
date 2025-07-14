"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Loader2, RefreshCw, Server, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ServiceStatus {
  name: string
  status: "Operational" | "Degraded Performance" | "Outage"
  description: string
}

interface StatusData {
  timestamp: string
  services: ServiceStatus[]
}

export default function StatusPage() {
  const [statusData, setStatusData] = useState<StatusData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/steam/status")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: StatusData = await response.json()
      setStatusData(data)
    } catch (err) {
      console.error("Error fetching Steam status:", err)
      setError("No se pudo cargar el estado de los servicios de Steam. Inténtalo de nuevo más tarde.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    // Opcional: Refrescar el estado cada cierto tiempo (ej. cada 5 minutos)
    const interval = setInterval(fetchStatus, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  const getStatusColor = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "Operational":
        return "bg-green-600 hover:bg-green-700"
      case "Degraded Performance":
        return "bg-yellow-600 hover:bg-yellow-700"
      case "Outage":
        return "bg-red-600 hover:bg-red-700"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "Operational":
        return <CheckCircle className="h-5 w-5" />
      case "Degraded Performance":
        return <AlertCircle className="h-5 w-5" />
      case "Outage":
        return <XCircle className="h-5 w-5" />
      default:
        return <Server className="h-5 w-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 relative overflow-hidden py-12">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Estado de Servicios de Steam
          </h1>
          <p className="text-xl text-slate-300 font-light">
            Verifica el estado actual de los servidores y servicios de Steam.
          </p>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-16 w-16 text-blue-400 animate-spin mb-6" />
            <p className="text-white text-2xl">Cargando estado de servicios...</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="max-w-2xl mx-auto bg-red-500/10 border-red-500/20 text-red-300">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {statusData && !isLoading && !error && (
          <div className="space-y-8">
            <div className="flex justify-center items-center gap-4 text-slate-400 text-sm mb-8">
              <Clock className="h-4 w-4" />
              <span>Última actualización: {new Date(statusData.timestamp).toLocaleString()}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchStatus}
                disabled={isLoading}
                className="border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 px-4 py-2 rounded-full text-white bg-transparent"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {statusData.services.map((service, index) => (
                <Card
                  key={service.name}
                  className="group relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-lg font-semibold text-white">{service.name}</CardTitle>
                    <Badge
                      className={`${getStatusColor(service.status)} text-white font-semibold px-3 py-1 rounded-full flex items-center gap-1`}
                    >
                      {getStatusIcon(service.status)}
                      {service.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 text-sm">{service.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
