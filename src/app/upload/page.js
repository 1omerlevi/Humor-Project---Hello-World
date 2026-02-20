import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import UploadClient from './UploadClient'

export const dynamic = 'force-dynamic'

export default async function UploadPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <>
            <div style={styles.topNav}>
                <Link href="/" style={styles.navBtn}>
                    Home
                </Link>
                <Link href="/items" style={styles.navBtn}>
                    Majors
                </Link>
                <Link href="/captions" style={styles.navBtn}>
                    Rate Captions
                </Link>
                <a href="/auth/logout" style={styles.navBtn}>
                    Logout
                </a>
            </div>
            <UploadClient email={user.email || 'Unknown'} />
        </>
    )
}

const styles = {
    topNav: {
        position: 'fixed',
        top: 10,
        right: 12,
        zIndex: 20,
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
    },
    navBtn: {
        color: '#e8eefc',
        textDecoration: 'none',
        padding: '8px 11px',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'rgba(11, 15, 25, 0.7)',
        backdropFilter: 'blur(8px)',
    },
}
