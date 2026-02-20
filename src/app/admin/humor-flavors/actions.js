'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireSuperAdmin } from '@/lib/admin/guard'

function fail(path, message) {
    redirect(`${path}?status=error&message=${encodeURIComponent(message)}`)
}

export async function createHumorFlavor(formData) {
    const { supabase } = await requireSuperAdmin()

    const slug = (formData.get('slug') ?? '').toString().trim()
    const description = (formData.get('description') ?? '').toString().trim()

    if (!slug) fail('/admin/humor-flavors', 'Slug is required')

    const { error } = await supabase.from('humor_flavors').insert({
        slug,
        description: description || null,
    })

    if (error) fail('/admin/humor-flavors', error.message || 'Failed to create humor flavor')

    revalidatePath('/admin')
    revalidatePath('/admin/humor-flavors')
    redirect('/admin/humor-flavors?status=success')
}

export async function updateHumorFlavor(formData) {
    const { supabase } = await requireSuperAdmin()

    const id = Number(formData.get('id'))
    const slug = (formData.get('slug') ?? '').toString().trim()
    const description = (formData.get('description') ?? '').toString().trim()

    if (!id) fail('/admin/humor-flavors', 'Flavor id is required')
    if (!slug) fail('/admin/humor-flavors', 'Slug is required')

    const { error } = await supabase
        .from('humor_flavors')
        .update({ slug, description: description || null })
        .eq('id', id)

    if (error) fail('/admin/humor-flavors', error.message || 'Failed to update humor flavor')

    revalidatePath('/admin')
    revalidatePath('/admin/humor-flavors')
    redirect('/admin/humor-flavors?status=success')
}

export async function deleteHumorFlavor(formData) {
    const { supabase } = await requireSuperAdmin()

    const id = Number(formData.get('id'))
    if (!id) fail('/admin/humor-flavors', 'Flavor id is required')

    const { error } = await supabase.from('humor_flavors').delete().eq('id', id)

    if (error) fail('/admin/humor-flavors', error.message || 'Failed to delete humor flavor')

    revalidatePath('/admin')
    revalidatePath('/admin/humor-flavors')
    redirect('/admin/humor-flavors?status=success')
}
