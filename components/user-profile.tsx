"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserIcon as SteamUser, LogOut, Settings, Trophy, GamepadIcon, Star, Shield, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface UserProfileProps {
  steamId: string
  displayName: string
  avatar: string
  profileUrl: string
  gameCount: number
  level: number
  achievementCount: number
}

export function UserProfile() {
  const [user, setUser] = useState<UserProfileProps | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        }
      } catch (error) {
        console.error("Error checking auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      router.refresh()
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-slate-700 rounded-full animate-pulse"></div>
        <div className="w-20 h-4 bg-slate-700 rounded animate-pulse"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <Link href="/login">
        <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 transition-all duration-300 hover:scale-105">
          <Shield className="h-4 w-4 mr-2" />
          Conectar Steam
        </Button>
      </Link>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-3 hover:bg-white/10 transition-all duration-300 px-4 py-2 rounded-xl"
        >
          <div className="relative">
            <img
              src={user.avatar || "/placeholder.svg"}
              alt="Avatar"
              className="w-8 h-8 rounded-full border-2 border-green-500"
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-white font-medium text-sm">{user.displayName}</div>
            <div className="text-slate-400 text-xs">Nivel {user.level}</div>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 bg-slate-900/95 backdrop-blur-xl border-white/20 rounded-xl p-2">
        {/* User Info Header */}
        <div className="px-3 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={user.avatar || "/placeholder.svg"}
                alt="Avatar"
                className="w-12 h-12 rounded-full border-2 border-green-500"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold">{user.displayName}</div>
              <div className="text-slate-400 text-sm">Steam ID: {user.steamId}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Verificado
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="px-3 py-3 border-b border-white/10">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <GamepadIcon className="h-4 w-4 text-blue-400 mx-auto mb-1" />
              <div className="text-white text-sm font-semibold">{user.gameCount}</div>
              <div className="text-slate-400 text-xs">Juegos</div>
            </div>
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Trophy className="h-4 w-4 text-yellow-400 mx-auto mb-1" />
              <div className="text-white text-sm font-semibold">{user.achievementCount}</div>
              <div className="text-slate-400 text-xs">Logros</div>
            </div>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Star className="h-4 w-4 text-purple-400 mx-auto mb-1" />
              <div className="text-white text-sm font-semibold">{user.level}</div>
              <div className="text-slate-400 text-xs">Nivel</div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-white hover:bg-white/10 rounded-lg cursor-pointer">
            <SteamUser className="h-4 w-4" />
            Ver Perfil Steam
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center gap-3 px-3 py-2 text-white hover:bg-white/10 rounded-lg cursor-pointer">
            <Settings className="h-4 w-4" />
            Configuración
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-2 bg-white/10" />

          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
