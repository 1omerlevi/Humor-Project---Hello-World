import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
    return (
        <main style={styles.page}>
            <div style={styles.bgGlow} />

            <div style={styles.card}>
                <div style={styles.kicker}>Assignment #3</div>
                <h1 style={styles.h1}>Sign in</h1>
                <p style={styles.sub}>
                    Sign in with Google to view the protected majors table.
                </p>

                <div style={styles.actions}>
                    <Link href="/auth/login" style={styles.primaryBtn}>
                        Continue with Google →
                    </Link>
                    <Link href="/" style={styles.navBtnSecondary}>
                        ← Home
                    </Link>
                </div>

                <div style={styles.note}>
                    Redirect URI is <span style={styles.mono}>/auth/callback</span>
                </div>
            </div>
        </main>
    )
}

const styles = {
    page: {
        minHeight: '100vh',
        padding: '28px 16px 48px',
        display: 'grid',
        placeItems: 'center',
        background:
            'radial-gradient(1200px 700px at 20% -10%, rgba(120, 119, 198, 0.35), transparent 60%), radial-gradient(900px 600px at 90% 0%, rgba(56, 189, 248, 0.22), transparent 55%), #0b0f19',
        color: '#e8eefc',
        fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
    },
    bgGlow: {
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        background:
            'radial-gradient(700px 360px at 50% 20%, rgba(255,255,255,0.06), transparent 60%)',
    },
    card: {
        width: 'min(720px, 100%)',
        borderRadius: 22,
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'rgba(255,255,255,0.06)',
        boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
        padding: 22,
        position: 'relative',
        zIndex: 1,
    },
    kicker: {
        fontSize: 12,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        opacity: 0.75,
    },
    h1: { margin: '8px 0 0', fontSize: 34, letterSpacing: -0.6 },
    sub: { margin: '10px 0 0', opacity: 0.8, lineHeight: 1.5 },
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
    navBtnSecondary: {
        color: '#e8eefc',
        textDecoration: 'none',
        padding: '10px 12px',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.10)',
        background: 'rgba(0,0,0,0.18)',
    },
    note: {
        marginTop: 14,
        padding: 12,
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(255,255,255,0.04)',
        opacity: 0.9,
    },
    mono: {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        opacity: 0.9,
    },
}
