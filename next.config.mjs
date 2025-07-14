/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      "steamcdn-a.akamaihd.net",
      "cdn.cloudflare.steamstatic.com",
      "avatars.akamai.steamstatic.com", // Para avatares de usuario
      "media.steampowered.com" // Añadido para imágenes de juegos
    ],
    unoptimized: true,
  },
}

export default nextConfig
