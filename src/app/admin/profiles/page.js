import Link from 'next/link'
import { requireSuperAdmin } from '@/lib/admin/guard'
import { deleteProfile, setProfileSuperAdmin } from './actions'

export const dynamic = 'force-dynamic'

export default async function AdminProfilesPage({ searchParams }) {
    const { supabase } = await requireSuperAdmin()
    const params = await searchParams

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_datetime_utc', { ascending: false })
        .limit(200)

    const status = (params?.status ?? '').toString()
    const message = (params?.message ?? '').toString()

    return (
        <section style={styles.wrap}>
            <div style={styles.topRow}>
                <h2 style={styles.heading}>Manage Profiles</h2>
                <Link href="/admin" style={styles.backBtn}>
                    Back to Dashboard
                </Link>
            </div>

            {status === 'success' ? <div style={styles.ok}>Profile update completed.</div> : null}
            {status === 'error' ? (
                <div style={styles.error}>
                    Profile action failed.
                    {message ? <div style={styles.errorMsg}>{decodeURIComponent(message)}</div> : null}
                </div>
            ) : null}

            {error ? (
                <article style={styles.panel}>
                    <strong>Couldn’t load profiles.</strong>
                    <div style={styles.errorMsg}>{error.message}</div>
                </article>
            ) : !profiles?.length ? (
                <article style={styles.panel}>
                    <strong>No profiles found.</strong>
                </article>
            ) : (
                <div style={styles.tableWrap}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>ID</th>
                                <th style={styles.th}>Superadmin</th>
                                <th style={styles.th}>Created</th>
                                <th style={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {profiles.map((profile) => (
                                <tr key={profile.id}>
                                    <td style={styles.td}>
                                        <span style={styles.mono}>{profile.id}</span>
                                    </td>
                                    <td style={styles.td}>{profile.is_superadmin ? 'true' : 'false'}</td>
                                    <td style={styles.td}>{profile.created_datetime_utc ?? '-'}</td>
                                    <td style={styles.td}>
                                        <div style={styles.actions}>
                                            <form action={setProfileSuperAdmin}>
                                                <input type="hidden" name="profileId" value={profile.id} />
                                                <input
                                                    type="hidden"
                                                    name="value"
                                                    value={profile.is_superadmin ? 'false' : 'true'}
                                                />
                                                <button type="submit" style={styles.btn}>
                                                    {profile.is_superadmin
                                                        ? 'Revoke Superadmin'
                                                        : 'Make Superadmin'}
                                                </button>
                                            </form>

                                            <form action={deleteProfile}>
                                                <input type="hidden" name="profileId" value={profile.id} />
                                                <button type="submit" style={styles.btnDanger}>
                                                    Delete
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
    tableWrap: {
        border: '1px solid rgba(255,255,255,0.14)',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.05)',
        overflowX: 'auto',
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
        textAlign: 'left',
        padding: '10px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.12)',
        fontSize: 12,
        letterSpacing: 1,
        textTransform: 'uppercase',
        opacity: 0.8,
    },
    td: {
        padding: '10px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        verticalAlign: 'top',
    },
    mono: {
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: 12,
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
