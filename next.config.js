/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['media.api-sports.io', 'www.thesportsdb.com'],
    unoptimized: false,
  },
  // Optimize for free hosting
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  // Reduce memory usage
  experimental: {
    optimizeCss: true,
  },
}

module.exports = nextConfig
