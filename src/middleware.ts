import { type NextRequest } from 'next/server'
import { updateSession } from './utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Only run middleware on app pages that need session refresh.
     * Skip: _next/static, _next/image, favicon, public files, API routes.
     */
    '/((?!_next/static|_next/image|favicon.ico|icons/|images/|api/|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|txt|xml)$).*)',
  ],
}
