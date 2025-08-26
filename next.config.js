// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // agrega dominios externos si usas <Image> con URLs remotas
    remotePatterns: [],
  },
  // ❌ NADA de experimental.appDir acá
};

module.exports = nextConfig;
