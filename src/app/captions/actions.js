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
    const idxRaw = (formData.get('idx') ?? '').toString().trim()
    const idxNum = Number(idxRaw)
    const idxQuery = Number.isFinite(idxNum) && idxNum >= 0 ? `&idx=${Math.floor(idxNum)}` : ''

    if (!captionId || ![1, -1].includes(vote)) {
        redirect(`/captions?status=invalid${idxQuery}`)
    }

    const { data: existingVote, error: lookupError } = await supabase
        .from('caption_votes')
        .select('id')
        .eq('caption_id', captionId)
        .eq('profile_id', user.id)
        .maybeSingle()

    if (lookupError) {
        console.error('caption_votes lookup failed:', lookupError)
        const msg = encodeURIComponent(lookupError.message ?? 'Unknown database error')
        redirect(`/captions?status=error&message=${msg}${idxQuery}`)
    }

    const mutation = existingVote
        ? supabase
              .from('caption_votes')
              .update({
                  vote_value: vote,
                  modified_by_user_id: user.id,
              })
              .eq('id', existingVote.id)
        : supabase.from('caption_votes').insert({
              caption_id: captionId,
              profile_id: user.id,
              vote_value: vote,
              created_by_user_id: user.id,
              modified_by_user_id: user.id,
          })

    const { error } = await mutation

    if (error) {
        console.error('caption_votes upsert failed:', error)
        const msg = encodeURIComponent(error.message ?? 'Unknown database error')
        redirect(`/captions?status=error&message=${msg}${idxQuery}`)
    }

    revalidatePath('/captions')
    redirect(`/captions?status=success${idxQuery}`)
}
