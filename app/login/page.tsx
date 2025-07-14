"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from 'lucide-react'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const res = await fetch("/api/auth/me")
        const data = await res.json()
        if (data.isLoggedIn) {
          setIsLoggedIn(true)
          // Save steamId to localStorage if logged in
          if (data.player?.steamId) {
            localStorage.setItem("steamId", data.player.steamId)
          }
          router.push("/") // Redirect to home if already logged in
        }
      } catch (error) {
        console.error("Error checking login status:", error)
      } finally {
        setIsLoading(false)
      }
    }
    checkLoginStatus()
  }, [router])

  const handleSteamLogin = () => {
    window.location.href = "/api/auth/steam"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
            <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto mb-6 relative z-10" />
          </div>
          <p className="text-white text-xl">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  if (isLoggedIn) {
    return null // Or a loading spinner, as the redirect will happen
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 text-white shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Steam Achievement Tracker
          </CardTitle>
          <CardDescription className="text-slate-300 mt-2">
            Inicia sesión con Steam para empezar a rastrear tus logros.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <img
            src="/placeholder-logo.png"
            alt="Steam Logo"
            className="w-32 h-32 object-contain mb-4 animate-fade-in"
          />
          <Button
            onClick={handleSteamLogin}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl text-lg transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <img src="/steam-icon.svg" alt="Steam Icon" className="w-6 h-6 mr-3" />
            Iniciar sesión con Steam
          </Button>
          <p className="text-xs text-slate-400 mt-4">
            Utilizamos OpenID para una autenticación segura. Tu información personal está protegida.
          </p>
        </CardContent>
      </Card>
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
