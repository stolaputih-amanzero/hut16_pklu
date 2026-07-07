import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import fs from 'fs'
import path from 'path'
import { GuestbookPDF } from '@/components/pdf/GuestbookPDF'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl
        const statusFilter = searchParams.get('status') || 'all'
        const searchQuery = searchParams.get('q') || ''

        // Query all messages from DB
        const { data: allMessages, error } = await supabaseAdmin
            .from('guestbook_messages')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error

        let messages = allMessages || []

        // Helper: decode HTML entities
        const decodeHTMLEntities = (text: string) => {
            if (!text) return ''
            return text
                .replaceAll('&quot;', '"')
                .replaceAll('&#39;', "'")
                .replaceAll('&apos;', "'")
                .replaceAll('&amp;', '&')
                .replaceAll('&lt;', '<')
                .replaceAll('&gt;', '>')
        }

        // 1. Calculate stats (before visual filter application for completeness)
        let totalMessages = messages.length
        let approvedCount = messages.filter(m => m.is_approved).length
        let pendingCount = messages.filter(m => !m.is_approved).length

        // 2. Apply Filters (matching active list)
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            messages = messages.filter(m => 
                (m.name && m.name.toLowerCase().includes(q)) ||
                (m.church_city && m.church_city.toLowerCase().includes(q)) ||
                (m.message && m.message.toLowerCase().includes(q))
            )
        }

        if (statusFilter !== 'all') {
            const isApproved = statusFilter === 'approved'
            messages = messages.filter(m => m.is_approved === isApproved)
        }

        // Decode text inside message records
        messages = messages.map((m) => ({
            ...m,
            name: m.name?.replaceAll("&amp;", "&"),
            church_city: m.church_city?.replaceAll("&amp;", "&"),
            message: decodeHTMLEntities(m.message)
        }))

        // Get Base64 logo for the PDF
        const getBase64Logo = () => {
            try {
                const fullPath = path.join(process.cwd(), 'public', 'logo_hut16_pklu.png')
                const imageBuffer = fs.readFileSync(fullPath)
                return `data:image/png;base64,${imageBuffer.toString('base64')}`
            } catch (e) {
                return `https://pklu.amanloka.com/logo_hut16_pklu.png`
            }
        }

        const logoUrl = getBase64Logo()

        const buffer = await renderToBuffer(
            React.createElement(GuestbookPDF, {
                messages,
                logoUrl,
                origin: req.nextUrl.origin,
                stats: {
                    totalMessages,
                    approvedCount,
                    pendingCount
                }
            }) as any
        )

        return new NextResponse(buffer as any, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="Laporan_Buku_Tamu_HUT16_PKLU.pdf"'
            }
        })
    } catch (err: any) {
        console.error(err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
