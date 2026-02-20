import Link from 'next/link'
import { requireSuperAdmin } from '@/lib/admin/guard'
import { createHumorFlavor, deleteHumorFlavor, updateHumorFlavor } from './actions'

export const dynamic = 'force-dynamic'

export default async function HumorFlavorsPage({ searchParams }) {
    const { supabase } = await requireSuperAdmin()
    const params = await searchParams

    const { data: flavors, error } = await supabase
        .from('humor_flavors')
        .select('*')
        .order('id', { ascending: false })
        .limit(200)

    const status = (params?.status ?? '').toString()
    const message = (params?.message ?? '').toString()

    return (
        <section style={styles.wrap}>
            <div style={styles.topRow}>
                <h2 style={styles.heading}>Manage Humor Flavors</h2>
                <Link href="/admin" style={styles.backBtn}>
                    Back to Dashboard
                </Link>
            </div>

            {status === 'success' ? <div style={styles.ok}>Action completed.</div> : null}
            {status === 'error' ? (
                <div style={styles.error}>
                    Flavor action failed.
                    {message ? <div style={styles.errorMsg}>{decodeURIComponent(message)}</div> : null}
                </div>
            ) : null}

            <article style={styles.panel}>
                <h3 style={styles.panelTitle}>Create Flavor</h3>
                <form action={createHumorFlavor} style={styles.formRow}>
                    <input name="slug" placeholder="slug (e.g. gen-z-dark-roast)" required style={styles.input} />
                    <input name="description" placeholder="description" style={styles.input} />
                    <button type="submit" style={styles.btnPrimary}>
                        Create
                    </button>
                </form>
            </article>

            {error ? (
                <article style={styles.panel}>
                    <strong>Couldn’t load humor_flavors.</strong>
                    <div style={styles.errorMsg}>{error.message}</div>
                </article>
            ) : !flavors?.length ? (
                <article style={styles.panel}>
                    <strong>No humor flavors found.</strong>
                </article>
            ) : (
                <div style={styles.list}>
                    {flavors.map((flavor) => (
                        <article key={flavor.id} style={styles.card}>
                            <div style={styles.cardTop}>
                                <div>
                                    <div style={styles.label}>Flavor ID</div>
                                    <div style={styles.mono}>{flavor.id}</div>
                                </div>
                                <Link href={`/admin/humor-flavors/${flavor.id}/steps`} style={styles.stepsLink}>
                                    Manage Steps →
                                </Link>
                            </div>

                            <form action={updateHumorFlavor} style={styles.formGrid}>
                                <input type="hidden" name="id" value={flavor.id} />
                                <label style={styles.field}>
                                    <span style={styles.label}>Slug</span>
                                    <input
                                        name="slug"
                                        defaultValue={flavor.slug || ''}
                                        required
                                        style={styles.input}
                                    />
                                </label>
                                <label style={styles.field}>
                                    <span style={styles.label}>Description</span>
                                    <input
                                        name="description"
                                        defaultValue={flavor.description || ''}
                                        style={styles.input}
                                    />
                                </label>
                                <button type="submit" style={styles.btn}>
                                    Save
                                </button>
                            </form>

                            <form action={deleteHumorFlavor}>
                                <input type="hidden" name="id" value={flavor.id} />
                                <button type="submit" style={styles.btnDanger}>
                                    Delete
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
    formRow: { marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' },
    input: {
        border: '1px solid rgba(255,255,255,0.16)',
        background: 'rgba(0,0,0,0.2)',
        color: '#ecf2ff',
        borderRadius: 10,
        padding: '8px 10px',
        minWidth: 240,
    },
    btnPrimary: {
        border: '1px solid rgba(56, 189, 248, 0.5)',
        background: 'rgba(56, 189, 248, 0.16)',
        color: '#ecf2ff',
        borderRadius: 10,
        padding: '8px 12px',
        cursor: 'pointer',
        fontWeight: 700,
    },
    list: { display: 'grid', gap: 10 },
    card: {
        border: '1px solid rgba(255,255,255,0.14)',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.05)',
        padding: 12,
        display: 'grid',
        gap: 10,
    },
    cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
    label: { fontSize: 12, opacity: 0.78, textTransform: 'uppercase', letterSpacing: 0.8 },
    mono: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' },
    stepsLink: {
        textDecoration: 'none',
        color: '#93c5fd',
        border: '1px solid rgba(147,197,253,0.4)',
        borderRadius: 10,
        padding: '7px 10px',
        background: 'rgba(147,197,253,0.12)',
        fontWeight: 700,
    },
    formGrid: { display: 'grid', gap: 8 },
    field: { display: 'grid', gap: 4 },
    btn: {
        border: '1px solid rgba(255,255,255,0.15)',
        background: 'rgba(255,255,255,0.08)',
        color: '#ecf2ff',
        borderRadius: 10,
        padding: '8px 10px',
        cursor: 'pointer',
        justifySelf: 'start',
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
