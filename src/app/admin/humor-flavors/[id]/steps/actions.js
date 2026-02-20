'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireSuperAdmin } from '@/lib/admin/guard'

function toNumber(value) {
    const n = Number(value)
    return Number.isFinite(n) ? n : null
}

function toNullableNumber(value) {
    const str = (value ?? '').toString().trim()
    if (!str) return null
    const n = Number(str)
    return Number.isFinite(n) ? n : null
}

function stepsPath(humorFlavorId) {
    return `/admin/humor-flavors/${humorFlavorId}/steps`
}

function fail(humorFlavorId, message) {
    redirect(`${stepsPath(humorFlavorId)}?status=error&message=${encodeURIComponent(message)}`)
}

export async function createHumorFlavorStep(formData) {
    const { supabase } = await requireSuperAdmin()

    const humorFlavorId = toNumber(formData.get('humorFlavorId'))
    if (!humorFlavorId) fail('0', 'Missing humor flavor id')

    const payload = {
        humor_flavor_id: humorFlavorId,
        order_by: toNumber(formData.get('order_by')),
        llm_temperature: toNullableNumber(formData.get('llm_temperature')),
        llm_input_type_id: toNumber(formData.get('llm_input_type_id')),
        llm_output_type_id: toNumber(formData.get('llm_output_type_id')),
        llm_model_id: toNumber(formData.get('llm_model_id')),
        humor_flavor_step_type_id: toNumber(formData.get('humor_flavor_step_type_id')),
        llm_system_prompt: (formData.get('llm_system_prompt') ?? '').toString().trim(),
        llm_user_prompt: (formData.get('llm_user_prompt') ?? '').toString().trim(),
        description: ((formData.get('description') ?? '').toString().trim() || null),
    }

    if (!payload.order_by || !payload.llm_input_type_id || !payload.llm_output_type_id || !payload.llm_model_id || !payload.humor_flavor_step_type_id) {
        fail(humorFlavorId, 'Missing required numeric fields')
    }

    const { error } = await supabase.from('humor_flavor_steps').insert(payload)
    if (error) fail(humorFlavorId, error.message || 'Failed to create step')

    revalidatePath('/admin')
    revalidatePath('/admin/humor-flavors')
    revalidatePath(stepsPath(humorFlavorId))
    redirect(`${stepsPath(humorFlavorId)}?status=success`)
}

export async function updateHumorFlavorStep(formData) {
    const { supabase } = await requireSuperAdmin()

    const stepId = toNumber(formData.get('stepId'))
    const humorFlavorId = toNumber(formData.get('humorFlavorId'))
    if (!stepId || !humorFlavorId) fail(humorFlavorId || '0', 'Missing ids')

    const payload = {
        order_by: toNumber(formData.get('order_by')),
        llm_temperature: toNullableNumber(formData.get('llm_temperature')),
        llm_input_type_id: toNumber(formData.get('llm_input_type_id')),
        llm_output_type_id: toNumber(formData.get('llm_output_type_id')),
        llm_model_id: toNumber(formData.get('llm_model_id')),
        humor_flavor_step_type_id: toNumber(formData.get('humor_flavor_step_type_id')),
        llm_system_prompt: (formData.get('llm_system_prompt') ?? '').toString().trim(),
        llm_user_prompt: (formData.get('llm_user_prompt') ?? '').toString().trim(),
        description: ((formData.get('description') ?? '').toString().trim() || null),
    }

    if (!payload.order_by || !payload.llm_input_type_id || !payload.llm_output_type_id || !payload.llm_model_id || !payload.humor_flavor_step_type_id) {
        fail(humorFlavorId, 'Missing required numeric fields')
    }

    const { error } = await supabase
        .from('humor_flavor_steps')
        .update(payload)
        .eq('id', stepId)
        .eq('humor_flavor_id', humorFlavorId)

    if (error) fail(humorFlavorId, error.message || 'Failed to update step')

    revalidatePath('/admin')
    revalidatePath('/admin/humor-flavors')
    revalidatePath(stepsPath(humorFlavorId))
    redirect(`${stepsPath(humorFlavorId)}?status=success`)
}

export async function deleteHumorFlavorStep(formData) {
    const { supabase } = await requireSuperAdmin()

    const stepId = toNumber(formData.get('stepId'))
    const humorFlavorId = toNumber(formData.get('humorFlavorId'))
    if (!stepId || !humorFlavorId) fail(humorFlavorId || '0', 'Missing ids')

    const { error } = await supabase
        .from('humor_flavor_steps')
        .delete()
        .eq('id', stepId)
        .eq('humor_flavor_id', humorFlavorId)

    if (error) fail(humorFlavorId, error.message || 'Failed to delete step')

    revalidatePath('/admin')
    revalidatePath('/admin/humor-flavors')
    revalidatePath(stepsPath(humorFlavorId))
    redirect(`${stepsPath(humorFlavorId)}?status=success`)
}
