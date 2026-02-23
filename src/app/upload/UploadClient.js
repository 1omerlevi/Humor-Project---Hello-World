'use client'

import { useMemo, useState } from 'react'

const ACCEPTED_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
]

function extractCaptionArray(payload) {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.captions)) return payload.captions
    if (Array.isArray(payload?.data)) return payload.data
    if (Array.isArray(payload?.items)) return payload.items
    if (Array.isArray(payload?.captions?.captions)) return payload.captions.captions
    if (Array.isArray(payload?.captions?.data)) return payload.captions.data
    if (Array.isArray(payload?.captions?.items)) return payload.captions.items
    return []
}

function getErrorMessage(payload, fallback = 'Pipeline request failed') {
    if (!payload) return fallback
    if (typeof payload === 'string' && payload.trim()) return payload
    if (typeof payload?.error === 'string' && payload.error.trim()) return payload.error
    if (typeof payload?.message === 'string' && payload.message.trim()) return payload.message
    return fallback
}

export default function UploadClient({ email }) {
    const [file, setFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [progress, setProgress] = useState('')
    const [result, setResult] = useState(null)

    const canSubmit = useMemo(() => !!file && !isSubmitting, [file, isSubmitting])

    async function fetchPipeline(action, body) {
        const res = await fetch('/api/pipeline', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, ...body }),
        })

        const raw = await res.text()
        let payload
        try {
            payload = raw ? JSON.parse(raw) : null
        } catch {
            payload = raw
        }

        return { res, payload }
    }

    function isProcessingLike(status, payload) {
        if (status === 202 && payload?.processing) return true
        if (status === 502 || status === 503 || status === 504) return true
        if (payload === true || payload === 'true') return true
        const err = typeof payload?.error === 'string' ? payload.error.toLowerCase() : ''
        const msg = typeof payload?.message === 'string' ? payload.message.toLowerCase() : ''
        if (err.toLowerCase().includes('processing')) return true
        if (msg.toLowerCase().includes('processing')) return true
        if (err.includes('queued') || msg.includes('queued')) return true
        if (err.includes('timed out') || msg.includes('timed out')) return true
        if (err.includes('gateway timeout') || msg.includes('gateway timeout')) return true
        if (err.includes('cloudfront') || msg.includes('cloudfront')) return true
        if (err.includes('request could not be satisfied') || msg.includes('request could not be satisfied')) return true
        if (err.includes('error inserting captions') || msg.includes('error inserting captions')) return true
        return false
    }

    async function onSubmit(e) {
        e.preventDefault()
        setError('')
        setProgress('')
        setResult(null)

        if (!file) {
            setError('Please choose an image file.')
            return
        }

        if (!ACCEPTED_TYPES.includes(file.type)) {
            setError(`Unsupported file type: ${file.type || 'unknown'}`)
            return
        }

        setIsSubmitting(true)
        try {
            setProgress('Step 1/4: Generating presigned URL...')
            const step1 = await fetchPipeline('presign', { contentType: file.type })
            if (!step1.res.ok) throw new Error(step1.payload?.error || 'Step 1 failed')

            const presignedUrl = step1.payload?.presignedUrl
            const cdnUrl = step1.payload?.cdnUrl
            if (!presignedUrl || !cdnUrl) {
                throw new Error('Step 1 failed: missing presignedUrl/cdnUrl')
            }

            setProgress('Step 2/4: Uploading image bytes...')
            const uploadRes = await fetch(presignedUrl, {
                method: 'PUT',
                headers: { 'Content-Type': file.type },
                body: file,
            })
            if (!uploadRes.ok) {
                throw new Error(`Step 2 failed with HTTP ${uploadRes.status}`)
            }

            setProgress('Step 3/4: Registering uploaded image...')
            const step3 = await fetchPipeline('register', { imageUrl: cdnUrl })
            if (!step3.res.ok) throw new Error(step3.payload?.error || 'Step 3 failed')

            const imageId = step3.payload?.imageId
            if (!imageId) {
                throw new Error('Step 3 failed: missing imageId')
            }

            setProgress('Step 4/4: Triggering caption generation...')
            const step4 = await fetchPipeline('generate', { imageId })

            let captions = step4.res.ok ? extractCaptionArray(step4.payload) : []
            const step4Processing = isProcessingLike(step4.res.status, step4.payload)
            if (!step4.res.ok && !step4Processing) {
                throw new Error(getErrorMessage(step4.payload, 'Step 4 failed'))
            }

            if (!captions.length && step4Processing) {
                const maxAttempts = 12
                for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
                    setProgress(`Step 4/4: Waiting for captions... (attempt ${attempt}/${maxAttempts})`)
                    await new Promise((r) => setTimeout(r, 10000))

                    const poll = await fetchPipeline('poll', { imageId })
                    captions = poll.res.ok ? extractCaptionArray(poll.payload) : []
                    if (captions.length > 0) {
                        break
                    }

                    const pollProcessing = isProcessingLike(poll.res.status, poll.payload)
                    if (!pollProcessing) {
                        throw new Error(getErrorMessage(poll.payload, 'Step 4 polling failed'))
                    }
                }
            }

            if (!captions.length) {
                throw new Error('Caption generation is still processing on staging. Please retry in 30-60 seconds.')
            }

            setResult({
                imageId,
                cdnUrl,
                captions,
                step4Raw: step4.payload,
            })
            setProgress('Done: captions generated.')
        } catch (err) {
            setError(err?.message || 'Unexpected error while running pipeline')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main style={styles.page}>
            <section style={styles.card}>
                <div style={styles.kicker}>Assignment #5</div>
                <h1 style={styles.h1}>Upload Image + Generate Captions</h1>
                <p style={styles.sub}>
                    Signed in as <span style={styles.mono}>{email}</span>
                </p>

                <form onSubmit={onSubmit} style={styles.form}>
                    <label htmlFor="file" style={styles.label}>
                        Choose image
                    </label>
                    <input
                        id="file"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
                        onChange={(e) => {
                            const nextFile = e.target.files?.[0] || null
                            setFile(nextFile)
                            setResult(null)
                            setError('')
                            setProgress('')
                            setPreviewUrl(nextFile ? URL.createObjectURL(nextFile) : '')
                        }}
                        style={styles.input}
                    />

                    <button type="submit" disabled={!canSubmit} style={canSubmit ? styles.btn : styles.btnDisabled}>
                        {isSubmitting ? 'Working...' : 'Upload + Generate'}
                    </button>
                </form>

                {previewUrl ? (
                    <div style={styles.previewWrap}>
                        <div style={styles.previewLabel}>Selected image</div>
                        <img src={previewUrl} alt="Selected upload preview" style={styles.preview} />
                    </div>
                ) : null}

                {progress ? <div style={styles.progress}>{progress}</div> : null}
                {error ? <div style={styles.error}>{error}</div> : null}

                {result ? (
                    <div style={styles.resultWrap}>
                        <div style={styles.resultTitle}>Pipeline result</div>
                        <div style={styles.meta}>imageId: <span style={styles.mono}>{result.imageId}</span></div>
                        <div style={styles.meta}>cdnUrl: <span style={styles.mono}>{result.cdnUrl}</span></div>

                        {result.cdnUrl ? (
                            <div style={styles.previewWrap}>
                                <div style={styles.previewLabel}>Uploaded image (persisted)</div>
                                <img src={result.cdnUrl} alt="Uploaded image" style={styles.preview} />
                            </div>
                        ) : null}

                        <div style={styles.resultTitle}>Generated captions</div>
                        <ul style={styles.list}>
                            {result.captions.map((cap, idx) => (
                                <li key={cap?.id || idx} style={styles.item}>
                                    {cap?.content || cap?.caption || cap?.text || JSON.stringify(cap)}
                                </li>
                            ))}
                        </ul>

                        <div style={styles.resultTitle}>Raw Step 4 response</div>
                        <pre style={styles.raw}>{JSON.stringify(result.step4Raw, null, 2)}</pre>
                    </div>
                ) : null}
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
        display: 'grid',
        placeItems: 'center',
    },
    card: {
        width: 'min(900px, 100%)',
        borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'rgba(255,255,255,0.06)',
        padding: 20,
    },
    kicker: { fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', opacity: 0.75 },
    h1: { margin: '8px 0 0', fontSize: 32 },
    sub: { margin: '8px 0 0', opacity: 0.85 },
    mono: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' },
    form: { marginTop: 16, display: 'grid', gap: 10 },
    label: { fontWeight: 700 },
    input: {
        borderRadius: 12,
        padding: 10,
        border: '1px solid rgba(255,255,255,0.16)',
        background: 'rgba(0,0,0,0.2)',
        color: '#e8eefc',
    },
    btn: {
        borderRadius: 12,
        border: '1px solid rgba(56, 189, 248, 0.5)',
        background: 'rgba(56, 189, 248, 0.2)',
        color: '#e8eefc',
        padding: '10px 14px',
        cursor: 'pointer',
        fontWeight: 700,
    },
    btnDisabled: {
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.2)',
        background: 'rgba(255,255,255,0.08)',
        color: '#a5b4d4',
        padding: '10px 14px',
        cursor: 'not-allowed',
        fontWeight: 700,
    },
    progress: {
        marginTop: 12,
        padding: 12,
        borderRadius: 12,
        border: '1px solid rgba(56, 189, 248, 0.45)',
        background: 'rgba(56, 189, 248, 0.12)',
    },
    error: {
        marginTop: 12,
        padding: 12,
        borderRadius: 12,
        border: '1px solid rgba(248, 113, 113, 0.45)',
        background: 'rgba(248, 113, 113, 0.12)',
    },
    resultWrap: {
        marginTop: 14,
        padding: 12,
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'rgba(255,255,255,0.04)',
        display: 'grid',
        gap: 8,
    },
    resultTitle: { marginTop: 6, fontWeight: 800 },
    previewWrap: {
        marginTop: 10,
        display: 'grid',
        gap: 6,
    },
    previewLabel: {
        fontSize: 12,
        opacity: 0.82,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    preview: {
        width: '100%',
        maxHeight: 360,
        objectFit: 'contain',
        borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(0,0,0,0.2)',
    },
    meta: { opacity: 0.88, wordBreak: 'break-all' },
    list: { margin: 0, paddingLeft: 18, display: 'grid', gap: 8 },
    item: { lineHeight: 1.45 },
    raw: {
        margin: 0,
        padding: 10,
        borderRadius: 10,
        background: 'rgba(0,0,0,0.25)',
        border: '1px solid rgba(255,255,255,0.1)',
        overflowX: 'auto',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
    },
}
