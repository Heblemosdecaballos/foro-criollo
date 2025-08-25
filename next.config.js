/** @type {import('next').NextConfig} */
const nextConfig = {
  // ❌ IMPORTANTÍSIMO: NO uses `output: "export"` si quieres API Routes
  // output: "export",

  reactStrictMode: true,
  experimental: {
    // App Router ya es estable, pero mantenemos explícito si tu repo venía así
    appDir: true,
  },
};

module.exports = nextConfig;
