import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import fs from 'fs'
import path from 'path'
import { CheckInReportPDF } from '@/components/pdf/CheckInReportPDF'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
    try {
        // Query all checked in registrations
        const { data: regs, error } = await supabaseAdmin
            .from('registrations')
            .select('*')
            .eq('checked_in', true)
            .order('checked_in_at', { ascending: false })

        if (error) throw error

        const registrations = regs || []

        // Calculate statistics
        let totalRegistrations = registrations.length
        let totalHeadcount = 0
        let totalPeserta = 0
        let totalPendamping = 0
        let umum = 0
        let tuanRumah = 0

        registrations.forEach((r) => {
            const p = r.checked_in_participants || 0
            const c = r.checked_in_companions || 0
            const qty = p + c
            totalHeadcount += qty
            totalPeserta += p
            totalPendamping += c

            if (r.category === 'Umum') {
                umum += qty
            } else {
                tuanRumah += qty
            }
        })

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
            React.createElement(CheckInReportPDF, {
                registrations,
                logoUrl,
                origin: req.nextUrl.origin,
                stats: {
                    totalRegistrations,
                    totalHeadcount,
                    totalPeserta,
                    totalPendamping,
                    umum,
                    tuanRumah
                }
            }) as any
        )

        return new NextResponse(buffer as any, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="Laporan_Kehadiran_HUT16_PKLU.pdf"'
            }
        })
    } catch (err: any) {
        console.error("API checkin report error:", err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
