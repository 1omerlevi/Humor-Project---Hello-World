import { NextRequest, NextResponse } from 'next/server'
import { createClient } from './src/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    const { supabase, response } = createClient(request)

    // Protect /items and /captions
    if (
        request.nextUrl.pathname.startsWith('/items') ||
        request.nextUrl.pathname.startsWith('/captions')
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
    matcher: ['/items/:path*', '/captions/:path*'],
}
