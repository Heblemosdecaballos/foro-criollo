import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://foro-criollo.vercel.app';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Si hay áreas privadas, se pueden agregar aquí disallows
      // disallow: ['/reports', '/admin'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
