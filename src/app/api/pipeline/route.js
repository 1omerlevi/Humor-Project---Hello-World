import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BASE_URL = 'https://api.almostcrackd.ai'
export const runtime = 'nodejs'
export const maxDuration = 300
const SUPPORTED_TYPES = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
])

function toErrorResponse(message, status = 400) {
    return NextResponse.json({ error: message }, { status })
}

async function fetchWithTimeout(url, options, timeoutMs) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort('Request timed out'), timeoutMs)
    try {
        return await fetch(url, { ...options, signal: controller.signal, cache: 'no-store' })
    } finally {
        clearTimeout(timer)
    }
}

function extractErrorMessage(value, fallback = 'Pipeline request failed') {
    if (!value) return fallback
    if (typeof value === 'string' && value.trim()) return value
    if (typeof value?.message === 'string' && value.message.trim()) return value.message
    if (typeof value?.error === 'string' && value.error.trim()) return value.error
    return fallback
}

function isTimeoutError(error) {
    const msg = extractErrorMessage(error, '').toLowerCase()
    return (
        error?.name === 'AbortError' ||
        msg.includes('request timed out') ||
        msg.includes('timed out') ||
        msg.includes('aborted')
    )
}

async function getAuth() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized', status: 401 }

    const {
        data: { session },
    } = await supabase.auth.getSession()

    const accessToken = session?.access_token
    if (!accessToken) return { error: 'Missing auth access token', status: 401 }

    return { accessToken }
}

async function proxyPost(path, body, accessToken, timeoutMs = 30000) {
    const res = await fetchWithTimeout(
        `${BASE_URL}${path}`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        },
        timeoutMs
    )

    const raw = await res.text()
    let data
    try {
        data = raw ? JSON.parse(raw) : null
    } catch {
        data = raw
    }

    return { res, data, raw }
}

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

function isProcessingLike(status, data, raw) {
    const msg = extractErrorMessage(data, raw).toLowerCase()
    return (
        status === 202 ||
        status === 429 ||
        status === 502 ||
        status === 503 ||
        status === 504 ||
        data === true ||
        raw === 'true' ||
        (typeof data?.processing === 'boolean' && data.processing === true) ||
        msg.includes('processing') ||
        msg.includes('queued') ||
        msg.includes('still processing') ||
        msg.includes('request timed out')
    )
}

async function runGenerate(imageId, accessToken, timeoutMs = 45000) {
    const { res, data, raw } = await proxyPost(
        '/pipeline/generate-captions',
        { imageId },
        accessToken,
        timeoutMs
    )

    const captions = extractCaptionArray(data)
    if (res.ok && captions.length > 0) {
        return { done: true, captions }
    }

    if (isProcessingLike(res.status, data, raw) || (res.ok && captions.length === 0)) {
        return {
            done: false,
            processing: true,
            message: 'Caption generation is still processing.',
        }
    }

    return {
        done: false,
        processing: false,
        error: extractErrorMessage(data, raw || 'Step 4 failed'),
        status: res.status || 500,
    }
}

export async function POST(request) {
    try {
        const auth = await getAuth()
        if (auth.error) return toErrorResponse(auth.error, auth.status)

        const { accessToken } = auth

        let payload
        try {
            payload = await request.json()
        } catch {
            return toErrorResponse('Invalid JSON body', 400)
        }

        const action = payload?.action

        if (action === 'presign') {
            const contentType = payload?.contentType
            if (!contentType) return toErrorResponse('Missing contentType')
            if (!SUPPORTED_TYPES.has(contentType)) {
                return toErrorResponse(`Unsupported contentType: ${contentType}`, 400)
            }

            const { res, data, raw } = await proxyPost(
                '/pipeline/generate-presigned-url',
                { contentType },
                accessToken,
                30000
            )

            if (!res.ok) return toErrorResponse(extractErrorMessage(data, raw), res.status)
            return NextResponse.json(data)
        }

        if (action === 'register') {
            const imageUrl = payload?.imageUrl
            if (!imageUrl) return toErrorResponse('Missing imageUrl')

            const { res, data, raw } = await proxyPost(
                '/pipeline/upload-image-from-url',
                { imageUrl, isCommonUse: false },
                accessToken,
                30000
            )

            if (!res.ok) return toErrorResponse(extractErrorMessage(data, raw), res.status)
            return NextResponse.json(data)
        }

        if (action === 'generate') {
            const imageId = payload?.imageId
            if (!imageId) return toErrorResponse('Missing imageId')

            try {
                const result = await runGenerate(imageId, accessToken, 45000)

                if (result.done) return NextResponse.json(result.captions)
                if (result.processing) {
                    return NextResponse.json(
                        {
                            processing: true,
                            message: result.message,
                        },
                        { status: 202 }
                    )
                }

                return toErrorResponse(result.error, result.status)
            } catch (err) {
                if (isTimeoutError(err)) {
                    return NextResponse.json(
                        {
                            processing: true,
                            message: 'Caption generation is still processing.',
                        },
                        { status: 202 }
                    )
                }
                return toErrorResponse(extractErrorMessage(err), 500)
            }
        }

        if (action === 'poll') {
            const imageId = payload?.imageId
            if (!imageId) return toErrorResponse('Missing imageId')

            try {
                const result = await runGenerate(imageId, accessToken, 30000)

                if (result.done) return NextResponse.json(result.captions)
                if (result.processing) {
                    return NextResponse.json(
                        {
                            processing: true,
                            message: result.message,
                        },
                        { status: 202 }
                    )
                }

                return toErrorResponse(result.error, result.status)
            } catch (err) {
                if (isTimeoutError(err)) {
                    return NextResponse.json(
                        {
                            processing: true,
                            message: 'Caption generation is still processing.',
                        },
                        { status: 202 }
                    )
                }
                return toErrorResponse(extractErrorMessage(err), 500)
            }
        }

        return toErrorResponse('Unsupported action. Use presign/register/generate/poll.')
    } catch (error) {
        if (isTimeoutError(error)) {
            return NextResponse.json(
                {
                    processing: true,
                    message: 'Caption generation is still processing.',
                },
                { status: 202 }
            )
        }
        return toErrorResponse(extractErrorMessage(error, 'Unexpected pipeline error'), 500)
    }
}
