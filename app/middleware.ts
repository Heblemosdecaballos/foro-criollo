
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  // Middleware desactivado temporalmente para debugging
  return NextResponse.next()
}

export const config = {
  matcher: []
}
