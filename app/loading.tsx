import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto mb-6 relative z-10" />
        </div>
        <p className="text-white text-xl">Cargando...</p>
      </div>
    </div>
  )
}
