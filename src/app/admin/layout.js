import Link from 'next/link'
import { requireSuperAdmin } from '@/lib/admin/guard'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }) {
    const { user } = await requireSuperAdmin()

    return (
        <main style={styles.page}>
            <header style={styles.header}>
                <div style={styles.headerTop}>
                    <div>
                        <div style={styles.kicker}>Admin Area</div>
                        <h1 style={styles.title}>Humor Project Admin</h1>
                        <p style={styles.sub}>
                            Signed in as <span style={styles.mono}>{user.email || 'Unknown'}</span>
                        </p>
                    </div>
                    <a href="/auth/logout" style={styles.logout}>
                        Logout
                    </a>
                </div>

                <nav style={styles.nav}>
                    <Link href="/" style={styles.navBtn}>
                        Home
                    </Link>
                    <Link href="/admin" style={styles.navBtn}>
                        Dashboard
                    </Link>
                    <Link href="/admin/profiles" style={styles.navBtn}>
                        Profiles
                    </Link>
                    <Link href="/admin/images" style={styles.navBtn}>
                        Images
                    </Link>
                    <Link href="/admin/captions" style={styles.navBtn}>
                        Captions
                    </Link>
                </nav>
            </header>

            <section style={styles.content}>{children}</section>
        </main>
    )
}

const styles = {
    page: {
        minHeight: '100vh',
        padding: '22px 16px 40px',
        background:
            'radial-gradient(1000px 650px at 15% -8%, rgba(240, 90, 40, 0.2), transparent 60%), radial-gradient(800px 560px at 95% 0%, rgba(56, 189, 248, 0.18), transparent 58%), #0a1020',
        color: '#ecf2ff',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
    },
    header: {
        maxWidth: 1120,
        margin: '0 auto',
        border: '1px solid rgba(255,255,255,0.14)',
        borderRadius: 18,
        background: 'rgba(255,255,255,0.06)',
        padding: 16,
    },
    headerTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
    },
    kicker: {
        textTransform: 'uppercase',
        fontSize: 12,
        letterSpacing: 1.1,
        opacity: 0.75,
    },
    title: {
        margin: '6px 0 0',
        fontSize: 30,
        letterSpacing: -0.5,
    },
    sub: {
        margin: '6px 0 0',
        opacity: 0.85,
    },
    mono: {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    },
    logout: {
        color: '#ecf2ff',
        textDecoration: 'none',
        padding: '9px 12px',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.16)',
        background: 'rgba(255,255,255,0.07)',
        whiteSpace: 'nowrap',
    },
    nav: {
        marginTop: 14,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
    },
    navBtn: {
        color: '#ecf2ff',
        textDecoration: 'none',
        padding: '9px 12px',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.16)',
        background: 'rgba(0,0,0,0.2)',
        fontWeight: 600,
    },
    content: {
        maxWidth: 1120,
        margin: '14px auto 0',
    },
}
