/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@treffy/ui', '@treffy/webrtc', '@treffy/api'],
}

module.exports = nextConfig
