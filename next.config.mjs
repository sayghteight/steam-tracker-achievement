/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'steamcdn-a.akamaihd.net',
      },
      {
        protocol: 'https',
        hostname: 'cdn.cloudflare.steamstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.akamai.steamstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'media.steampowered.com',
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
