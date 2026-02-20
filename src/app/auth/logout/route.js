import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request) {
    const origin = new URL(request.url).origin
    const supabase = await createClient()
    await supabase.auth.signOut()
    return NextResponse.redirect(`${origin}/login`)
}
