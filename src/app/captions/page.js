import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { submitVote } from './actions'

export const dynamic = 'force-dynamic'

export default async function CaptionsPage({ searchParams }) {
    const params = await searchParams
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const email = user?.email || 'Unknown'

    const { data: captions, error } = await supabase
        .from('captions')
        .select('id,content,image_id,image:images(url)')
        .order('id', { ascending: true })
        .limit(200)

    const status = (params?.status ?? '').toString()
    const errorMessage = (params?.message ?? '').toString()
    const idxRaw = Number((params?.idx ?? '0').toString())
    const total = captions?.length ?? 0
    const safeIdx = total > 0 ? Math.max(0, Math.min(total - 1, Number.isFinite(idxRaw) ? Math.floor(idxRaw) : 0)) : 0
    const caption = total > 0 ? captions[safeIdx] : null
    const prevHref = `/captions?idx=${Math.max(0, safeIdx - 1)}`
    const nextHref = `/captions?idx=${Math.min(total - 1, safeIdx + 1)}`

    return (
        <main style={styles.page}>
            <header style={styles.header}>
                <div style={styles.headerInner}>
                    <div>
                        <h1 style={styles.h1}>Rate Captions</h1>
                        <p style={styles.sub}>
                            Signed in as <span style={styles.mono}>{email}</span>
                        </p>
                    </div>
                    <div style={styles.actions}>
                        <Link href="/items" style={styles.navBtn}>
                            Majors
                        </Link>
                        <Link href="/" style={styles.navBtn}>
                            Home
                        </Link>
                        <Link href="/upload" style={styles.navBtn}>
                            Upload
                        </Link>
                        <a href="/auth/logout" style={styles.navBtn}>
                            Logout
                        </a>
                    </div>
                </div>
            </header>

            <section style={styles.content}>
                {status === 'success' && (
                    <div style={styles.okBanner}>Your vote was recorded successfully.</div>
                )}
                {status === 'error' && (
                    <div style={styles.errorBanner}>
                        Could not submit vote.
                        {errorMessage ? <div style={styles.msg}>{decodeURIComponent(errorMessage)}</div> : null}
                    </div>
                )}
                {status === 'invalid' && <div style={styles.errorBanner}>Invalid vote request.</div>}

                {error ? (
                    <div style={styles.card}>
                        <strong>Couldn’t load captions.</strong>
                        <div style={styles.msg}>{error.message}</div>
                    </div>
                ) : !captions?.length ? (
                    <div style={styles.card}>
                        <strong>No captions found.</strong>
                        <div style={styles.msg}>Insert rows into the `captions` table first.</div>
                    </div>
                ) : (
                    <article style={styles.card}>
                        <div style={styles.navRow}>
                            {safeIdx > 0 ? (
                                <Link href={prevHref} style={styles.arrowBtn}>
                                    ← Prev
                                </Link>
                            ) : (
                                <span style={styles.arrowBtnDisabled}>← Prev</span>
                            )}
                            <div style={styles.counter}>
                                {safeIdx + 1} / {total}
                            </div>
                            {safeIdx < total - 1 ? (
                                <Link href={nextHref} style={styles.arrowBtn}>
                                    Next →
                                </Link>
                            ) : (
                                <span style={styles.arrowBtnDisabled}>Next →</span>
                            )}
                        </div>

                        {caption?.image?.url ? (
                            <div style={styles.imageWrap}>
                                <img
                                    src={caption.image.url}
                                    alt="Caption context image"
                                    style={styles.image}
                                />
                            </div>
                        ) : (
                            <div style={styles.imageMissing}>Image unavailable for this caption.</div>
                        )}

                        <div style={styles.captionText}>{caption?.content}</div>
                        <div style={styles.voteRow}>
                            <form action={submitVote}>
                                <input type="hidden" name="captionId" value={caption?.id} />
                                <input type="hidden" name="vote" value="1" />
                                <input type="hidden" name="idx" value={safeIdx} />
                                <button type="submit" style={styles.upBtn}>
                                    👍 Upvote
                                </button>
                            </form>
                            <form action={submitVote}>
                                <input type="hidden" name="captionId" value={caption?.id} />
                                <input type="hidden" name="vote" value="-1" />
                                <input type="hidden" name="idx" value={safeIdx} />
                                <button type="submit" style={styles.downBtn}>
                                    👎 Downvote
                                </button>
                            </form>
                        </div>
                    </article>
                )}
            </section>
        </main>
    )
}

