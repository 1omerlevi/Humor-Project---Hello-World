import Link from 'next/link'
import { requireSuperAdmin } from '@/lib/admin/guard'

export const dynamic = 'force-dynamic'

async function getCount(supabase, table, filter) {
    let query = supabase.from(table).select('*', { count: 'exact', head: true })
    if (filter) query = filter(query)
    const { count, error } = await query
    if (error) return { value: null, error: error.message }
    return { value: count ?? 0, error: null }
}

export default async function AdminDashboardPage() {
    const { supabase } = await requireSuperAdmin()

    const [profiles, superadmins, images, captions, publicCaptions, votes] = await Promise.all([
        getCount(supabase, 'profiles'),
        getCount(supabase, 'profiles', (q) => q.eq('is_superadmin', true)),
        getCount(supabase, 'images'),
        getCount(supabase, 'captions'),
        getCount(supabase, 'captions', (q) => q.eq('is_public', true)),
        getCount(supabase, 'caption_votes'),
    ])

    const cards = [
        { label: 'Profiles', data: profiles },
        { label: 'Superadmins', data: superadmins },
        { label: 'Images', data: images },
        { label: 'Captions', data: captions },
        { label: 'Public Captions', data: publicCaptions },
        { label: 'Caption Votes', data: votes },
    ]

    return (
        <section style={styles.wrap}>
            <div style={styles.topRow}>
                <h2 style={styles.heading}>Dashboard</h2>
                <div style={styles.quickLinks}>
                    <Link href="/admin/profiles" style={styles.quickBtn}>
                        Manage Profiles
                    </Link>
                    <Link href="/admin/images" style={styles.quickBtn}>
                        Manage Images
                    </Link>
                    <Link href="/admin/captions" style={styles.quickBtn}>
                        Manage Captions
                    </Link>
                </div>
            </div>

            <div style={styles.grid}>
                {cards.map((card) => (
                    <article key={card.label} style={styles.card}>
                        <div style={styles.label}>{card.label}</div>
                        {card.data.error ? (
                            <div style={styles.errorText}>{card.data.error}</div>
                        ) : (
                            <div style={styles.value}>{card.data.value}</div>
                        )}
                    </article>
                ))}
            </div>

            <article style={styles.note}>
                <h3 style={styles.noteTitle}>Admin scope</h3>
                <p style={styles.noteBody}>
                    All routes in <code>/admin</code> are protected by login + superadmin checks.
                    Data operations still respect existing Supabase RLS policies.
                </p>
            </article>
        </section>
    )
}

const styles = {
    wrap: {
        display: 'grid',
        gap: 12,
    },
    topRow: {
        border: '1px solid rgba(255,255,255,0.14)',
        borderRadius: 16,
        background: 'rgba(255,255,255,0.05)',
        padding: 14,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap',
    },
    heading: { margin: 0, fontSize: 26 },
    quickLinks: { display: 'flex', gap: 8, flexWrap: 'wrap' },
    quickBtn: {
        textDecoration: 'none',
        color: '#ecf2ff',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 12,
        padding: '8px 10px',
        background: 'rgba(56, 189, 248, 0.14)',
        fontWeight: 700,
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 10,
    },
    card: {
        border: '1px solid rgba(255,255,255,0.14)',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.05)',
        padding: 14,
    },
    label: { opacity: 0.82, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
    value: { marginTop: 6, fontSize: 28, fontWeight: 800 },
    errorText: {
        marginTop: 8,
        color: '#fecaca',
        fontSize: 13,
        wordBreak: 'break-word',
    },
    note: {
        border: '1px solid rgba(255,255,255,0.14)',
        borderRadius: 14,
        background: 'rgba(0,0,0,0.18)',
        padding: 14,
    },
    noteTitle: { margin: 0, fontSize: 18 },
    noteBody: { marginTop: 8, opacity: 0.9 },
}
