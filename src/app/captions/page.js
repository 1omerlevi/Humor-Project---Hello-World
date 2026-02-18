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
        .select('id,content')
        .order('id', { ascending: true })
        .limit(200)

    const status = (params?.status ?? '').toString()
    const errorMessage = (params?.message ?? '').toString()

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
                    <div style={styles.list}>
                        {captions.map((caption) => (
                            <article key={caption.id} style={styles.card}>
                                <div style={styles.captionText}>{caption.content}</div>
                                <div style={styles.voteRow}>
                                    <form action={submitVote}>
                                        <input type="hidden" name="captionId" value={caption.id} />
                                        <input type="hidden" name="vote" value="1" />
                                        <button type="submit" style={styles.upBtn}>
                                            👍 Upvote
                                        </button>
                                    </form>
                                    <form action={submitVote}>
                                        <input type="hidden" name="captionId" value={caption.id} />
                                        <input type="hidden" name="vote" value="-1" />
                                        <button type="submit" style={styles.downBtn}>
                                            👎 Downvote
                                        </button>
                                    </form>
                                </div>
                            </article>
                        ))}
                    </div>
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
    list: { display: 'grid', gap: 12 },
    card: {
        padding: 14,
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'rgba(255,255,255,0.05)',
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