const styles = {
    page: {
        minHeight: '100vh',
        padding: '24px 16px 40px',
        background:
            'radial-gradient(1200px 700px at 20% -10%, rgba(120, 119, 198, 0.35), transparent 60%), radial-gradient(900px 600px at 90% 0%, rgba(56, 189, 248, 0.22), transparent 55%), #0b0f19',
        color: '#e8eefc',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
    },
    header: { borderBottom: '1px solid rgba(255,255,255,0.14)', paddingBottom: 14 },
    headerInner: {
        maxWidth: 920,
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: 16,
    },
    h1: { margin: 0, fontSize: 34 },
    sub: { margin: '8px 0 0', opacity: 0.85 },
    mono: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' },
    actions: { display: 'flex', gap: 10, flexWrap: 'wrap' },
    navBtn: {
        color: '#e8eefc',
        textDecoration: 'none',
        padding: '10px 12px',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'rgba(255,255,255,0.06)',
    },
    content: { maxWidth: 920, margin: '16px auto 0' },
    okBanner: {
        marginBottom: 12,
        padding: 12,
        borderRadius: 12,
        border: '1px solid rgba(74, 222, 128, 0.45)',
        background: 'rgba(74, 222, 128, 0.12)',
    },
    errorBanner: {
        marginBottom: 12,
        padding: 12,
        borderRadius: 12,
        border: '1px solid rgba(248, 113, 113, 0.45)',
        background: 'rgba(248, 113, 113, 0.12)',
    },
    card: {
        padding: 14,
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'rgba(255,255,255,0.05)',
    },
    navRow: {
        marginBottom: 12,
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: 8,
    },
    counter: {
        fontWeight: 700,
        letterSpacing: 0.4,
        border: '1px solid rgba(255,255,255,0.16)',
        background: 'rgba(255,255,255,0.06)',
        borderRadius: 999,
        padding: '6px 12px',
        textAlign: 'center',
        minWidth: 110,
    },
    arrowBtn: {
        justifySelf: 'center',
        color: '#e8eefc',
        textDecoration: 'none',
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: '8px 12px',
        fontWeight: 700,
        minWidth: 88,
        textAlign: 'center',
    },
    arrowBtnDisabled: {
        justifySelf: 'center',
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.04)',
        color: 'rgba(232, 238, 252, 0.5)',
        borderRadius: 12,
        padding: '8px 12px',
        minWidth: 88,
        textAlign: 'center',
    },
    imageWrap: {
        marginBottom: 12,
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'rgba(0,0,0,0.2)',
    },
    image: {
        width: '100%',
        maxHeight: 340,
        objectFit: 'contain',
        display: 'block',
        background: 'rgba(0,0,0,0.2)',
    },
    imageMissing: {
        marginBottom: 10,
        fontSize: 13,
        opacity: 0.78,
        padding: 8,
        borderRadius: 10,
        border: '1px dashed rgba(255,255,255,0.2)',
    },
    captionText: { fontSize: 17, lineHeight: 1.45 },
    msg: { marginTop: 8, opacity: 0.86 },
    voteRow: { marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' },
    upBtn: {
        border: '1px solid rgba(74, 222, 128, 0.45)',
        background: 'rgba(74, 222, 128, 0.16)',
        color: '#e8eefc',
        padding: '8px 12px',
        borderRadius: 12,
        cursor: 'pointer',
    },
    downBtn: {
        border: '1px solid rgba(248, 113, 113, 0.45)',
        background: 'rgba(248, 113, 113, 0.16)',
        color: '#e8eefc',
        padding: '8px 12px',
        borderRadius: 12,
        cursor: 'pointer',
    },
}
