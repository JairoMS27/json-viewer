/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizeCss: false,
  },
}

module.exports = nextConfig 