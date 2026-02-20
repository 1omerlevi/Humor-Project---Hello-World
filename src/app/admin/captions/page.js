import Link from 'next/link'
import { requireSuperAdmin } from '@/lib/admin/guard'
import { deleteCaption, setCaptionPublic } from './actions'

export const dynamic = 'force-dynamic'

export default async function AdminCaptionsPage({ searchParams }) {
    const { supabase } = await requireSuperAdmin()
    const params = await searchParams

    const { data: captions, error } = await supabase
        .from('captions')
        .select('*')
        .order('created_datetime_utc', { ascending: false })
        .limit(200)

    const status = (params?.status ?? '').toString()
    const message = (params?.message ?? '').toString()

    return (
        <section style={styles.wrap}>
            <div style={styles.topRow}>
                <h2 style={styles.heading}>Manage Captions</h2>
                <Link href="/admin" style={styles.backBtn}>
                    Back to Dashboard
                </Link>
            </div>

            {status === 'success' ? <div style={styles.ok}>Caption action completed.</div> : null}
            {status === 'error' ? (
                <div style={styles.error}>
                    Caption action failed.
                    {message ? <div style={styles.errorMsg}>{decodeURIComponent(message)}</div> : null}
                </div>
            ) : null}

            {error ? (
                <article style={styles.panel}>
                    <strong>Couldn’t load captions.</strong>
                    <div style={styles.errorMsg}>{error.message}</div>
                </article>
            ) : !captions?.length ? (
                <article style={styles.panel}>
                    <strong>No captions found.</strong>
                </article>
            ) : (
                <div style={styles.list}>
                    {captions.map((caption) => (
                        <article key={caption.id} style={styles.card}>
                            <div style={styles.row}>
                                <span style={styles.label}>Caption ID</span>
                                <span style={styles.mono}>{caption.id}</span>
                            </div>

                            <div style={styles.row}>
                                <span style={styles.label}>Content</span>
                                <div style={styles.content}>{caption.content ?? '(empty)'}</div>
                            </div>

                            <div style={styles.metaRow}>
                                {'is_public' in caption ? (
                                    <span style={styles.meta}>public: {caption.is_public ? 'true' : 'false'}</span>
                                ) : null}
                                {'image_id' in caption ? (
                                    <span style={styles.meta}>image: {caption.image_id || '-'}</span>
                                ) : null}
                                {'profile_id' in caption ? (
                                    <span style={styles.meta}>profile: {caption.profile_id || '-'}</span>
                                ) : null}
                            </div>

                            <div style={styles.actions}>
                                {'is_public' in caption ? (
                                    <form action={setCaptionPublic}>
                                        <input type="hidden" name="captionId" value={caption.id} />
                                        <input
                                            type="hidden"
                                            name="value"
                                            value={caption.is_public ? 'false' : 'true'}
                                        />
                                        <button type="submit" style={styles.btn}>
                                            {caption.is_public ? 'Make Private' : 'Make Public'}
                                        </button>
                                    </form>
                                ) : null}

                                <form action={deleteCaption}>
                                    <input type="hidden" name="captionId" value={caption.id} />
                                    <button type="submit" style={styles.btnDanger}>
                                        Delete
                                    </button>
                                </form>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    )
}

const styles = {
    wrap: { display: 'grid', gap: 10 },
    topRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap',
    },
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
    list: { display: 'grid', gap: 10 },
    card: {
        border: '1px solid rgba(255,255,255,0.14)',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.05)',
        padding: 12,
        display: 'grid',
        gap: 10,
    },
    row: { display: 'grid', gap: 4 },
    label: {
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
        opacity: 0.75,
    },
    mono: {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: 12,
        wordBreak: 'break-all',
    },
    content: { lineHeight: 1.45, whiteSpace: 'pre-wrap' },
    metaRow: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
    },
    meta: {
        fontSize: 12,
        opacity: 0.86,
        wordBreak: 'break-all',
    },
    actions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
    btn: {
        border: '1px solid rgba(255,255,255,0.15)',
        background: 'rgba(255,255,255,0.08)',
        color: '#ecf2ff',
        borderRadius: 10,
        padding: '7px 10px',
        cursor: 'pointer',
    },
    btnDanger: {
        border: '1px solid rgba(248, 113, 113, 0.5)',
        background: 'rgba(248, 113, 113, 0.15)',
        color: '#ecf2ff',
        borderRadius: 10,
        padding: '7px 10px',
        cursor: 'pointer',
    },
}
