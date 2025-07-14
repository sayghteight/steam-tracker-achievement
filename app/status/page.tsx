"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle, Clock, RefreshCcw } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface Status {
  status: "operational" | "degraded" | "offline"
  message: string
  timestamp: string
}

export default function StatusPage() {
  const [status, setStatus] = useState<Status | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/steam/status")
      const data = await response.json()
      if (response.ok) {
        setStatus(data)
      } else {
        setError(data.message || "Failed to fetch status.")
        setStatus({ status: "offline", message: data.message || "Unknown error", timestamp: new Date().toISOString() })
      }
    } catch (err) {
      console.error("Error fetching status:", err)
      setError("Network error or server unreachable.")
      setStatus({ status: "offline", message: "Network error or server unreachable.", timestamp: new Date().toISOString() })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const getStatusIcon = (status: Status["status"]) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="h-12 w-12 text-green-500" />
      case "degraded":
        return <Clock className="h-12 w-12 text-yellow-500" />
      case "offline":
        return <XCircle className="h-12 w-12 text-red-500" />
      default:
        return <Loader2 className="h-12 w-12 text-gray-500 animate-spin" />
    }
  }

  const getStatusColor = (status: Status["status"]) => {
    switch (status) {
      case "operational":
        return "bg-green-500/20 border-green-500/40"
      case "degraded":
        return "bg-yellow-500/20 border-yellow-500/40"
      case "offline":
        return "bg-red-500/20 border-red-500/40"
      default:
        return "bg-gray-500/20 border-gray-500/40"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex items-center justify-center p-4">
      <Card className={`w-full max-w-md bg-white/5 backdrop-blur-xl border text-white shadow-lg ${status ? getStatusColor(status.status) : 'border-white/10'}`}>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Estado del Servicio
          </CardTitle>
          <p className="text-slate-300 mt-2">Información en tiempo real sobre la disponibilidad de la API de Steam.</p>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          {isLoading ? (
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-xl text-white">Cargando estado...</p>
            </div>
          ) : status ? (
            <>
              <div className="text-center">
                {getStatusIcon(status.status)}
                <h2 className={`text-2xl font-bold mt-4 ${status.status === 'operational' ? 'text-green-400' : status.status === 'degraded' ? 'text-yellow-400' : 'text-red-400'}`}>
                  {status.status === "operational" && "Operacional"}
                  {status.status === "degraded" && "Rendimiento Degradado"}
                  {status.status === "offline" && "Fuera de Línea"}
                </h2>
                <p className="text-slate-300 mt-2">{status.message}</p>
                <p className="text-sm text-slate-400 mt-1">
                  Última actualización: {new Date(status.timestamp).toLocaleString()}
                </p>
              </div>
              <Button
                onClick={fetchStatus}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl text-lg transition-all duration-300 hover:scale-105"
              >
                <RefreshCcw className="h-5 w-5 mr-2" />
                Actualizar Estado
              </Button>
            </>
          ) : (
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-400 mt-4">Error</h2>
              <p className="text-slate-300 mt-2">{error || "No se pudo cargar el estado del servicio."}</p>
              <Button
                onClick={fetchStatus}
                className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl text-lg transition-all duration-300 hover:scale-105"
              >
                <RefreshCcw className="h-5 w-5 mr-2" />
                Reintentar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
