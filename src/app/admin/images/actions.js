'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireSuperAdmin } from '@/lib/admin/guard'

export async function deleteImage(formData) {
    const { supabase } = await requireSuperAdmin()

    const imageId = (formData.get('imageId') ?? '').toString().trim()
    if (!imageId) {
        redirect('/admin/images?status=error&message=Missing%20image%20id')
    }

    const { error } = await supabase.from('images').delete().eq('id', imageId)

    if (error) {
        const msg = encodeURIComponent(error.message ?? 'Failed to delete image')
        redirect(`/admin/images?status=error&message=${msg}`)
    }

    revalidatePath('/admin')
    revalidatePath('/admin/images')
    redirect('/admin/images?status=success')
}
