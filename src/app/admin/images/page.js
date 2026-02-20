import Link from 'next/link'
import { requireSuperAdmin } from '@/lib/admin/guard'
import { deleteImage } from './actions'

export const dynamic = 'force-dynamic'

function getImageUrl(image) {
    return (
        image?.url ||
        image?.image_url ||
        image?.cdn_url ||
        image?.storage_url ||
        image?.storage_path ||
        ''
    )
}

export default async function AdminImagesPage({ searchParams }) {
    const { supabase } = await requireSuperAdmin()
    const params = await searchParams

    const { data: images, error } = await supabase.from('images').select('*').order('id', { ascending: false }).limit(200)

    const status = (params?.status ?? '').toString()
    const message = (params?.message ?? '').toString()

    return (
        <section style={styles.wrap}>
            <div style={styles.topRow}>
                <h2 style={styles.heading}>Manage Images</h2>
                <Link href="/admin" style={styles.backBtn}>
                    Back to Dashboard
                </Link>
            </div>

            {status === 'success' ? <div style={styles.ok}>Image action completed.</div> : null}
            {status === 'error' ? (
                <div style={styles.error}>
                    Image action failed.
                    {message ? <div style={styles.errorMsg}>{decodeURIComponent(message)}</div> : null}
                </div>
            ) : null}

            {error ? (
                <article style={styles.panel}>
                    <strong>Couldn’t load images.</strong>
                    <div style={styles.errorMsg}>{error.message}</div>
                </article>
            ) : !images?.length ? (
                <article style={styles.panel}>
                    <strong>No images found.</strong>
                </article>
            ) : (
                <div style={styles.grid}>
                    {images.map((image) => {
                        const url = getImageUrl(image)
                        return (
                            <article key={image.id} style={styles.card}>
                                <div style={styles.row}>
                                    <span style={styles.label}>ID:</span>
                                    <span style={styles.mono}>{image.id}</span>
                                </div>

                                {'profile_id' in image ? (
                                    <div style={styles.row}>
                                        <span style={styles.label}>Profile:</span>
                                        <span style={styles.mono}>{image.profile_id || '-'}</span>
                                    </div>
                                ) : null}

                                {'created_datetime_utc' in image ? (
                                    <div style={styles.row}>
                                        <span style={styles.label}>Created:</span>
                                        <span>{image.created_datetime_utc || '-'}</span>
                                    </div>
                                ) : null}

                                {url ? (
                                    <a href={url} target="_blank" rel="noreferrer" style={styles.link}>
                                        Open image URL
                                    </a>
                                ) : null}

                                <form action={deleteImage}>
                                    <input type="hidden" name="imageId" value={image.id} />
                                    <button type="submit" style={styles.btnDanger}>
                                        Delete
                                    </button>
                                </form>
                            </article>
                        )
                    })}
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
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 10,
    },
    card: {
        border: '1px solid rgba(255,255,255,0.14)',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.05)',
        padding: 12,
        display: 'grid',
        gap: 8,
    },
    row: { display: 'grid', gap: 3 },
    label: { fontSize: 12, opacity: 0.75, textTransform: 'uppercase', letterSpacing: 0.8 },
    mono: {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: 12,
        wordBreak: 'break-all',
    },
    link: {
        color: '#93c5fd',
        textDecoration: 'none',
        wordBreak: 'break-all',
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
