import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Handle CORS for API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    // Add CORS headers for API endpoints
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: res.headers });
    }
  }
  
  // Handle Supabase auth session
  try {
    await updateSession(req, res);
  } catch (error) {
    console.error('Supabase session update error:', error);
    // Continue without failing if auth update fails
  }
  
  // Add security headers for all routes
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt, sitemap.xml (SEO files)
     * - public assets (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)"]
};
