'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function submitVote(formData) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const captionId = (formData.get('captionId') ?? '').toString().trim()
    const vote = Number(formData.get('vote'))
    const nowIso = new Date().toISOString()

    if (!captionId || ![1, -1].includes(vote)) {
        redirect('/captions?status=invalid')
    }

    const { error } = await supabase.from('caption_votes').upsert(
        {
            caption_id: captionId,
            profile_id: user.id,
            vote_value: vote,
            created_datetime_utc: nowIso,
            modified_datetime_utc: nowIso,
        },
        { onConflict: 'caption_id,profile_id' }
    )

    if (error) {
        console.error('caption_votes upsert failed:', error)
        const msg = encodeURIComponent(error.message ?? 'Unknown database error')
        redirect(`/captions?status=error&message=${msg}`)
    }

    revalidatePath('/captions')
    redirect('/captions?status=success')
}
