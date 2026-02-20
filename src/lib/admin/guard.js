import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function requireSuperAdmin() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('id,is_superadmin')
        .eq('id', user.id)
        .maybeSingle()

    if (error) {
        redirect('/?admin=profile_query_error')
    }

    if (!profile) {
        redirect('/?admin=profile_missing')
    }

    if (!profile.is_superadmin) {
        redirect('/?admin=forbidden')
    }

    return { supabase, user, profile }
}
