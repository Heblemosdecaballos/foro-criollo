// app/robots.ts
export default function robots() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "";
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: base ? `${base}/sitemap.xml` : undefined
  };
}
