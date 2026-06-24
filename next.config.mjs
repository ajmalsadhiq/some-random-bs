/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Prevent prerendering that requires DATABASE_URL at build time
  staticPageGenerationTimeout: 0,
}

export default nextConfig
