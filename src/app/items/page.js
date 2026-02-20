import Link from 'next/link'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function MajorsPage({ searchParams }) {
    const params = await searchParams
    // ✅ Supabase Auth (gated UI)
    const supabaseAuth = await createClient()
    const {
        data: { user },
    } = await supabaseAuth.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const email = user?.email || 'Unknown'

    const q = (params?.q ?? '').toString().trim()

    let query = supabase
        .from('university_majors')
        .select('id,name')
        .order('id', { ascending: true })
        .limit(200)

    const { data: majors, error } = await query

    const filtered =
        q && majors
            ? majors.filter((m) => (m.name ?? '').toLowerCase().includes(q.toLowerCase()))
            : majors

    return (
        <main style={styles.page}>
            <div style={styles.bgGlow} />

            <header style={styles.header}>
                <div style={styles.headerInner}>
                    <div>
                        <div style={styles.kicker}>Supabase → Next.js</div>
                        <h1 style={styles.h1}>University Majors</h1>
                        <p style={styles.sub}>
                            {error ? '—' : `${filtered?.length ?? 0} majors`} • Table:{' '}
                            <span style={styles.mono}>university_majors</span> • Signed in as{' '}
                            <span style={styles.mono}>{email}</span>
                        </p>
                    </div>

                    <div style={styles.headerRight}>
                        <Link href="/" style={styles.navBtn}>
                            ← Home
                        </Link>
                        <Link href="/captions" style={styles.navBtnSecondary}>
                            Rate Captions
                        </Link>
                        <Link href="/upload" style={styles.navBtnSecondary}>
                            Upload + Generate
                        </Link>
                        <a
                            href="/items"
                            style={styles.navBtnSecondary}
                            title="Reload (helps confirm server rendering)"
                        >
                            Refresh
                        </a>
                        <a href="/auth/logout" style={styles.navBtnSecondary}>
                            Logout
                        </a>
                    </div>
                </div>

                <form style={styles.searchRow}>
                    <div style={styles.searchBox}>
                        <span style={styles.searchIcon}>⌕</span>
                        <input
                            name="q"
                            defaultValue={q}
                            placeholder="Search majors…"
                            style={styles.searchInput}
                        />
                    </div>
                    <button type="submit" style={styles.searchBtn}>
                        Search
                    </button>
                </form>
            </header>

            <section style={styles.content}>
                {error ? (
                    <div style={styles.stateCardError}>
                        <div style={styles.stateTitle}>Couldn’t load majors</div>
                        <div style={styles.stateMsgMono}>{error.message}</div>
                        <div style={styles.stateHint}>
                            Most common causes: (1) RLS policy blocks SELECT, (2) wrong table/column
                            name.
                        </div>
                    </div>
                ) : !filtered?.length ? (
                    <div style={styles.stateCard}>
                        <div style={styles.stateTitle}>No results</div>
                        <div style={styles.stateHint}>
                            {q
                                ? `No majors match “${q}”.`
                                : 'The table returned 0 rows (or RLS is blocking reads).'}
                        </div>
                    </div>
                ) : (
                    <div style={styles.tableCard}>
                        <div style={styles.tableTop}>
                            <div style={styles.tableTitle}>Majors</div>
                            <div style={styles.tableMeta}>
                                Showing <span style={styles.mono}>{filtered.length}</span>
                            </div>
                        </div>

                        <div style={styles.tableWrap}>
                            <table style={styles.table}>
                                <thead style={styles.thead}>
                                <tr>
                                    <th style={{ ...styles.th, width: 120 }}>ID</th>
                                    <th style={styles.th}>Major</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filtered.map((m) => (
                                    <tr key={m.id} style={styles.tr}>
                                        <td style={styles.td}>
                                            <span style={styles.idPill}>{m.id}</span>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.majorName}>{m.name}</div>
                                            <div style={styles.majorSub}>Undergraduate program</div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={styles.tableBottom}>
              <span style={styles.footerText}>
                Data from Supabase • Rendered in Next.js App Router
              </span>
                        </div>
                    </div>
                )}
            </section>
        </main>
    )
}

const styles = {
    page: {
        minHeight: '100vh',
        padding: '28px 16px 48px',
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

    header: {
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backdropFilter: 'blur(10px)',
        background: 'rgba(11, 15, 25, 0.72)',
        borderBottom: '1px solid rgba(255,255,255,0.10)',
        padding: '16px 0 14px',
    },
    headerInner: {
        maxWidth: 980,
        margin: '0 auto',
        padding: '0 6px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 16,
    },
    headerRight: { display: 'flex', gap: 10 },

    kicker: {
        fontSize: 12,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        opacity: 0.75,
    },
    h1: { margin: '4px 0 0', fontSize: 34, letterSpacing: -0.6 },
    sub: { margin: '6px 0 0', opacity: 0.8 },

    navBtn: {
        color: '#cfe0ff',
        textDecoration: 'none',
        padding: '10px 12px',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'rgba(255,255,255,0.06)',
    },
    navBtnSecondary: {
        color: '#e8eefc',
        textDecoration: 'none',
        padding: '10px 12px',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.10)',
        background: 'rgba(0,0,0,0.18)',
    },

    searchRow: {
        maxWidth: 980,
        margin: '12px auto 0',
        padding: '0 6px',
        display: 'flex',
        gap: 10,
    },
    searchBox: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(255,255,255,0.06)',
    },
    searchIcon: { opacity: 0.75, fontSize: 14 },
    searchInput: {
        flex: 1,
        background: 'transparent',
        border: 'none',
        outline: 'none',
        color: '#e8eefc',
        fontSize: 14,
    },
    searchBtn: {
        padding: '10px 14px',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'rgba(56, 189, 248, 0.18)',
        color: '#e8eefc',
        fontWeight: 700,
        cursor: 'pointer',
    },

    content: {
        maxWidth: 980,
        margin: '18px auto 0',
        padding: '0 6px',
    },

    tableCard: {
        borderRadius: 22,
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(255,255,255,0.06)',
        boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
        overflow: 'hidden',
    },
    tableTop: {
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        padding: '16px 16px 10px',
        borderBottom: '1px solid rgba(255,255,255,0.10)',
        background: 'rgba(0,0,0,0.16)',
    },
    tableTitle: { fontSize: 16, fontWeight: 800 },
    tableMeta: { opacity: 0.75, fontSize: 13 },

    tableWrap: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: 0 },

    thead: {},
    th: {
        textAlign: 'left',
        padding: '12px 16px',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
        opacity: 0.75,
        borderBottom: '1px solid rgba(255,255,255,0.10)',
    },

    tr: {},
    td: {
        padding: '14px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        verticalAlign: 'middle',
    },

    idPill: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '5px 10px',
        borderRadius: 999,
        border: '1px solid rgba(255,255,255,0.18)',
        background: 'rgba(255,255,255,0.08)',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: 13,
    },
    majorName: { fontSize: 15, fontWeight: 800, letterSpacing: -0.2 },
    majorSub: { marginTop: 3, fontSize: 12, opacity: 0.7 },

    tableBottom: {
        padding: '12px 16px',
        background: 'rgba(0,0,0,0.14)',
    },
    footerText: { opacity: 0.75, fontSize: 12 },

    stateCard: {
        padding: 18,
        borderRadius: 22,
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(255,255,255,0.06)',
    },
    stateCardError: {
        padding: 18,
        borderRadius: 22,
        border: '1px solid rgba(255,70,70,0.35)',
        background: 'rgba(255,70,70,0.10)',
    },
    stateTitle: { fontWeight: 900, marginBottom: 6, fontSize: 16 },
    stateHint: { opacity: 0.8, fontSize: 13, lineHeight: 1.5 },
    stateMsgMono: {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        opacity: 0.95,
        fontSize: 13,
    },

    mono: {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        opacity: 0.9,
    },
}
