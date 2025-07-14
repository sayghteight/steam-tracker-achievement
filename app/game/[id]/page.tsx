"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
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
import { GamepadIcon, TrophyIcon, BarChartIcon, Share2Icon, CopyIcon, Loader2Icon } from "lucide-react"

interface Achievement {
  apiname: string
  achieved: number
  unlocktime: number
  name: string
  description: string
  icon: string
  icongray: string
}

interface Game {
  appid: number
  name: string
  img_icon_url: string
  img_logo_url: string
  playtime_forever: number
  achievements: Achievement[]
}

interface PlayerAchievement {
  apiname: string
  achieved: number
  unlocktime: number
}

export default function GamePage() {
  const params = useParams()
  const gameId = params.id as string
  const { toast } = useToast()

  const [game, setGame] = useState<Game | null>(null)
  const [playerAchievements, setPlayerAchievements] = useState<PlayerAchievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState("all")
  const [sort, setSort] = useState("default")
  const [isClient, setIsClient] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [badgeUrl, setBadgeUrl] = useState("")

  useEffect(() => {
    setIsClient(true)
  }, [])

  const fetchGameData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const gameRes = await fetch(`/api/steam/game/${gameId}`)
      if (!gameRes.ok) throw new Error("Failed to fetch game data")
      const gameData = await gameRes.json()
      setGame(gameData.game)

      const playerAchievementsRes = await fetch(`/api/steam/player-achievements?appId=${gameId}`)
      if (!playerAchievementsRes.ok) throw new Error("Failed to fetch player achievements")
      const playerAchievementsData = await playerAchievementsRes.json()
      setPlayerAchievements(playerAchievementsData.playerAchievements)
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [gameId, toast])

  useEffect(() => {
    if (isClient) {
      fetchGameData()
    }
  }, [isClient, fetchGameData])

  const handleAchievementToggle = async (apiname: string, achieved: number) => {
    const newAchievedStatus = achieved === 1 ? 0 : 1
    const newUnlockTime = newAchievedStatus === 1 ? Math.floor(Date.now() / 1000) : 0

    setPlayerAchievements((prev) =>
      prev.map((ach) =>
        ach.apiname === apiname ? { ...ach, achieved: newAchievedStatus, unlocktime: newUnlockTime } : ach,
      ),
    )

    // Optimistically update the UI, then send to API
    try {
      const res = await fetch("/api/steam/achievements/[id]", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appId: gameId,
          achievementName: apiname,
          achieved: newAchievedStatus,
          unlocktime: newUnlockTime,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to update achievement status")
      }
      toast({
        title: "Éxito",
        description: `Logro ${newAchievedStatus === 1 ? "desbloqueado" : "bloqueado"}`,
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: `No se pudo actualizar el logro: ${err.message}`,
        variant: "destructive",
      })
      // Revert UI on error
      setPlayerAchievements((prev) =>
        prev.map((ach) =>
          ach.apiname === apiname
            ? { ...ach, achieved: achieved, unlocktime: ach.unlocktime } // Revert to original
            : ach,
        ),
      )
    }
  }

  const getAchievementStatus = (apiname: string) => {
    return playerAchievements.find((pa) => pa.apiname === apiname)?.achieved === 1
  }

  const getAchievementUnlockTime = (apiname: string) => {
    const unlocktime = playerAchievements.find((pa) => pa.apiname === apiname)?.unlocktime
    if (unlocktime && unlocktime > 0) {
      return new Date(unlocktime * 1000).toLocaleDateString()
    }
    return "N/A"
  }

  const totalAchievements = game?.achievements?.length || 0
  const unlockedAchievements = game?.achievements?.filter((ach) => getAchievementStatus(ach.apiname)).length || 0
  const progress = totalAchievements > 0 ? (unlockedAchievements / totalAchievements) * 100 : 0

  const isPlatinum = totalAchievements > 0 && unlockedAchievements === totalAchievements

  const filteredAchievements = game?.achievements
    ?.filter((ach) => {
      if (filter === "unlocked") return getAchievementStatus(ach.apiname)
      if (filter === "locked") return !getAchievementStatus(ach.apiname)
      return true
    })
    .sort((a, b) => {
      if (sort === "name-asc") return a.name.localeCompare(b.name)
      if (sort === "name-desc") return b.name.localeCompare(a.name)
      if (sort === "unlocked-first") {
        const aUnlocked = getAchievementStatus(a.apiname)
        const bUnlocked = getAchievementStatus(b.apiname)
        if (aUnlocked && !bUnlocked) return -1
        if (!aUnlocked && bUnlocked) return 1
        return 0
      }
      if (sort === "locked-first") {
        const aUnlocked = getAchievementStatus(a.apiname)
        const bUnlocked = getAchievementStatus(b.apiname)
        if (aUnlocked && !bUnlocked) return 1
        if (!aUnlocked && bUnlocked) return -1
        return 0
      }
      return 0
    })

  const handleSharePlatinum = () => {
    if (isPlatinum) {
      const url = `${window.location.origin}/api/steam/badge/${gameId}`
      setBadgeUrl(url)
      setShowShareDialog(true)
    } else {
      toast({
        title: "No platinado",
        description: "Necesitas desbloquear todos los logros para compartir el badge de platino.",
        variant: "default",
      })
    }
  }

  const copyBadgeUrl = async () => {
    try {
      await navigator.clipboard.writeText(badgeUrl)
      toast({
        title: "Enlace copiado",
        description: "El enlace del badge ha sido copiado al portapapeles.",
      })
    } catch (err) {
      toast({
        title: "Error al copiar",
        description: "No se pudo copiar el enlace. Por favor, inténtalo manualmente.",
        variant: "destructive",
      })
    }
  }

  if (!isClient || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4">
        <Loader2Icon className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-gray-500">Cargando datos del juego...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4 text-red-500">
        <p className="text-xl font-bold">Error al cargar el juego</p>
        <p className="mt-2 text-center">{error}</p>
        <Button onClick={fetchGameData} className="mt-4">
          Reintentar
        </Button>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4 text-gray-500">
        <p className="text-xl font-bold">Juego no encontrado</p>
        <p className="mt-2 text-center">Asegúrate de que el ID del juego sea correcto.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden mb-8">
        <Image
          src={`https://steamcdn-a.akamaihd.net/steam/apps/${game.appid}/header.jpg`}
          alt={`${game.name} header`}
          layout="fill"
          objectFit="cover"
          className="brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent flex items-end p-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-lg">{game.name}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-700/20 backdrop-blur-sm text-white border-blue-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-200">Tiempo de Juego</CardTitle>
            <GamepadIcon className="h-4 w-4 text-blue-300" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(game.playtime_forever / 60).toFixed(1)}h</div>
            <p className="text-xs text-blue-300">Total</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-700/20 backdrop-blur-sm text-white border-yellow-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-200">Logros Desbloqueados</CardTitle>
            <TrophyIcon className="h-4 w-4 text-yellow-300" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {unlockedAchievements} / {totalAchievements}
            </div>
            <p className="text-xs text-yellow-300">Logros</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-green-700/20 backdrop-blur-sm text-white border-green-500/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Progreso</CardTitle>
            <BarChartIcon className="h-4 w-4 text-green-300" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{progress.toFixed(2)}%</div>
            <Progress value={progress} className="mt-2 h-2" />
            <p className="text-xs text-green-300">Completado</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8 bg-card/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Logros</CardTitle>
          <div className="flex items-center space-x-2">
            {isPlatinum && (
              <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={handleSharePlatinum}>
                    <Share2Icon className="mr-2 h-4 w-4" />
                    Compartir Platino
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>¡Platino Conseguido!</DialogTitle>
                    <DialogDescription>Comparte tu logro de platino con este badge.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {badgeUrl && (
                      <div className="flex justify-center">
                        <Image
                          src={badgeUrl || "/placeholder.svg"}
                          alt="Platinum Badge"
                          width={400}
                          height={200}
                          className="rounded-lg shadow-lg"
                        />
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Input id="badge-url" value={badgeUrl} readOnly className="flex-1" />
                      <Button type="button" size="sm" onClick={copyBadgeUrl}>
                        <CopyIcon className="h-4 w-4" />
                        <span className="sr-only">Copiar</span>
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <Select onValueChange={setFilter} defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="unlocked">Desbloqueados</SelectItem>
                <SelectItem value="locked">Bloqueados</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={setSort} defaultValue="default">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Por defecto</SelectItem>
                <SelectItem value="name-asc">Nombre (A-Z)</SelectItem>
                <SelectItem value="name-desc">Nombre (Z-A)</SelectItem>
                <SelectItem value="unlocked-first">Desbloqueados primero</SelectItem>
                <SelectItem value="locked-first">Bloqueados primero</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements?.map((achievement) => (
              <Card
                key={achievement.apiname}
                className={`flex items-center p-4 space-x-4 ${
                  getAchievementStatus(achievement.apiname)
                    ? "bg-green-500/10 border-green-500/20"
                    : "bg-gray-700/10 border-gray-500/20"
                }`}
              >
                <Checkbox
                  id={achievement.apiname}
                  checked={getAchievementStatus(achievement.apiname)}
                  onCheckedChange={() =>
                    handleAchievementToggle(achievement.apiname, getAchievementStatus(achievement.apiname) ? 1 : 0)
                  }
                  className="h-6 w-6"
                />
                <Image
                  src={getAchievementStatus(achievement.apiname) ? achievement.icon : achievement.icongray}
                  alt={achievement.name}
                  width={48}
                  height={48}
                  className="rounded-md"
                />
                <div className="flex-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <h3 className="font-semibold text-lg truncate">{achievement.name}</h3>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{achievement.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {achievement.description || "No description available."}
                  </p>
                  {getAchievementStatus(achievement.apiname) && (
                    <p className="text-xs text-gray-500 mt-1">
                      Desbloqueado: {getAchievementUnlockTime(achievement.apiname)}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
          {filteredAchievements?.length === 0 && (
            <p className="text-center text-gray-500 mt-8">No hay logros que coincidan con los filtros.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
