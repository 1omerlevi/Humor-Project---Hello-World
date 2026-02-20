import { NextRequest, NextResponse } from 'next/server'
import { createClient } from './src/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    const { supabase, response } = createClient(request)

    // Protect /items, /captions, /upload, and /admin
    if (
        request.nextUrl.pathname.startsWith('/items') ||
        request.nextUrl.pathname.startsWith('/captions') ||
        request.nextUrl.pathname.startsWith('/upload') ||
        request.nextUrl.pathname.startsWith('/admin')
    ) {
        const { data } = await supabase.auth.getUser()
        if (!data.user) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }
    }

    return response
}

export const config = {
    matcher: ['/items/:path*', '/captions/:path*', '/upload/:path*', '/admin/:path*'],
}
