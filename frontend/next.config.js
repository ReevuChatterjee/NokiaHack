/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',  // Required: Generates static HTML/CSS/JS
  images: {
    unoptimized: true // Required: Next.js Image Optimization API doesn't work in static export
  }
}

module.exports = nextConfig
