'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireSuperAdmin } from '@/lib/admin/guard'

export async function setProfileSuperAdmin(formData) {
    const { supabase } = await requireSuperAdmin()

    const profileId = (formData.get('profileId') ?? '').toString().trim()
    const value = (formData.get('value') ?? '').toString().trim() === 'true'

    if (!profileId) {
        redirect('/admin/profiles?status=error&message=Missing%20profile%20id')
    }

    const { error } = await supabase
        .from('profiles')
        .update({ is_superadmin: value })
        .eq('id', profileId)

    if (error) {
        const msg = encodeURIComponent(error.message ?? 'Failed to update profile')
        redirect(`/admin/profiles?status=error&message=${msg}`)
    }

    revalidatePath('/admin')
    revalidatePath('/admin/profiles')
    redirect('/admin/profiles?status=success')
}

export async function deleteProfile(formData) {
    const { supabase } = await requireSuperAdmin()

    const profileId = (formData.get('profileId') ?? '').toString().trim()
    if (!profileId) {
        redirect('/admin/profiles?status=error&message=Missing%20profile%20id')
    }

    const { error } = await supabase.from('profiles').delete().eq('id', profileId)

    if (error) {
        const msg = encodeURIComponent(error.message ?? 'Failed to delete profile')
        redirect(`/admin/profiles?status=error&message=${msg}`)
    }

    revalidatePath('/admin')
    revalidatePath('/admin/profiles')
    redirect('/admin/profiles?status=success')
}
