import Link from 'next/link'

export default async function Home({ searchParams }) {
    const params = await searchParams
    const adminStatus = (params?.admin ?? '').toString()

    const adminMessage =
        adminStatus === 'forbidden'
            ? 'Admin access denied: your profile is not marked as superadmin.'
            : adminStatus === 'profile_missing'
                ? 'Admin access denied: no profile row found for your auth user.'
                : adminStatus === 'profile_query_error'
                    ? 'Admin access denied: failed to read your profile.'
                    : ''

    return (
        <main style={styles.page}>
            <div style={styles.card}>
                <div style={styles.kicker}>Assignment #2</div>
                <h1 style={styles.h1}>Next.js + Supabase</h1>
                <p style={styles.sub}>
                    Read from an existing Supabase table and render a modern UI.
                </p>

                {adminMessage ? <div style={styles.warn}>{adminMessage}</div> : null}

                <div style={styles.actions}>
                    <Link href="/items" style={styles.primaryBtn}>
                        View University Majors →
                    </Link>
                    <Link href="/captions" style={styles.secondaryBtn}>
                        Rate Captions →
                    </Link>
                    <Link href="/upload" style={styles.secondaryBtn}>
                        Upload + Generate Captions →
                    </Link>
                    <Link href="/admin" style={styles.secondaryBtn}>
                        Admin Panel →
                    </Link>
                    <a href="/auth/logout" style={styles.secondaryBtn}>
                        Logout
                    </a>
                    <a
                        href="https://supabase.com"
                        target="_blank"
                        rel="noreferrer"
                        style={styles.secondaryBtn}
                    >
                        Supabase
                    </a>
                </div>
            </div>
        </main>
    )
}

const styles = {
    page: {
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 20,
        background:
            'radial-gradient(900px 600px at 20% 0%, rgba(120, 119, 198, 0.35), transparent 60%), radial-gradient(900px 600px at 90% 0%, rgba(56, 189, 248, 0.22), transparent 55%), #0b0f19',
        color: '#e8eefc',
        fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
    },
    card: {
        width: 'min(720px, 100%)',
        borderRadius: 22,
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'rgba(255,255,255,0.06)',
        boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
        padding: 22,
    },
    kicker: {
        fontSize: 12,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        opacity: 0.75,
    },
    h1: { margin: '8px 0 0', fontSize: 34, letterSpacing: -0.6 },
    sub: { margin: '10px 0 0', opacity: 0.8, lineHeight: 1.5 },
    warn: {
        marginTop: 12,
        border: '1px solid rgba(248, 113, 113, 0.45)',
        background: 'rgba(248, 113, 113, 0.12)',
        borderRadius: 12,
        padding: '10px 12px',
    },
    actions: { marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' },
    primaryBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 14px',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'rgba(56, 189, 248, 0.18)',
        color: '#e8eefc',
        textDecoration: 'none',
        fontWeight: 800,
    },
    secondaryBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 14px',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(0,0,0,0.18)',
        color: '#e8eefc',
        textDecoration: 'none',
        fontWeight: 700,
        opacity: 0.9,
    },
}
