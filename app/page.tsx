"use client"

import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { useDebounce } from "@/hooks/use-debounce"
import { Progress } from "@/components/ui/progress"
import { LogOut, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Game {
  appid: number
  name: string
  playtime_forever: number
  img_icon_url: string
  img_logo_url: string
  has_community_visible_stats: boolean
  completionPercentage?: number
}

interface UserProfile {
  steamid: string
  personaname: string
  profileurl: string
  avatarfull: string
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const [searchResults, setSearchResults] = useState<Game[]>([])
  const [ownedGames, setOwnedGames] = useState<Game[]>([])
  const [loadingOwnedGames, setLoadingOwnedGames] = useState(true)
  const [loadingSearchResults, setLoadingSearchResults] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          setUserProfile(data.user)
        } else {
          // Not logged in, redirect to login
          router.push("/login")
        }
      } catch (err) {
        console.error("Error fetching user profile:", err)
        router.push("/login")
      }
    }
    fetchUserProfile()
  }, [router])

  useEffect(() => {
    if (!userProfile) return

    const fetchOwnedGames = async () => {
      setLoadingOwnedGames(true)
      setError(null)
      try {
        const res = await fetch("/api/steam/owned-games")
        if (!res.ok) {
          throw new Error(`Error fetching owned games: ${res.statusText}`)
        }
        const data = await res.json()
        setOwnedGames(data.games)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoadingOwnedGames(false)
      }
    }

    fetchOwnedGames()
  }, [userProfile])

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (debouncedSearchQuery.length < 3) {
        setSearchResults([])
        return
      }

      setLoadingSearchResults(true)
      setError(null)
      try {
        const res = await fetch(`/api/steam/search?q=${encodeURIComponent(debouncedSearchQuery)}`)
        if (!res.ok) {
          throw new Error(`Error searching games: ${res.statusText}`)
        }
        const data = await res.json()
        setSearchResults(data.games)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoadingSearchResults(false)
      }
    }

    fetchSearchResults()
  }, [debouncedSearchQuery])

  const gamesToDisplay = useMemo(() => {
    if (debouncedSearchQuery.length >= 3) {
      return searchResults
    }
    return ownedGames
  }, [debouncedSearchQuery, searchResults, ownedGames])

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" })
      if (res.ok) {
        toast.success("Sesión cerrada correctamente.")
        router.push("/login")
      } else {
        toast.error("Error al cerrar sesión.")
      }
    } catch (error) {
      console.error("Error during logout:", error)
      toast.error("Error al cerrar sesión.")
    }
  }

  return (
    <div className="container mx-auto p-4">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold">Steam Achievement Tracker</h1>
        <div className="flex items-center space-x-4">
          {userProfile && (
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarImage src={userProfile.avatarfull || "/placeholder.svg"} alt={userProfile.personaname} />
                <AvatarFallback>{userProfile.personaname.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <span className="font-medium hidden sm:inline">{userProfile.personaname}</span>
            </div>
          )}
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <div className="relative mb-6">
        <Input
          type="text"
          placeholder="Buscar juegos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2 rounded-lg w-full"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {loadingOwnedGames && debouncedSearchQuery.length < 3 && <p className="text-center">Cargando tus juegos...</p>}
      {loadingSearchResults && debouncedSearchQuery.length >= 3 && <p className="text-center">Buscando juegos...</p>}

      {!loadingOwnedGames && !loadingSearchResults && gamesToDisplay.length === 0 && (
        <p className="text-center text-gray-500">
          {debouncedSearchQuery.length >= 3
            ? "No se encontraron resultados para tu búsqueda."
            : "No se encontraron juegos en tu biblioteca."}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {gamesToDisplay.map((game) => (
          <Link key={game.appid} href={`/game/${game.appid}`}>
            <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="p-0">
                <Image
                  src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`}
                  alt={game.name}
                  width={460}
                  height={215}
                  className="rounded-t-lg object-cover w-full h-auto"
                />
              </CardHeader>
              <CardContent className="p-4 flex-grow flex flex-col justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold mb-2 line-clamp-2">{game.name}</CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Tiempo de juego: {(game.playtime_forever / 60).toFixed(0)} horas
                  </p>
                </div>
                {game.completionPercentage !== undefined && (
                  <div className="mt-auto">
                    <Progress value={game.completionPercentage} className="w-full" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {game.completionPercentage.toFixed(2)}% completado
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
