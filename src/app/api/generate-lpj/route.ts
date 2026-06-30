import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import fs from 'fs'
import path from 'path'
import { LaporanLpjPDF } from '@/components/pdf/LaporanLpjPDF'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
    try {
        const { data: proposals, error } = await supabaseAdmin
            .from('proposals')
            .select('*')
            .eq('payment_status', 'confirmed')
            .order('created_at', { ascending: false })
            
        if (error) throw error

        const totalDanaDonatur = proposals
            .filter(p => p.type === 'donatur')
            .reduce((sum, p) => sum + (Number(p.contribution_value) || 0), 0)
        const totalDanaSponsor = proposals
            .filter(p => p.type === 'sponsorship')
            .reduce((sum, p) => sum + (Number(p.contribution_value) || 0), 0)
        const totalDana = totalDanaDonatur + totalDanaSponsor

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
            React.createElement(LaporanLpjPDF, {
                proposals: proposals || [],
                totalDanaDonatur,
                totalDanaSponsor,
                totalDana,
                logoUrl,
                origin: req.nextUrl.origin
            }) as any
        )
        
        return new NextResponse(buffer as any, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="Laporan_LPJ_HUT16_PKLU.pdf"'
            }
        })
    } catch (err: any) {
        console.error(err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
