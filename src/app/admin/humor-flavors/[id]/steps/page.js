import Link from 'next/link'
import { requireSuperAdmin } from '@/lib/admin/guard'
import { createHumorFlavorStep, deleteHumorFlavorStep, updateHumorFlavorStep } from './actions'

export const dynamic = 'force-dynamic'

function optionLabel(row) {
    return row?.name || row?.slug || row?.description || `id=${row?.id}`
}

export default async function HumorFlavorStepsPage({ params, searchParams }) {
    const { supabase } = await requireSuperAdmin()
    const routeParams = await params
    const queryParams = await searchParams
    const humorFlavorId = Number(routeParams?.id)

    if (!humorFlavorId) {
        return (
            <section style={styles.wrap}>
                <h2 style={styles.heading}>Manage Flavor Steps</h2>
                <div style={styles.error}>Invalid flavor id.</div>
            </section>
        )
    }

    const [
        { data: flavor, error: flavorError },
        { data: steps, error: stepsError },
        { data: stepTypes },
        { data: inputTypes },
        { data: outputTypes },
        { data: models },
    ] = await Promise.all([
        supabase.from('humor_flavors').select('*').eq('id', humorFlavorId).maybeSingle(),
        supabase
            .from('humor_flavor_steps')
            .select('*')
            .eq('humor_flavor_id', humorFlavorId)
            .order('order_by', { ascending: true })
            .order('id', { ascending: true }),
        supabase.from('humor_flavor_step_types').select('*').order('id', { ascending: true }),
        supabase.from('llm_input_types').select('*').order('id', { ascending: true }),
        supabase.from('llm_output_types').select('*').order('id', { ascending: true }),
        supabase.from('llm_models').select('*').order('id', { ascending: true }),
    ])

    const status = (queryParams?.status ?? '').toString()
    const message = (queryParams?.message ?? '').toString()

    return (
        <section style={styles.wrap}>
            <div style={styles.topRow}>
                <div>
                    <h2 style={styles.heading}>Manage Flavor Steps</h2>
                    <p style={styles.sub}>
                        Flavor ID: <span style={styles.mono}>{humorFlavorId}</span>
                        {flavor?.slug ? (
                            <>
                                {' '}
                                • Slug: <span style={styles.mono}>{flavor.slug}</span>
                            </>
                        ) : null}
                    </p>
                </div>
                <Link href="/admin/humor-flavors" style={styles.backBtn}>
                    Back to Humor Flavors
                </Link>
            </div>

            {status === 'success' ? <div style={styles.ok}>Action completed.</div> : null}
            {status === 'error' ? (
                <div style={styles.error}>
                    Step action failed.
                    {message ? <div style={styles.errorMsg}>{decodeURIComponent(message)}</div> : null}
                </div>
            ) : null}

            {flavorError ? <div style={styles.error}>Failed loading flavor: {flavorError.message}</div> : null}

            <article style={styles.panel}>
                <h3 style={styles.panelTitle}>Create Step</h3>
                <form action={createHumorFlavorStep} style={styles.formGrid}>
                    <input type="hidden" name="humorFlavorId" value={humorFlavorId} />
                    <div style={styles.row2}>
                        <label style={styles.field}>
                            <span style={styles.label}>Order</span>
                            <input name="order_by" type="number" defaultValue={1} required style={styles.input} />
                        </label>
                        <label style={styles.field}>
                            <span style={styles.label}>Temperature (optional)</span>
                            <input name="llm_temperature" type="number" step="0.1" style={styles.input} />
                        </label>
                    </div>

                    <div style={styles.row4}>
                        <label style={styles.field}>
                            <span style={styles.label}>Input Type</span>
                            <select name="llm_input_type_id" required style={styles.select}>
                                {inputTypes?.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.id} - {optionLabel(r)}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label style={styles.field}>
                            <span style={styles.label}>Output Type</span>
                            <select name="llm_output_type_id" required style={styles.select}>
                                {outputTypes?.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.id} - {optionLabel(r)}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label style={styles.field}>
                            <span style={styles.label}>Model</span>
                            <select name="llm_model_id" required style={styles.select}>
                                {models?.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.id} - {optionLabel(r)}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label style={styles.field}>
                            <span style={styles.label}>Step Type</span>
                            <select name="humor_flavor_step_type_id" required style={styles.select}>
                                {stepTypes?.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.id} - {optionLabel(r)}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <label style={styles.field}>
                        <span style={styles.label}>System Prompt</span>
                        <textarea name="llm_system_prompt" rows={4} required style={styles.textarea} />
                    </label>
                    <label style={styles.field}>
                        <span style={styles.label}>User Prompt</span>
                        <textarea name="llm_user_prompt" rows={4} required style={styles.textarea} />
                    </label>
                    <label style={styles.field}>
                        <span style={styles.label}>Description (optional)</span>
                        <input name="description" style={styles.input} />
                    </label>

                    <button type="submit" style={styles.btnPrimary}>
                        Create Step
                    </button>
                </form>
            </article>

            {stepsError ? (
                <article style={styles.panel}>
                    <strong>Couldn’t load steps.</strong>
                    <div style={styles.errorMsg}>{stepsError.message}</div>
                </article>
            ) : !steps?.length ? (
                <article style={styles.panel}>
                    <strong>No steps found for this flavor.</strong>
                </article>
            ) : (
                <div style={styles.list}>
                    {steps.map((step) => (
                        <article key={step.id} style={styles.card}>
                            <div style={styles.cardTop}>
                                <div style={styles.label}>
                                    Step ID: <span style={styles.mono}>{step.id}</span>
                                </div>
                            </div>

                            <form action={updateHumorFlavorStep} style={styles.formGrid}>
                                <input type="hidden" name="stepId" value={step.id} />
                                <input type="hidden" name="humorFlavorId" value={humorFlavorId} />

                                <div style={styles.row2}>
                                    <label style={styles.field}>
                                        <span style={styles.label}>Order</span>
                                        <input
                                            name="order_by"
                                            type="number"
                                            defaultValue={step.order_by ?? 1}
                                            required
                                            style={styles.input}
                                        />
                                    </label>
                                    <label style={styles.field}>
                                        <span style={styles.label}>Temperature (optional)</span>
                                        <input
                                            name="llm_temperature"
                                            type="number"
                                            step="0.1"
                                            defaultValue={step.llm_temperature ?? ''}
                                            style={styles.input}
                                        />
                                    </label>
                                </div>

                                <div style={styles.row4}>
                                    <label style={styles.field}>
                                        <span style={styles.label}>Input Type</span>
                                        <select
                                            name="llm_input_type_id"
                                            defaultValue={step.llm_input_type_id ?? ''}
                                            required
                                            style={styles.select}
                                        >
                                            {inputTypes?.map((r) => (
                                                <option key={r.id} value={r.id}>
                                                    {r.id} - {optionLabel(r)}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <label style={styles.field}>
                                        <span style={styles.label}>Output Type</span>
                                        <select
                                            name="llm_output_type_id"
                                            defaultValue={step.llm_output_type_id ?? ''}
                                            required
                                            style={styles.select}
                                        >
                                            {outputTypes?.map((r) => (
                                                <option key={r.id} value={r.id}>
                                                    {r.id} - {optionLabel(r)}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <label style={styles.field}>
                                        <span style={styles.label}>Model</span>
                                        <select
                                            name="llm_model_id"
                                            defaultValue={step.llm_model_id ?? ''}
                                            required
                                            style={styles.select}
                                        >
                                            {models?.map((r) => (
                                                <option key={r.id} value={r.id}>
                                                    {r.id} - {optionLabel(r)}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                    <label style={styles.field}>
                                        <span style={styles.label}>Step Type</span>
                                        <select
                                            name="humor_flavor_step_type_id"
                                            defaultValue={step.humor_flavor_step_type_id ?? ''}
                                            required
                                            style={styles.select}
                                        >
                                            {stepTypes?.map((r) => (
                                                <option key={r.id} value={r.id}>
                                                    {r.id} - {optionLabel(r)}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>

                                <label style={styles.field}>
                                    <span style={styles.label}>System Prompt</span>
                                    <textarea
                                        name="llm_system_prompt"
                                        rows={4}
                                        defaultValue={step.llm_system_prompt ?? ''}
                                        required
                                        style={styles.textarea}
                                    />
                                </label>
                                <label style={styles.field}>
                                    <span style={styles.label}>User Prompt</span>
                                    <textarea
                                        name="llm_user_prompt"
                                        rows={4}
                                        defaultValue={step.llm_user_prompt ?? ''}
                                        required
                                        style={styles.textarea}
                                    />
                                </label>
                                <label style={styles.field}>
                                    <span style={styles.label}>Description (optional)</span>
                                    <input
                                        name="description"
                                        defaultValue={step.description ?? ''}
                                        style={styles.input}
                                    />
                                </label>

                                <div style={styles.actions}>
                                    <button type="submit" style={styles.btn}>
                                        Save Step
                                    </button>
                                </div>
                            </form>

                            <form action={deleteHumorFlavorStep}>
                                <input type="hidden" name="stepId" value={step.id} />
                                <input type="hidden" name="humorFlavorId" value={humorFlavorId} />
                                <button type="submit" style={styles.btnDanger}>
                                    Delete Step
                                </button>
                            </form>
                        </article>
                    ))}
                </div>
            )}
        </section>
    )
}

const styles = {
    wrap: { display: 'grid', gap: 10 },
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
    heading: { margin: 0, fontSize: 24 },
    sub: { margin: '6px 0 0', opacity: 0.88 },
    mono: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' },
    backBtn: {
        textDecoration: 'none',
        color: '#ecf2ff',
        border: '1px solid rgba(255,255,255,0.16)',
        borderRadius: 10,
        padding: '7px 10px',
        background: 'rgba(255,255,255,0.08)',
        fontWeight: 700,
    },
    ok: {
        border: '1px solid rgba(74, 222, 128, 0.45)',
        background: 'rgba(74, 222, 128, 0.12)',
        borderRadius: 12,
        padding: 10,
    },
    error: {
        border: '1px solid rgba(248, 113, 113, 0.45)',
        background: 'rgba(248, 113, 113, 0.12)',
        borderRadius: 12,
        padding: 10,
    },
    errorMsg: { marginTop: 6, wordBreak: 'break-word', opacity: 0.95 },
    panel: {
        border: '1px solid rgba(255,255,255,0.14)',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.05)',
        padding: 12,
    },
    panelTitle: { margin: 0, fontSize: 18 },
    list: { display: 'grid', gap: 10 },
    card: {
        border: '1px solid rgba(255,255,255,0.14)',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.05)',
        padding: 12,
        display: 'grid',
        gap: 10,
    },
    cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    formGrid: { display: 'grid', gap: 8 },
    row2: { display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' },
    row4: { display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' },
    field: { display: 'grid', gap: 4 },
    label: { fontSize: 12, opacity: 0.78, textTransform: 'uppercase', letterSpacing: 0.8 },
    input: {
        border: '1px solid rgba(255,255,255,0.16)',
        background: 'rgba(0,0,0,0.2)',
        color: '#ecf2ff',
        borderRadius: 10,
        padding: '8px 10px',
        width: '100%',
    },
    select: {
        border: '1px solid rgba(255,255,255,0.16)',
        background: 'rgba(0,0,0,0.2)',
        color: '#ecf2ff',
        borderRadius: 10,
        padding: '8px 10px',
        width: '100%',
    },
    textarea: {
        border: '1px solid rgba(255,255,255,0.16)',
        background: 'rgba(0,0,0,0.2)',
        color: '#ecf2ff',
        borderRadius: 10,
        padding: '8px 10px',
        width: '100%',
        resize: 'vertical',
    },
    actions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
    btnPrimary: {
        border: '1px solid rgba(56, 189, 248, 0.5)',
        background: 'rgba(56, 189, 248, 0.16)',
        color: '#ecf2ff',
        borderRadius: 10,
        padding: '8px 12px',
        cursor: 'pointer',
        fontWeight: 700,
        justifySelf: 'start',
    },
    btn: {
        border: '1px solid rgba(255,255,255,0.15)',
        background: 'rgba(255,255,255,0.08)',
        color: '#ecf2ff',
        borderRadius: 10,
        padding: '8px 10px',
        cursor: 'pointer',
    },
    btnDanger: {
        border: '1px solid rgba(248, 113, 113, 0.5)',
        background: 'rgba(248, 113, 113, 0.15)',
        color: '#ecf2ff',
        borderRadius: 10,
        padding: '8px 10px',
        cursor: 'pointer',
    },
}
