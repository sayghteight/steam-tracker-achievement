"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Home, Search, User, LogOut, Loader2, AlertCircle, Trophy, Play, ExternalLink, RefreshCcw, Settings, BarChart2, Bell, Share2, Download, Sun, Moon, Palette, Zap, Users, Star } from 'lucide-react'
import Link from "next/link"
import { useTheme } from "next-themes"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"

interface UserProfile {
  steamId: string
  personaName: string
  avatar: string
}

interface Game {
  appId: number
  name: string
  playtimeForever: number
  imgIconUrl: string
  imgLogoUrl: string
  hasCommunityVisibleStats: boolean
}

export default function HomePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const [games, setGames] = useState<Game[]>([])
  const [isLoadingGames, setIsLoadingGames] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false) // State to check if we are on the client
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  const router = useRouter()

  useEffect(() => {
    setIsClient(true) // Mark that we are on the client once mounted
  }, [])

  const fetchUserData = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me")
      const data = await res.json()
      if (data.isLoggedIn) {
        setUser(data.player)
        // Ensure steamId is saved in localStorage
        if (data.player?.steamId) {
          localStorage.setItem("steamId", data.player.steamId)
        }
      } else {
        router.push("/login")
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      setError("Failed to load user data.")
      router.push("/login")
    } finally {
      setIsLoadingUser(false)
    }
  }, [router])

  const fetchGames = useCallback(async (steamId: string) => {
    try {
      const res = await fetch(`/api/steam/owned-games?steamId=${steamId}`)
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setGames(data.games || [])
      }
    } catch (error) {
      console.error("Error fetching games:", error)
      setError("Failed to load games.")
    } finally {
      setIsLoadingGames(false)
    }
  }, [])

  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  useEffect(() => {
    if (user?.steamId) {
      fetchGames(user.steamId)
    }
  }, [user, fetchGames])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout")
      localStorage.removeItem("steamId") // Clear steamId from localStorage on logout
      localStorage.removeItem("steamAchievementProgress") // Clear progress
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
      toast({
        title: "Error al cerrar sesión",
        description: "No se pudo cerrar la sesión. Inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  const getGameCompletion = useCallback(
    (appId: number) => {
      if (!isClient) return 0 // Avoid localStorage access on server
      const progress = JSON.parse(localStorage.getItem("steamAchievementProgress") || "{}")
      const completedCount = progress[appId] || 0
      const gameAchievements = games.find((game) => game.appId === appId)?.hasCommunityVisibleStats
        ? 100 // Placeholder for total achievements if not fetched
        : 0 // If no stats, assume 0 achievements for progress calculation
      // In a real app, you'd fetch total achievements for each game
      // For now, we'll use a simplified calculation or a placeholder
      return gameAchievements > 0 ? Math.round((completedCount / gameAchievements) * 100) : 0
    },
    [games, isClient],
  )

  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoadingUser || isLoadingGames) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
            <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto mb-6 relative z-10" />
          </div>
          <p className="text-white text-xl">Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
            <AlertCircle className="h-20 w-20 text-red-400 mx-auto relative z-10" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-6">{error}</h1>
          <Button
            onClick={fetchUserData}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 rounded-xl"
          >
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border-4 border-blue-500 shadow-lg">
              <AvatarImage src={user?.avatar || "/placeholder-user.jpg"} />
              <AvatarFallback>{user?.personaName ? user.personaName[0] : "U"}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Hola, {user?.personaName || "Jugador"}
              </h1>
              <p className="text-slate-300">Bienvenido a tu rastreador de logros de Steam.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-900/95 text-white backdrop-blur-xl border-white/20">
                <DropdownMenuLabel>Configuración</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  {theme === "dark" ? (
                    <Sun className="mr-2 h-4 w-4" />
                  ) : (
                    <Moon className="mr-2 h-4 w-4" />
                  )}
                  Cambiar Tema
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-400" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 transition-all duration-300"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </header>

        {/* Search and Filters */}
        <div className="mb-12">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-6 w-6 z-10" />
            <Input
              placeholder="Buscar juegos por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white/10 border-white/20 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:bg-white/15 rounded-xl text-lg"
            />
          </div>
        </div>

        {/* Game List */}
        {filteredGames.length === 0 && searchTerm !== "" ? (
          <div className="text-center py-16">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full blur-xl"></div>
              <AlertCircle className="h-20 w-20 text-slate-600 mx-auto relative z-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-300 mb-4">No se encontraron juegos</h3>
            <p className="text-slate-400 text-lg">Intenta ajustar tu búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredGames.map((game, index) => {
              const completion = getGameCompletion(game.appId)
              const isPlatinum = completion === 100 && game.hasCommunityVisibleStats

              return (
                <Card
                  key={game.appId}
                  className={`group relative overflow-hidden bg-white/5 backdrop-blur-xl border transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl animate-fade-in ${
                    isPlatinum
                      ? "border-yellow-500/40 hover:border-yellow-400/60 shadow-yellow-500/20"
                      : "border-white/10 hover:border-white/20 hover:shadow-blue-500/20"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Glow Effect */}
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                      isPlatinum
                        ? "bg-gradient-to-br from-yellow-500/5 to-orange-500/5"
                        : "bg-gradient-to-br from-blue-500/5 to-purple-500/5"
                    }`}
                  ></div>

                  <CardContent className="p-0 relative z-10">
                    <div className="relative">
                      <img
                        src={game.imgLogoUrl || "/placeholder.svg"}
                        alt={game.name}
                        className="w-full h-40 object-cover rounded-t-xl"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=160&width=300"
                        }}
                      />
                      {isPlatinum && (
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg animate-pulse">
                          <Star className="h-4 w-4" /> Platino
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <CardTitle className="text-xl font-bold text-white mb-2 truncate">
                        {game.name}
                      </CardTitle>
                      <div className="flex items-center text-slate-400 text-sm mb-4">
                        <Play className="h-4 w-4 mr-1" />
                        <span>{Math.round(game.playtimeForever / 60)} horas jugadas</span>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-slate-300 mb-1">
                          <span>Progreso de logros</span>
                          <span>{completion}%</span>
                        </div>
                        <Progress value={completion} className="h-3 bg-slate-800/50" />
                      </div>

                      <div className="flex gap-3">
                        <Link href={`/game/${game.appId}`} className="flex-1">
                          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 rounded-lg transition-all duration-300 hover:scale-105">
                            <Trophy className="h-4 w-4 mr-2" />
                            Ver Logros
                          </Button>
                        </Link>
                        <a
                          href={`https://store.steampowered.com/app/${game.appId}/`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="icon" className="border-white/20 text-white hover:bg-white/10">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

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
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}
