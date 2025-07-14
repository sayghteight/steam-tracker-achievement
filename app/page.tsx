"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Search, Gamepad2, LogOut, AlertCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Game {
  appid: number
  name: string
  playtime_forever: number
  img_icon_url: string
  img_logo_url: string
  has_community_visible_stats: boolean
}

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Game[]>([])
  const [isLoadingSearch, setIsLoadingSearch] = useState(false)
  const [ownedGames, setOwnedGames] = useState<Game[]>([])
  const [isLoadingOwnedGames, setIsLoadingOwnedGames] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const router = useRouter()

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("/api/auth/me")
        const data = await response.json()
        if (data.user) {
          setUserProfile(data.user)
          localStorage.setItem("steamId", data.user.steamid) // Guardar steamId en localStorage
        } else {
          router.push("/login")
        }
      } catch (err) {
        console.error("Error fetching user profile:", err)
        router.push("/login")
      } finally {
        setIsLoadingProfile(false)
      }
    }
    fetchUserProfile()
  }, [router])

  useEffect(() => {
    const fetchOwnedGames = async () => {
      if (!userProfile?.steamid) return

      setIsLoadingOwnedGames(true)
      try {
        const response = await fetch(`/api/steam/owned-games?steamId=${userProfile.steamid}`)
        const data = await response.json()
        if (data.games) {
          setOwnedGames(data.games)
        } else {
          setError(data.error || "No se pudieron cargar los juegos poseídos.")
        }
      } catch (err) {
        console.error("Error fetching owned games:", err)
        setError("Error al cargar los juegos poseídos.")
      } finally {
        setIsLoadingOwnedGames(false)
      }
    }

    if (userProfile) {
      fetchOwnedGames()
    }
  }, [userProfile])

  useEffect(() => {
    const searchGames = async () => {
      if (!debouncedSearchTerm) {
        setSearchResults([])
        setIsLoadingSearch(false)
        return
      }

      setIsLoadingSearch(true)
      try {
        const response = await fetch(`/api/steam/search?query=${debouncedSearchTerm}`)
        const data = await response.json()
        if (data.games) {
          setSearchResults(data.games)
        } else {
          setError(data.error || "Error al buscar juegos.")
        }
      } catch (err) {
        console.error("Error searching games:", err)
        setError("Error al buscar juegos.")
      } finally {
        setIsLoadingSearch(false)
      }
    }

    searchGames()
  }, [debouncedSearchTerm])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      localStorage.removeItem("steamId") // Limpiar steamId de localStorage
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto mb-6" />
          <p className="text-white text-xl">Cargando perfil de usuario...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-20 w-20 text-red-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-6">{error}</h1>
          <Button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 rounded-xl"
          >
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  const gamesToDisplay = searchTerm ? searchResults : ownedGames

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 text-white p-8">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Steam Tracker
        </h1>
        <div className="flex items-center gap-4">
          {userProfile && (
            <div className="flex items-center gap-2">
              <Image
                src={userProfile.avatarfull || "/placeholder-user.jpg"}
                alt="User Avatar"
                width={40}
                height={40}
                className="rounded-full border-2 border-blue-400"
              />
              <span className="text-lg font-semibold hidden md:block">{userProfile.personaname}</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-white hover:bg-white/10 transition-all duration-300"
            title="Cerrar sesión"
          >
            <LogOut className="h-6 w-6" />
          </Button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto mb-12 relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-6 w-6" />
        <Input
          type="text"
          placeholder="Buscar juegos por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-full bg-white/10 border-white/20 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:bg-white/15"
        />
        {isLoadingSearch && (
          <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-blue-400 animate-spin" />
        )}
      </div>

      <section>
        <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
          {searchTerm ? "Resultados de la búsqueda" : "Tus Juegos"}
        </h2>

        {isLoadingOwnedGames && !searchTerm ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="bg-white/5 backdrop-blur-xl border border-white/10 animate-pulse">
                <CardHeader>
                  <div className="w-full h-32 bg-slate-700 rounded-md"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-6 bg-slate-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : gamesToDisplay.length === 0 ? (
          <div className="text-center py-16">
            <Gamepad2 className="h-20 w-20 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-xl">
              {searchTerm
                ? "No se encontraron juegos con ese nombre."
                : "No se encontraron juegos en tu biblioteca de Steam."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {gamesToDisplay.map((game) => (
              <Link href={`/game/${game.appid}`} key={game.appid}>
                <Card className="group bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:border-blue-500/50">
                  <CardHeader className="p-0">
                    <div className="relative w-full h-40">
                      <Image
                        src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`}
                        alt={game.name}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=160&width=300" // Fallback a placeholder
                        }}
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/0 transition-colors duration-300"></div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-xl font-bold text-white mb-2 truncate">{game.name}</CardTitle>
                    <p className="text-slate-400 text-sm">
                      Tiempo de juego: {(game.playtime_forever / 60).toFixed(0)} horas
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
