"use client"

import { Separator } from "@/components/ui/separator"

import { TabsContent } from "@/components/ui/tabs"

import { TabsTrigger } from "@/components/ui/tabs"

import { TabsList } from "@/components/ui/tabs"

import { Tabs } from "@/components/ui/tabs"

import { Badge } from "@/components/ui/badge"

import Link from "next/link"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Trophy,
  Star,
  Loader2,
  AlertCircle,
  Filter,
  Search,
  Calendar,
  Eye,
  EyeOff,
  Grid3X3,
  List,
  Download,
  Share2,
  Sparkles,
  Target,
  Award,
  Zap,
  Copy,
} from "lucide-react"

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  iconGray: string
  hidden: boolean
  percentage?: number
  rarity?: string
}

interface Game {
  id: string
  name: string
  description: string
  image: string
  screenshots: string[]
  developers: string[]
  publishers: string[]
  release_date: string
  genres: string[]
}

type ViewMode = "grid" | "list"
type FilterBy = "all" | "completed" | "pending" | "common" | "rare" | "epic" | "legendary" | "mythic"
type SortBy = "name" | "rarity" | "percentage" | "completion"

export default function GamePage() {
  const params = useParams()
  const gameId = params.id as string
  const { toast } = useToast()

  const [game, setGame] = useState<Game | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [completedAchievements, setCompletedAchievements] = useState<Set<string>>(new Set())
  const [isLoadingGame, setIsLoadingGame] = useState(true)
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false) // Estado para verificar si estamos en el cliente

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [filterBy, setFilterBy] = useState<FilterBy>("all")
  const [sortBy, setSortBy] = useState<SortBy>("name")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [showHidden, setShowHidden] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [badgeUrl, setBadgeUrl] = useState<string>("")

  useEffect(() => {
    setIsClient(true) // Marcar que estamos en el cliente una vez montado
  }, [])

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await fetch(`/api/steam/game/${gameId}`)
        const data = await response.json()

        if (data.error) {
          setError(data.error)
        } else {
          setGame(data.game)
        }
      } catch (error) {
        console.error("Error fetching game:", error)
        setError("Error al cargar el juego")
      } finally {
        setIsLoadingGame(false)
      }
    }

    fetchGame()
  }, [gameId])

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await fetch(`/api/steam/achievements/${gameId}`)
        const data = await response.json()

        if (data.error) {
          setError(data.error)
        } else {
          setAchievements(data.achievements || [])
        }
      } catch (error) {
        console.error("Error fetching achievements:", error)
        setError("Error al cargar los logros")
      } finally {
        setIsLoadingAchievements(false)
      }
    }

    fetchAchievements()
  }, [gameId])

  useEffect(() => {
    if (isClient) {
      // Solo acceder a localStorage en el cliente
      const savedProgress = localStorage.getItem(`achievements_${gameId}`)
      if (savedProgress) {
        setCompletedAchievements(new Set(JSON.parse(savedProgress)))
      }
    }
  }, [gameId, isClient])

  const toggleAchievement = (achievementId: string) => {
    if (!isClient) return // Asegurarse de que estamos en el cliente antes de usar localStorage

    const newCompleted = new Set(completedAchievements)
    if (newCompleted.has(achievementId)) {
      newCompleted.delete(achievementId)
    } else {
      newCompleted.add(achievementId)
    }

    setCompletedAchievements(newCompleted)
    localStorage.setItem(`achievements_${gameId}`, JSON.stringify([...newCompleted]))

    const generalProgress = JSON.parse(localStorage.getItem("steamAchievementProgress") || "{}")
    generalProgress[gameId] = newCompleted.size
    localStorage.setItem("steamAchievementProgress", JSON.stringify(generalProgress))
  }

  // Filtrar y ordenar logros
  const filteredAndSortedAchievements = achievements
    .filter((achievement) => {
      if (
        searchTerm &&
        !achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !achievement.description.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false
      }

      if (achievement.hidden && !showHidden) {
        return false
      }

      switch (filterBy) {
        case "completed":
          return completedAchievements.has(achievement.id)
        case "pending":
          return !completedAchievements.has(achievement.id)
        case "common":
        case "rare":
        case "epic":
        case "legendary":
        case "mythic":
          return achievement.rarity === filterBy
        default:
          return true
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "rarity":
          const rarityOrder = { mythic: 0, legendary: 1, epic: 2, rare: 3, uncommon: 4, common: 5 }
          return (
            (rarityOrder[a.rarity as keyof typeof rarityOrder] || 6) -
            (rarityOrder[b.rarity as keyof typeof rarityOrder] || 6)
          )
        case "percentage":
          return (a.percentage || 0) - (b.percentage || 0)
        case "completion":
          const aCompleted = completedAchievements.has(a.id) ? 1 : 0
          const bCompleted = completedAchievements.has(b.id) ? 1 : 0
          return bCompleted - aCompleted
        default:
          return 0
      }
    })

  if (isLoadingGame) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
            <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto mb-6 relative z-10" />
          </div>
          <p className="text-white text-xl">Cargando juego...</p>
        </div>
      </div>
    )
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
            <AlertCircle className="h-20 w-20 text-red-400 mx-auto relative z-10" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-6">{error || "Juego no encontrado"}</h1>
          <Link href="/">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 rounded-xl">
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const completionPercentage =
    achievements.length > 0 ? Math.round((completedAchievements.size / achievements.length) * 100) : 0
  const isPlatinum = completedAchievements.size === achievements.length && achievements.length > 0

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gradient-to-r from-gray-600 to-gray-700"
      case "uncommon":
        return "bg-gradient-to-r from-green-600 to-green-700"
      case "rare":
        return "bg-gradient-to-r from-blue-600 to-blue-700"
      case "epic":
        return "bg-gradient-to-r from-purple-600 to-purple-700"
      case "legendary":
        return "bg-gradient-to-r from-yellow-600 to-orange-600"
      case "mythic":
        return "bg-gradient-to-r from-red-600 to-pink-600"
      default:
        return "bg-gradient-to-r from-gray-600 to-gray-700"
    }
  }

  const exportProgress = () => {
    const data = {
      game: game.name,
      totalAchievements: achievements.length,
      completedAchievements: completedAchievements.size,
      completionPercentage,
      achievements: achievements.map((achievement) => ({
        name: achievement.name,
        description: achievement.description,
        completed: completedAchievements.has(achievement.id),
        rarity: achievement.rarity,
        percentage: achievement.percentage,
      })),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${game.name.replace(/[^a-z0-9]/gi, "_")}_achievements.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleSharePlatinum = () => {
    if (isPlatinum) {
      const currentOrigin = window.location.origin
      const badgeApiUrl = `${currentOrigin}/api/steam/badge/${gameId}`
      setBadgeUrl(badgeApiUrl)
      setShowShareDialog(true)
    } else {
      toast({
        title: "¡Aún no has conseguido el Platino!",
        description: "Completa todos los logros para compartir tu Platino.",
        variant: "destructive",
      })
    }
  }

  const copyBadgeUrl = async () => {
    try {
      await navigator.clipboard.writeText(badgeUrl)
      toast({
        title: "Enlace copiado",
        description: "El enlace del badge de Platino ha sido copiado al portapapeles.",
      })
    } catch (err) {
      console.error("Error al copiar el enlace:", err)
      toast({
        title: "Error al copiar",
        description: "No se pudo copiar el enlace. Inténtalo manualmente.",
        variant: "destructive",
      })
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Enhanced Header */}
          <div className="mb-12">
            <Link href="/">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10 mb-6 transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Volver
              </Button>
            </Link>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Game Image and Screenshots */}
              <div className="lg:w-1/3">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <img
                    src={game.image || "/placeholder.svg"}
                    alt={game.name}
                    className="relative w-full h-64 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=200&width=400"
                    }}
                  />
                </div>

                {game.screenshots.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {game.screenshots.slice(0, 4).map((screenshot, index) => (
                      <div key={index} className="relative group cursor-pointer">
                        <img
                          src={screenshot || "/placeholder.svg"}
                          alt={`Screenshot ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg group-hover:scale-110 transition-transform duration-300"
                          onClick={() => window.open(screenshot, "_blank")}
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Game Info */}
              <div className="lg:w-2/3">
                <div className="flex items-center gap-4 mb-6">
                  <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {game.name}
                  </h1>
                  {isPlatinum && (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-lg animate-pulse"></div>
                      <Badge className="relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-4 py-2 font-bold">
                        <Star className="h-6 w-6 mr-2 animate-spin" />
                        PLATINO CONSEGUIDO
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="space-y-8">
                  <p className="text-slate-300">{game.description}</p>

                  {/* Enhanced Game Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Target className="h-5 w-5 text-blue-400" />
                          Información del Juego
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-green-400" />
                          <span>
                            <strong>Desarrollador:</strong> {game.developers.join(", ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-400" />
                          <span>
                            <strong>Editor:</strong> {game.publishers.join(", ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-400" />
                          <span>
                            <strong>Fecha:</strong> {game.release_date}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-purple-400" />
                          Géneros
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {game.genres.map((genre) => (
                            <Badge
                              key={genre}
                              className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-300 hover:from-blue-600/30 hover:to-purple-600/30 transition-all duration-300"
                            >
                              {genre}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Enhanced Progress Section */}
                  {isLoadingAchievements ? (
                    <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                      <span className="text-slate-300 text-lg">Cargando logros...</span>
                    </div>
                  ) : achievements.length > 0 ? (
                    <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                            <Trophy className="h-7 w-7 text-yellow-400" />
                            Progreso de Logros
                          </CardTitle>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={exportProgress}
                              className="border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 bg-transparent"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Exportar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleSharePlatinum}
                              className="border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 bg-transparent"
                            >
                              <Share2 className="h-4 w-4 mr-2" />
                              Compartir
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          <div className="text-center p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-xl border border-green-500/20">
                            <div className="text-4xl font-black text-white mb-2">{completedAchievements.size}</div>
                            <div className="text-sm text-green-300 font-medium">Completados</div>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-xl border border-blue-500/20">
                            <div className="text-4xl font-black text-white mb-2">
                              {achievements.length - completedAchievements.size}
                            </div>
                            <div className="text-sm text-blue-300 font-medium">Pendientes</div>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/10 rounded-xl border border-purple-500/20">
                            <div className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                              {completionPercentage}%
                            </div>
                            <div className="text-sm text-purple-300 font-medium">Progreso</div>
                          </div>
                        </div>

                        <div className="relative">
                          <Progress value={completionPercentage} className="h-6 bg-slate-800/50" />
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-sm"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                      <CardContent className="p-8 text-center">
                        <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                        <p className="text-slate-400 text-lg">
                          Este juego no tiene logros disponibles o no son públicos
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Controls */}
          {achievements.length > 0 && (
            <div className="mb-12">
              <Tabs defaultValue="achievements" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2">
                  <TabsTrigger
                    value="achievements"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all duration-300 font-semibold"
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    Logros
                  </TabsTrigger>
                  <TabsTrigger
                    value="statistics"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all duration-300 font-semibold"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Estadísticas
                  </TabsTrigger>
                  <TabsTrigger
                    value="timeline"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-xl transition-all duration-300 font-semibold"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Cronología
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="achievements" className="space-y-8 mt-8">
                  {/* Enhanced Search and Filters */}
                  <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1">
                          <div className="relative group">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 z-10" />
                            <Input
                              placeholder="Buscar logros..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-12 bg-white/10 border-white/20 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:bg-white/15 rounded-xl py-3"
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Select value={filterBy} onValueChange={(value: FilterBy) => setFilterBy(value)}>
                            <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-colors rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900/95 text-white backdrop-blur-xl border-white/20">
                              <SelectItem value="all">Todos los logros</SelectItem>
                              <SelectItem value="completed">✅ Completados</SelectItem>
                              <SelectItem value="pending">⏳ Pendientes</SelectItem>
                              <Separator className="my-2" />
                              <SelectItem value="common">🔘 Comunes</SelectItem>
                              <SelectItem value="rare">🔵 Raros</SelectItem>
                              <SelectItem value="epic">🟣 Épicos</SelectItem>
                              <SelectItem value="legendary">🟡 Legendarios</SelectItem>
                              <SelectItem value="mythic">🔴 Míticos</SelectItem>
                            </SelectContent>
                          </Select>

                          <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
                            <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-colors rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900/95 text-white backdrop-blur-xl border-white/20">
                              <SelectItem value="name">📝 Nombre</SelectItem>
                              <SelectItem value="rarity">💎 Rareza</SelectItem>
                              <SelectItem value="percentage">📊 Porcentaje</SelectItem>
                              <SelectItem value="completion">✅ Completado</SelectItem>
                            </SelectContent>
                          </Select>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant={showHidden ? "default" : "outline"}
                                size="sm"
                                onClick={() => setShowHidden(!showHidden)}
                                className={`transition-all duration-300 rounded-xl ${
                                  showHidden
                                    ? "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                                    : "border-white/20 hover:bg-white/10"
                                }`}
                              >
                                {showHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{showHidden ? "Ocultar logros secretos" : "Mostrar logros secretos"}</p>
                            </TooltipContent>
                          </Tooltip>

                          <Button
                            variant={viewMode === "grid" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setViewMode("grid")}
                            className={`transition-all duration-300 rounded-xl ${
                              viewMode === "grid"
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                : "border-white/20 hover:bg-white/10"
                            }`}
                          >
                            <Grid3X3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={viewMode === "list" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setViewMode("list")}
                            className={`transition-all duration-300 rounded-xl ${
                              viewMode === "list"
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                : "border-white/20 hover:bg-white/10"
                            }`}
                          >
                            <List className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10 text-sm">
                        <span className="text-slate-400">
                          Mostrando{" "}
                          <span className="text-blue-400 font-semibold">{filteredAndSortedAchievements.length}</span> de{" "}
                          <span className="text-white font-semibold">{achievements.length}</span> logros
                        </span>
                        <span className="text-slate-400">
                          <span className="text-green-400 font-semibold">{completedAchievements.size}</span> completados
                          ({completionPercentage}%)
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Enhanced Achievements Display */}
                  <div
                    className={
                      viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"
                    }
                  >
                    {filteredAndSortedAchievements.map((achievement, index) => {
                      const isCompleted = completedAchievements.has(achievement.id)

                      if (viewMode === "list") {
                        return (
                          <Card
                            key={achievement.id}
                            className={`group bg-white/5 backdrop-blur-xl border transition-all duration-500 cursor-pointer hover:scale-[1.02] hover:shadow-2xl animate-fade-in ${
                              isCompleted
                                ? "border-green-500/40 hover:border-green-400/60 shadow-green-500/10"
                                : "border-white/10 hover:border-white/20 hover:shadow-blue-500/10"
                            }`}
                            style={{ animationDelay: `${index * 50}ms` }}
                            onClick={() => toggleAchievement(achievement.id)}
                          >
                            <CardContent className="p-6">
                              <div className="flex items-center gap-6">
                                <div className="flex-shrink-0">
                                  <Checkbox
                                    checked={isCompleted}
                                    onChange={() => toggleAchievement(achievement.id)}
                                    className="scale-125"
                                  />
                                </div>

                                <div className="relative">
                                  <img
                                    src={isCompleted ? achievement.icon : achievement.iconGray}
                                    alt={achievement.name}
                                    className="w-16 h-16 rounded-lg group-hover:scale-110 transition-transform duration-300"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      target.src = "/placeholder.svg?height=64&width=64"
                                    }}
                                  />
                                  {isCompleted && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                      <Trophy className="h-3 w-3 text-white" />
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3
                                      className={`font-bold text-lg ${isCompleted ? "text-white" : "text-slate-400"} group-hover:text-blue-300 transition-colors duration-300`}
                                    >
                                      {achievement.name}
                                    </h3>
                                    {achievement.rarity && (
                                      <Badge className={`text-xs font-semibold ${getRarityColor(achievement.rarity)}`}>
                                        {achievement.rarity}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className={`text-sm mb-3 ${isCompleted ? "text-slate-300" : "text-slate-500"}`}>
                                    {achievement.description}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    {achievement.percentage !== undefined && (
                                      <Badge variant="outline" className="text-xs border-white/20">
                                        {achievement.percentage.toFixed(1)}% jugadores
                                      </Badge>
                                    )}
                                    {isCompleted && (
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                        <span className="text-xs text-green-400 font-medium">Completado</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedAchievement(achievement)
                                      }}
                                      className="hover:bg-white/10 transition-all duration-300 rounded-xl"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-white/20 max-w-lg">
                                    <DialogHeader>
                                      <DialogTitle className="text-white flex items-center gap-3 text-xl">
                                        <img
                                          src={isCompleted ? achievement.icon : achievement.iconGray}
                                          alt={achievement.name}
                                          className="w-10 h-10 rounded-lg"
                                        />
                                        {achievement.name}
                                      </DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-6">
                                      <p className="text-slate-300 text-lg leading-relaxed">
                                        {achievement.description}
                                      </p>
                                      <div className="flex flex-wrap gap-3">
                                        {achievement.rarity && (
                                          <Badge className={`${getRarityColor(achievement.rarity)} font-semibold`}>
                                            💎 {achievement.rarity}
                                          </Badge>
                                        )}
                                        {achievement.percentage !== undefined && (
                                          <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600">
                                            📊 {achievement.percentage.toFixed(1)}% de jugadores
                                          </Badge>
                                        )}
                                        {isCompleted && (
                                          <Badge className="bg-gradient-to-r from-green-600 to-emerald-600">
                                            <Trophy className="h-4 w-4 mr-1" />
                                            Completado
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      }

                      return (
                        <Card
                          key={achievement.id}
                          className={`group relative overflow-hidden backdrop-blur-xl border transition-all duration-500 cursor-pointer hover:scale-105 hover:shadow-2xl animate-fade-in ${
                            isCompleted
                              ? "bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/30 hover:border-green-400/50 shadow-green-500/20"
                              : "bg-white/5 border-white/10 hover:border-white/20 hover:shadow-blue-500/20"
                          }`}
                          style={{ animationDelay: `${index * 100}ms` }}
                          onClick={() => toggleAchievement(achievement.id)}
                        >
                          {/* Glow Effect */}
                          <div
                            className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                              isCompleted
                                ? "bg-gradient-to-br from-green-500/5 to-emerald-500/5"
                                : "bg-gradient-to-br from-blue-500/5 to-purple-500/5"
                            }`}
                          ></div>

                          <CardContent className="p-6 relative z-10">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0">
                                <Checkbox
                                  checked={isCompleted}
                                  onChange={() => toggleAchievement(achievement.id)}
                                  className="mt-2 scale-125"
                                />
                              </div>

                              <div className="relative">
                                <img
                                  src={isCompleted ? achievement.icon : achievement.iconGray}
                                  alt={achievement.name}
                                  className="w-20 h-20 rounded-xl group-hover:scale-110 transition-transform duration-500"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.src = "/placeholder.svg?height=80&width=80"
                                  }}
                                />
                                {isCompleted && (
                                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                                    <Trophy className="h-4 w-4 text-white" />
                                  </div>
                                )}
                                <div
                                  className={`absolute inset-0 rounded-xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300 ${
                                    isCompleted ? "bg-green-400" : "bg-blue-400"
                                  }`}
                                ></div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                  <h3
                                    className={`font-bold text-lg ${
                                      isCompleted ? "text-white" : "text-slate-400"
                                    } group-hover:text-blue-300 transition-colors duration-300`}
                                  >
                                    {achievement.name}
                                  </h3>
                                  {achievement.rarity && (
                                    <Badge
                                      className={`text-xs font-semibold ${getRarityColor(achievement.rarity)} shadow-lg`}
                                    >
                                      {achievement.rarity}
                                    </Badge>
                                  )}
                                </div>
                                <p
                                  className={`text-sm mb-4 leading-relaxed ${isCompleted ? "text-slate-300" : "text-slate-500"}`}
                                >
                                  {achievement.description}
                                </p>

                                <div className="flex items-center justify-between">
                                  {achievement.percentage !== undefined && (
                                    <Badge className="bg-gradient-to-r from-slate-600 to-slate-700 border border-white/20 text-xs">
                                      📊 {achievement.percentage.toFixed(1)}%
                                    </Badge>
                                  )}
                                  {isCompleted && (
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                      <span className="text-xs text-green-400 font-semibold">Completado</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="statistics" className="mt-8">
                  <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-3 text-2xl">
                        <Target className="h-6 w-6 text-blue-400" />
                        Estadísticas Detalladas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {["common", "rare", "epic", "legendary"].map((rarity) => {
                          const rarityAchievements = achievements.filter((a) => a.rarity === rarity)
                          const completedRarity = rarityAchievements.filter((a) =>
                            completedAchievements.has(a.id),
                          ).length

                          return (
                            <div
                              key={rarity}
                              className="text-center p-6 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
                            >
                              <div className="text-3xl font-black text-white mb-2">
                                {completedRarity}/{rarityAchievements.length}
                              </div>
                              <div className="text-sm text-slate-400 capitalize font-semibold mb-3">{rarity}</div>
                              <Progress
                                value={
                                  rarityAchievements.length > 0
                                    ? (completedRarity / rarityAchievements.length) * 100
                                    : 0
                                }
                                className="h-3"
                              />
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="timeline" className="mt-8">
                  <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-3 text-2xl">
                        <Calendar className="h-6 w-6 text-purple-400" />
                        Cronología de Logros
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-16">
                        <div className="relative mb-8">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl animate-pulse"></div>
                          <Calendar className="h-20 w-20 text-slate-600 mx-auto relative z-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-300 mb-4">Próximamente</h3>
                        <p className="text-slate-400 text-lg">
                          Cronología detallada de logros conseguidos con fechas y estadísticas
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Enhanced Empty States */}
          {achievements.length > 0 && filteredAndSortedAchievements.length === 0 && (
            <div className="text-center py-16">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full blur-xl"></div>
                <Filter className="h-20 w-20 text-slate-600 mx-auto relative z-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-300 mb-4">No se encontraron logros</h3>
              <p className="text-slate-400 mb-8 text-lg">Intenta ajustar los filtros o la búsqueda</p>
              <Button
                variant="outline"
                onClick={() => {
                  setFilterBy("all")
                  setSearchTerm("")
                  setShowHidden(true)
                }}
                className="border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300 px-8 py-3 rounded-xl"
              >
                Limpiar filtros
              </Button>
            </div>
          )}

          {/* Enhanced Platinum Achievement Notification */}
          {isPlatinum && (
            <div className="fixed bottom-6 right-6 z-50 animate-bounce">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl animate-pulse"></div>
                <Card className="relative bg-gradient-to-r from-purple-900/90 to-pink-900/90 backdrop-blur-xl border-purple-500/50 shadow-2xl">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Star className="h-12 w-12 text-yellow-400 animate-spin" />
                        <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md opacity-30 animate-pulse"></div>
                      </div>
                      <div>
                        <p className="font-black text-white text-2xl mb-1">¡Platino conseguido! 🎉</p>
                        <p className="text-sm text-purple-200">Has completado todos los logros de {game.name}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Share Platinum Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="bg-slate-900/95 backdrop-blur-xl border-white/20 max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-white text-2xl flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-400" />
                ¡Comparte tu Platino!
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Copia el enlace de tu badge de Platino para compartirlo donde quieras.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {badgeUrl ? (
                <>
                  <div className="flex justify-center">
                    <img
                      src={badgeUrl || "/placeholder.svg"}
                      alt="Platinum Achievement Badge"
                      className="max-w-full h-auto rounded-lg border border-white/20 shadow-lg"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input value={badgeUrl} readOnly className="flex-1 bg-white/10 border-white/20 text-white" />
                    <Button
                      onClick={copyBadgeUrl}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center text-slate-400">Generando badge...</div>
              )}
            </div>
          </DialogContent>
        </Dialog>

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
    </TooltipProvider>
  )
}
