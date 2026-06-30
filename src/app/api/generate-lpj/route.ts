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
        const { data: allProposals, error } = await supabaseAdmin
            .from('proposals')
            .select('*')
            .order('created_at', { ascending: false })
            
        if (error) throw error

        const proposals = allProposals?.filter(p => p.payment_status === 'confirmed') || []

        const totalDanaDonatur = proposals
            .filter(p => p.type === 'donatur')
            .reduce((sum, p) => sum + (Number(p.contribution_value) || 0), 0)
        const totalDanaSponsor = proposals
            .filter(p => p.type === 'sponsorship')
            .reduce((sum, p) => sum + (Number(p.contribution_value) || 0), 0)
        const totalDana = totalDanaDonatur + totalDanaSponsor

        // Compute proposal stats (issued/keluar vs confirmed/isi)
        const donaturKeluar = allProposals?.filter(p => p.type === 'donatur').length || 0
        const donaturIsi = allProposals?.filter(p => p.type === 'donatur' && p.payment_status === 'confirmed').length || 0
        const sponsorKeluar = allProposals?.filter(p => p.type === 'sponsorship').length || 0
        const sponsorIsi = allProposals?.filter(p => p.type === 'sponsorship' && p.payment_status === 'confirmed').length || 0

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
                proposals,
                totalDanaDonatur,
                totalDanaSponsor,
                totalDana,
                logoUrl,
                origin: req.nextUrl.origin,
                stats: {
                    donaturKeluar,
                    donaturIsi,
                    sponsorKeluar,
                    sponsorIsi
                }
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
