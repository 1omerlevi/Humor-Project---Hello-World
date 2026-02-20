'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireSuperAdmin } from '@/lib/admin/guard'

export async function setCaptionPublic(formData) {
    const { supabase } = await requireSuperAdmin()

    const captionId = (formData.get('captionId') ?? '').toString().trim()
    const value = (formData.get('value') ?? '').toString().trim() === 'true'

    if (!captionId) {
        redirect('/admin/captions?status=error&message=Missing%20caption%20id')
    }

    const { error } = await supabase
        .from('captions')
        .update({ is_public: value })
        .eq('id', captionId)

    if (error) {
        const msg = encodeURIComponent(error.message ?? 'Failed to update caption')
        redirect(`/admin/captions?status=error&message=${msg}`)
    }

    revalidatePath('/admin')
    revalidatePath('/admin/captions')
    redirect('/admin/captions?status=success')
}

export async function deleteCaption(formData) {
    const { supabase } = await requireSuperAdmin()

    const captionId = (formData.get('captionId') ?? '').toString().trim()
    if (!captionId) {
        redirect('/admin/captions?status=error&message=Missing%20caption%20id')
    }

    const { error } = await supabase.from('captions').delete().eq('id', captionId)

    if (error) {
        const msg = encodeURIComponent(error.message ?? 'Failed to delete caption')
        redirect(`/admin/captions?status=error&message=${msg}`)
    }

    revalidatePath('/admin')
    revalidatePath('/admin/captions')
    redirect('/admin/captions?status=success')
}
