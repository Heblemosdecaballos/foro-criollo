/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // lista de hilos
      { source: "/threads", destination: "/foros", permanent: true },

      // detalle legacy: /threads/:id  →  /foros/:id
      // (nuestra página /foros/[slug] ya acepta UUID y redirige al slug canónico)
      { source: "/threads/:id", destination: "/foros/:id", permanent: true },
    ];
  },
};

module.exports = nextConfig;
