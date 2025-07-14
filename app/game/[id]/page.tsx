"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Check, Copy, Share2 } from "lucide-react"
import { toast } from "sonner"
import { Label } from "@/components/ui/label" // Import Label component

interface Achievement {
  apiname: string
  achieved: 0 | 1
  unlocktime: number
  name: string
  description: string
  icon: string
  icongray: string
  hidden: 0 | 1
  percent: number // Global achievement percentage
}

interface GameData {
  game: {
    gameName: string
    gameLogoUrl: string
    achievements: Achievement[]
  }
}

export default function GameDetailsPage() {
  const { id } = useParams()
  const gameId = Array.isArray(id) ? id[0] : id
  const [gameData, setGameData] = useState<GameData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [badgeUrl, setBadgeUrl] = useState<string | null>(null)
  const [isBadgeLoading, setIsBadgeLoading] = useState(false)

  useEffect(() => {
    if (!gameId) return

    const fetchGameDetails = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/steam/achievements/${gameId}`)
        if (!res.ok) {
          throw new Error(`Error fetching game details: ${res.statusText}`)
        }
        const data: GameData = await res.json()
        setGameData(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchGameDetails()
  }, [gameId])

  const totalAchievements = gameData?.game?.achievements?.length || 0
  const achievedAchievements = useMemo(() => {
    return gameData?.game?.achievements?.filter((ach) => ach.achieved === 1).length || 0
  }, [gameData])

  const completionPercentage = totalAchievements > 0 ? (achievedAchievements / totalAchievements) * 100 : 0

  const isPlatinum = completionPercentage === 100

  const handleShareBadge = async () => {
    if (!gameData?.game?.gameName || !gameData?.game?.gameLogoUrl) {
      toast.error("No se pudo generar la insignia: faltan datos del juego.")
      return
    }

    setIsBadgeLoading(true)
    try {
      const url = new URL(window.location.origin)
      url.pathname = `/api/steam/badge/${gameId}`
      url.searchParams.append("gameName", gameData.game.gameName)
      url.searchParams.append("gameLogoUrl", gameData.game.gameLogoUrl)

      setBadgeUrl(url.toString())
      setIsShareDialogOpen(true)
    } catch (error) {
      console.error("Error generating badge URL:", error)
      toast.error("Error al generar la URL de la insignia.")
    } finally {
      setIsBadgeLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (badgeUrl) {
      navigator.clipboard
        .writeText(badgeUrl)
        .then(() => {
          setIsCopying(true)
          toast.success("URL de la insignia copiada al portapapeles.")
          setTimeout(() => setIsCopying(false), 2000) // Reset icon after 2 seconds
        })
        .catch((err) => {
          console.error("Failed to copy:", err)
          toast.error("Error al copiar la URL.")
        })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando detalles del juego...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <p>Error: {error}</p>
      </div>
    )
  }

  if (!gameData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>No se encontraron datos para este juego.</p>
      </div>
    )
  }

  const { gameName, gameLogoUrl, achievements } = gameData.game

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-4">
            {gameLogoUrl && (
              <Image
                src={gameLogoUrl || "/placeholder.svg"}
                alt={`${gameName} logo`}
                width={80}
                height={80}
                className="rounded-lg"
              />
            )}
            <div>
              <CardTitle className="text-3xl font-bold">{gameName}</CardTitle>
              <p className="text-gray-500 dark:text-gray-400">
                {achievedAchievements} / {totalAchievements} logros desbloqueados
              </p>
              <Progress value={completionPercentage} className="w-full mt-2" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isPlatinum && (
            <div className="mt-4 flex flex-col items-center justify-center gap-4">
              <p className="text-xl font-semibold text-yellow-500">
                ¡Felicidades! Has conseguido el Platino en {gameName}.
              </p>
              <Button onClick={handleShareBadge} disabled={isBadgeLoading}>
                {isBadgeLoading ? "Generando insignia..." : "Compartir Insignia de Platino"}
                <Share2 className="ml-2 h-4 w-4" />
              </Button>

              <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Compartir Insignia de Platino</DialogTitle>
                    <DialogDescription>Copia la URL de tu insignia de platino para compartirla.</DialogDescription>
                  </DialogHeader>
                  {badgeUrl ? (
                    <div className="flex items-center space-x-2">
                      <div className="grid flex-1 gap-2">
                        <Label htmlFor="badge-url" className="sr-only">
                          URL de la insignia
                        </Label>
                        <Input id="badge-url" defaultValue={badgeUrl} readOnly />
                      </div>
                      <Button type="submit" size="sm" className="px-3" onClick={copyToClipboard}>
                        <span className="sr-only">Copiar</span>
                        {isCopying ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">Cargando URL de la insignia...</div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          )}

          <h2 className="text-2xl font-bold mt-8 mb-4">Logros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements
              .sort((a, b) => b.achieved - a.achieved) // Sort achieved first
              .map((ach) => (
                <Card key={ach.apiname} className={ach.achieved === 1 ? "border-green-500" : ""}>
                  <CardContent className="flex items-center gap-4 p-4">
                    <Image
                      src={ach.achieved === 1 ? ach.icon : ach.icongray}
                      alt={ach.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold">{ach.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{ach.description}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {ach.achieved === 1 ? "Desbloqueado" : "Bloqueado"}
                        {ach.percent !== undefined && ` (${ach.percent.toFixed(2)}% global)`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
