"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Trophy,
  Star,
  GamepadIcon,
  Loader2,
  Grid3X3,
  List,
  Filter,
  Eye,
  BarChart3,
  Zap,
  Target,
  Award,
  Shield,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/use-debounce"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
// Importar el componente UserProfile al inicio del archivo
import { UserProfile } from "@/components/user-profile"

interface Game {
  id: string
  name: string
  image: string
  price?: string
  description: string
  owned?: boolean // Nuevo campo
}

type ViewMode = "grid" | "list"
type SortBy = "name" | "price" | "progress"

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [userProgress, setUserProgress] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [sortBy, setSortBy] = useState<SortBy>("name")
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [showOwnedOnly, setShowOwnedOnly] = useState(false)

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  useEffect(() => {
    const savedProgress = localStorage.getItem("steamAchievementProgress")
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress))
    }
  }, [])

  const searchGames = useCallback(async (query: string) => {
    if (query.length < 3) {
      setGames([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/steam/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setGames([])
      } else {
        setGames(data.games || [])
      }
    } catch (error) {
      console.error("Error searching games:", error)
      setError("Error al buscar juegos. Inténtalo de nuevo.")
      setGames([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    searchGames(debouncedSearchTerm)
  }, [debouncedSearchTerm, searchGames])

  const filteredGames = showOwnedOnly ? games.filter((game) => game.owned) : games
  const sortedGames = [...filteredGames].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name)
      case "price":
        const priceA = a.price === "Gratis" ? 0 : Number.parseFloat(a.price?.replace(/[^0-9.,]/g, "") || "999")
        const priceB = b.price === "Gratis" ? 0 : Number.parseFloat(b.price?.replace(/[^0-9.,]/g, "") || "999")
        return priceA - priceB
      case "progress":
        const progressA = userProgress[a.id] || 0
        const progressB = userProgress[b.id] || 0
        return progressB - progressA
      default:
        return 0
    }
  })

  const totalGamesTracked = Object.keys(userProgress).length
  const totalAchievements = Object.values(userProgress).reduce((sum, count) => sum + count, 0)
  const averageCompletion =
    totalGamesTracked > 0
      ? Math.round(Object.values(userProgress).reduce((sum, count) => sum + count, 0) / totalGamesTracked)
      : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Enhanced Header with Glassmorphism */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative flex items-center justify-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-8 py-4">
              <div className="relative">
                <GamepadIcon className="h-12 w-12 text-blue-400" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-ping"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"></div>
              </div>
              <h1 className="text-6xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Steam Achievement Tracker
              </h1>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-2xl text-slate-300 font-light">
              Rastrea tus logros de Steam y alcanza el platino en tus juegos favoritos
            </p>
            {/* En el header, reemplazar el área donde dice "Conectado a Steam API" con: */}
            <div className="flex items-center justify-center gap-6 text-sm">
              <UserProfile />
              <Separator orientation="vertical" className="h-6 bg-white/20" />
              <div className="text-slate-400 font-medium">
                {games.length > 0 && `${games.length} juegos encontrados`}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search Bar with Glow Effects */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400 h-6 w-6 z-10" />
              <Input
                type="text"
                placeholder="Buscar juegos en Steam (mínimo 3 caracteres)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-16 pr-16 bg-white/5 backdrop-blur-xl border border-white/20 text-white placeholder-slate-400 text-xl py-8 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:bg-white/10"
              />
              {isLoading && (
                <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="text-blue-400 h-6 w-6 animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Search Controls */}
          {searchTerm.length >= 3 && games.length > 0 && (
            <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <Filter className="h-5 w-5 text-blue-400" />
                    <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
                      <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900/95 backdrop-blur-xl text-white border-white/20">
                        <SelectItem value="name">Nombre A-Z</SelectItem>
                        <SelectItem value="price">Precio</SelectItem>
                        <SelectItem value="progress">Progreso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant={showOwnedOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowOwnedOnly(!showOwnedOnly)}
                    className={`transition-all duration-300 rounded-xl ${
                      showOwnedOnly
                        ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        : "border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <Shield className="h-4 w-4 mr-1" />
                    Solo mis juegos
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`transition-all duration-300 ${
                      viewMode === "grid"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25"
                        : "border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={`transition-all duration-300 ${
                      viewMode === "list"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25"
                        : "border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {searchTerm.length > 0 && searchTerm.length < 3 && (
            <p className="text-slate-400 text-center mt-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg py-3 px-4">
              ✨ Escribe al menos 3 caracteres para buscar
            </p>
          )}
          {error && (
            <p className="text-red-300 text-center mt-4 bg-red-500/10 border border-red-500/20 rounded-lg py-3 px-4">
              ⚠️ {error}
            </p>
          )}
        </div>

        {/* Enhanced Stats with Glassmorphism */}
        <Tabs defaultValue="overview" className="mb-12">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all duration-300"
            >
              Resumen
            </TabsTrigger>
            <TabsTrigger
              value="detailed"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all duration-300"
            >
              Detallado
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all duration-300"
            >
              Logros
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all duration-300"
            >
              Análisis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Enhanced Stat Cards */}
              <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-xl border border-blue-500/20 hover:border-blue-400/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                  <CardTitle className="text-sm font-medium text-blue-200">Juegos Rastreados</CardTitle>
                  <div className="relative">
                    <GamepadIcon className="h-6 w-6 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-blue-400 rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-4xl font-black text-white mb-2 group-hover:text-blue-300 transition-colors duration-300">
                    {totalGamesTracked}
                  </div>
                  <p className="text-xs text-blue-300/80">En tu biblioteca</p>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 backdrop-blur-xl border border-yellow-500/20 hover:border-yellow-400/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                  <CardTitle className="text-sm font-medium text-yellow-200">Logros Totales</CardTitle>
                  <div className="relative">
                    <Trophy className="h-6 w-6 text-yellow-400 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                    <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-4xl font-black text-white mb-2 group-hover:text-yellow-300 transition-colors duration-300">
                    {totalAchievements}
                  </div>
                  <p className="text-xs text-yellow-300/80">Desbloqueados</p>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-xl border border-green-500/20 hover:border-green-400/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                  <CardTitle className="text-sm font-medium text-green-200">Promedio</CardTitle>
                  <div className="relative">
                    <BarChart3 className="h-6 w-6 text-green-400 group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-green-400 rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-4xl font-black text-white mb-2 group-hover:text-green-300 transition-colors duration-300">
                    {averageCompletion}
                  </div>
                  <p className="text-xs text-green-300/80">Logros por juego</p>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-xl border border-purple-500/20 hover:border-purple-400/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                  <CardTitle className="text-sm font-medium text-purple-200">Platinos</CardTitle>
                  <div className="relative">
                    <Star className="h-6 w-6 text-purple-400 group-hover:scale-110 group-hover:rotate-180 transition-all duration-500" />
                    <div className="absolute inset-0 bg-purple-400 rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-4xl font-black text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">
                    0
                  </div>
                  <p className="text-xs text-purple-300/80">Conseguidos</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-8 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-400" />
                    Progreso General
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-slate-300">Completado</span>
                      <span className="text-blue-400 font-semibold">{totalAchievements} logros</span>
                    </div>
                    <Progress
                      value={totalGamesTracked > 0 ? (totalAchievements / (totalGamesTracked * 50)) * 100 : 0}
                      className="h-3 bg-slate-800/50"
                    />
                  </div>
                  <div className="space-y-2 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      <span>{totalGamesTracked} juegos en seguimiento</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-green-400" />
                      <span>{totalAchievements} logros desbloqueados</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-400" />
                      <span>{averageCompletion} logros promedio por juego</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <GamepadIcon className="h-5 w-5 text-purple-400" />
                    Juegos Recientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {totalGamesTracked === 0 ? (
                    <div className="text-center py-8">
                      <GamepadIcon className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400">No hay juegos rastreados aún</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(userProgress)
                        .slice(0, 5)
                        .map(([gameId, count]) => (
                          <div
                            key={gameId}
                            className="flex justify-between items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                          >
                            <span className="text-slate-300 text-sm">Juego {gameId}</span>
                            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600">{count} logros</Badge>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements">
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  Estadísticas de Logros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Trophy className="h-20 w-20 text-slate-600 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-slate-300 mb-2">Busca y rastrea juegos</h3>
                  <p className="text-slate-400">para ver estadísticas detalladas de logros</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-400" />
                  Análisis de Rendimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-20 w-20 text-slate-600 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-slate-300 mb-2">Próximamente</h3>
                  <p className="text-slate-400">Gráficos interactivos y análisis avanzados</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enhanced Games Display */}
        {searchTerm.length >= 3 && (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-6"}>
            {sortedGames.map((game, index) => {
              if (viewMode === "list") {
                return (
                  <Card
                    key={game.id}
                    className="group bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-6">
                        {game.owned && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-gradient-to-r from-green-600/90 to-emerald-600/90 backdrop-blur-sm border border-white/20 text-white font-semibold text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              En tu biblioteca
                            </Badge>
                          </div>
                        )}
                        <div className="relative overflow-hidden rounded-xl">
                          <img
                            src={game.image || "/placeholder.svg"}
                            alt={game.name}
                            className="w-24 h-16 object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg?height=60&width=100"
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white truncate text-lg group-hover:text-blue-300 transition-colors duration-300">
                            {game.name}
                          </h3>
                          <p className="text-sm text-slate-400 truncate mt-1">{game.description}</p>
                          {game.price && (
                            <Badge className="mt-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                              {game.price}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          {userProgress[game.id] && (
                            <div className="text-right">
                              <div className="text-lg font-bold text-white">{userProgress[game.id]}</div>
                              <div className="text-xs text-slate-400">logros</div>
                            </div>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedGame(game)}
                                className="border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-white/20 max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="text-white text-xl">{game.name}</DialogTitle>
                                <DialogDescription className="text-slate-400">Vista previa del juego</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-6">
                                <div className="relative overflow-hidden rounded-xl">
                                  <img
                                    src={game.image || "/placeholder.svg"}
                                    alt={game.name}
                                    className="w-full h-48 object-cover"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                </div>
                                <p className="text-slate-300 leading-relaxed">{game.description}</p>
                                {game.price && (
                                  <div className="flex items-center gap-3">
                                    <span className="text-slate-400">Precio:</span>
                                    <Badge className="bg-gradient-to-r from-green-600 to-emerald-600">
                                      {game.price}
                                    </Badge>
                                  </div>
                                )}
                                <Link href={`/game/${game.id}`} className="block">
                                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25">
                                    <Trophy className="h-5 w-5 mr-2" />
                                    Ver Logros
                                  </Button>
                                </Link>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Link href={`/game/${game.id}`}>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
                            >
                              Ver Logros
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              }

              return (
                <Card
                  key={game.id}
                  className="group relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {game.owned && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-gradient-to-r from-green-600/90 to-emerald-600/90 backdrop-blur-sm border border-white/20 text-white font-semibold text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        En tu biblioteca
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="p-0">
                    <div className="relative overflow-hidden">
                      <img
                        src={game.image || "/placeholder.svg"}
                        alt={game.name}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=200&width=300"
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

                      {userProgress[game.id] && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-sm border border-white/20 text-white font-semibold">
                            {userProgress[game.id]} logros
                          </Badge>
                        </div>
                      )}

                      <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setSelectedGame(game)}
                              className="bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Vista previa
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-white/20 max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-white text-xl">{game.name}</DialogTitle>
                              <DialogDescription className="text-slate-400">Vista previa del juego</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div className="relative overflow-hidden rounded-xl">
                                <img
                                  src={game.image || "/placeholder.svg"}
                                  alt={game.name}
                                  className="w-full h-48 object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                              </div>
                              <p className="text-slate-300 leading-relaxed">{game.description}</p>
                              {game.price && (
                                <div className="flex items-center gap-3">
                                  <span className="text-slate-400">Precio:</span>
                                  <Badge className="bg-gradient-to-r from-green-600 to-emerald-600">{game.price}</Badge>
                                </div>
                              )}
                              <Link href={`/game/${game.id}`} className="block">
                                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25">
                                  <Trophy className="h-5 w-5 mr-2" />
                                  Ver Logros
                                </Button>
                              </Link>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle className="text-white mb-3 line-clamp-2 group-hover:text-blue-300 transition-colors duration-300 text-lg font-bold">
                      {game.name}
                    </CardTitle>
                    <CardDescription className="text-slate-400 mb-4 line-clamp-3 leading-relaxed">
                      {game.description}
                    </CardDescription>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        {game.price && (
                          <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-semibold">
                            {game.price}
                          </Badge>
                        )}
                        {userProgress[game.id] && (
                          <div className="text-sm text-slate-300 font-medium">
                            {userProgress[game.id]} logros completados
                          </div>
                        )}
                      </div>

                      <Link href={`/game/${game.id}`}>
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 text-white font-semibold py-3 rounded-xl">
                          <Trophy className="h-5 w-5 mr-2" />
                          Ver Logros
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Enhanced Empty States */}
        {searchTerm.length >= 3 && !isLoading && games.length === 0 && !error && (
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full blur-3xl"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-8 inline-block">
                <GamepadIcon className="h-24 w-24 text-slate-500 mx-auto" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">0</span>
                </div>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-300 mb-4">No se encontraron juegos</h3>
            <p className="text-slate-400 mb-8 text-lg">Intenta con otro término de búsqueda o verifica la ortografía</p>
            <Button
              variant="outline"
              onClick={() => setSearchTerm("")}
              className="border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 px-8 py-3 rounded-xl"
            >
              Limpiar búsqueda
            </Button>
          </div>
        )}

        {searchTerm.length < 3 && (
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-8 inline-block">
                <Search className="h-24 w-24 text-slate-500 mx-auto" />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-bounce">
                  <GamepadIcon className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-300 mb-4">Descubre juegos de Steam</h3>
            <p className="text-slate-400 mb-8 text-lg">
              Escribe el nombre de un juego para comenzar a rastrear tus logros
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {["Cyberpunk 2077", "The Witcher 3", "Counter-Strike 2", "Dota 2"].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchTerm(suggestion)}
                  className="text-slate-300 border-white/20 hover:bg-white/10 hover:border-white/30 text-white transition-all duration-300 hover:scale-105 px-6 py-2 rounded-full"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
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
