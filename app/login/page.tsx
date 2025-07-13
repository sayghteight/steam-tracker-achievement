"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  GamepadIcon,
  Shield,
  Trophy,
  Users,
  Zap,
  Star,
  Lock,
  Unlock,
  ArrowRight,
  CheckCircle,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // Verificar si el usuario ya está logueado
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        }
      } catch (error) {
        console.error("Error checking auth:", error)
      }
    }

    checkAuth()
  }, [])

  const handleSteamLogin = async () => {
    setIsLoading(true)
    try {
      // Redirigir a la autenticación de Steam
      window.location.href = "/api/auth/steam"
    } catch (error) {
      console.error("Error during Steam login:", error)
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative flex items-center justify-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-8 py-4">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                  <h1 className="text-4xl font-black bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                    ¡Conectado con Steam!
                  </h1>
                </div>
              </div>
            </div>

            {/* User Profile Card */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 mb-8 hover:border-white/20 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3 text-2xl">
                  <div className="relative">
                    <img
                      src={user.avatar || "/placeholder.svg"}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full border-2 border-green-500"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
                  </div>
                  {user.displayName}
                  <Badge className="bg-gradient-to-r from-green-600 to-emerald-600">
                    <Shield className="h-3 w-3 mr-1" />
                    Verificado
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-xl border border-blue-500/20">
                    <GamepadIcon className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{user.gameCount || 0}</div>
                    <div className="text-sm text-blue-300">Juegos en Steam</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/10 rounded-xl border border-yellow-500/20">
                    <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{user.achievementCount || 0}</div>
                    <div className="text-sm text-yellow-300">Logros Totales</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/10 rounded-xl border border-purple-500/20">
                    <Star className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{user.level || 1}</div>
                    <div className="text-sm text-purple-300">Nivel Steam</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                  <div className="text-sm text-slate-400">
                    Steam ID: <span className="text-white font-mono">{user.steamId}</span>
                  </div>
                  <div className="flex gap-3">
                    <Link href="/">
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        <GamepadIcon className="h-4 w-4 mr-2" />
                        Ir al Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="border-white/20 hover:bg-white/10 bg-transparent"
                    >
                      Cerrar Sesión
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Unlock className="h-5 w-5 text-green-400" />
                    Funciones Desbloqueadas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 text-green-300">
                    <CheckCircle className="h-4 w-4" />
                    <span>Sincronización automática de juegos</span>
                  </div>
                  <div className="flex items-center gap-3 text-green-300">
                    <CheckCircle className="h-4 w-4" />
                    <span>Progreso real de logros</span>
                  </div>
                  <div className="flex items-center gap-3 text-green-300">
                    <CheckCircle className="h-4 w-4" />
                    <span>Filtros por juegos poseídos</span>
                  </div>
                  <div className="flex items-center gap-3 text-green-300">
                    <CheckCircle className="h-4 w-4" />
                    <span>Estadísticas personalizadas</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                    Próximas Funciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-400">
                    <div className="h-4 w-4 border border-slate-600 rounded"></div>
                    <span>Comparación con amigos</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <div className="h-4 w-4 border border-slate-600 rounded"></div>
                    <span>Notificaciones de logros</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <div className="h-4 w-4 border border-slate-600 rounded"></div>
                    <span>Análisis de tiempo de juego</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <div className="h-4 w-4 border border-slate-600 rounded"></div>
                    <span>Recomendaciones personalizadas</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative flex items-center justify-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-8 py-4">
                <Lock className="h-8 w-8 text-blue-400" />
                <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Conecta con Steam
                </h1>
              </div>
            </div>
            <p className="text-xl text-slate-300 mb-2">Accede a tu biblioteca completa y sincroniza tu progreso real</p>
            <p className="text-slate-400">Conecta tu cuenta de Steam para una experiencia personalizada y completa</p>
          </div>

          {/* Main Login Card */}
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-[1.02] mb-12">
            <CardContent className="p-12 text-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-green-600/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                  <GamepadIcon className="h-12 w-12 text-white" />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-white mb-4">Inicia Sesión con Steam</h2>
              <p className="text-slate-400 mb-8 text-lg leading-relaxed">
                Conecta tu cuenta de Steam para acceder a tu biblioteca completa, sincronizar tu progreso real de logros
                y desbloquear funciones exclusivas.
              </p>

              <Button
                onClick={handleSteamLogin}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Conectando...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5" />
                    Conectar con Steam
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </Button>

              <div className="mt-6 text-sm text-slate-500">
                <p>🔒 Conexión segura mediante Steam OpenID</p>
              </div>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="group bg-white/5 backdrop-blur-xl border border-white/10 hover:border-blue-500/30 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <GamepadIcon className="h-8 w-8 text-blue-400" />
                  </div>
                </div>
                <h3 className="text-white font-bold mb-2">Biblioteca Completa</h3>
                <p className="text-slate-400 text-sm">
                  Accede a todos tus juegos de Steam y filtra por los que realmente posees
                </p>
              </CardContent>
            </Card>

            <Card className="group bg-white/5 backdrop-blur-xl border border-white/10 hover:border-green-500/30 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Trophy className="h-8 w-8 text-green-400" />
                  </div>
                </div>
                <h3 className="text-white font-bold mb-2">Progreso Real</h3>
                <p className="text-slate-400 text-sm">
                  Sincroniza automáticamente tu progreso real de logros desde Steam
                </p>
              </CardContent>
            </Card>

            <Card className="group bg-white/5 backdrop-blur-xl border border-white/10 hover:border-purple-500/30 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 text-purple-400" />
                  </div>
                </div>
                <h3 className="text-white font-bold mb-2">Social</h3>
                <p className="text-slate-400 text-sm">
                  Compara tu progreso con amigos y compite por los mejores logros
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Benefits */}
          <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-2xl text-center flex items-center justify-center gap-3">
                <Zap className="h-6 w-6 text-yellow-400" />
                ¿Por qué conectar con Steam?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-white font-semibold">Filtrado Inteligente</h4>
                      <p className="text-slate-400 text-sm">
                        Ve solo los juegos que realmente posees en tu biblioteca de Steam
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-white font-semibold">Sincronización Automática</h4>
                      <p className="text-slate-400 text-sm">Tu progreso se actualiza automáticamente desde Steam</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-white font-semibold">Estadísticas Reales</h4>
                      <p className="text-slate-400 text-sm">Obtén estadísticas precisas basadas en tu actividad real</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-white font-semibold">Seguridad Total</h4>
                      <p className="text-slate-400 text-sm">Usamos Steam OpenID, no almacenamos tu contraseña</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-white font-semibold">Experiencia Personalizada</h4>
                      <p className="text-slate-400 text-sm">Recomendaciones y análisis basados en tus gustos</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-white font-semibold">Funciones Exclusivas</h4>
                      <p className="text-slate-400 text-sm">Acceso a funciones premium solo para usuarios conectados</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-12">
            <Link href="/">
              <Button
                variant="outline"
                className="border-white/20 hover:bg-white/10 hover:border-white/30 bg-transparent"
              >
                Continuar sin conectar
              </Button>
            </Link>
            <p className="text-slate-500 text-sm mt-4">
              Puedes usar la aplicación sin conectar, pero tendrás funciones limitadas
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
