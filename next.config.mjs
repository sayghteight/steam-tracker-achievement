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
      'shared.akamai.steamstatic.com',
      'steamcdn-a.akamaihd.net',
      'avatars.steamstatic.com',
      'steamuserimages-a.akamaihd.net',
      'cdn.cloudflare.steamstatic.com'
    ],
    unoptimized: true
  },
  experimental: {
    serverComponentsExternalPackages: []
  },
  // Configuración para Vercel
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Optimizaciones para build
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  }
}

export default nextConfig
