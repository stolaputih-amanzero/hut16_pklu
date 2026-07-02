import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import fs from 'fs'
import path from 'path'
import { ProposalDonaturPDF } from '@/components/pdf/ProposalDonaturPDF'
import { ProposalSponsorPDF } from '@/components/pdf/ProposalSponsorPDF'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs' // wajib untuk @react-pdf/renderer

export async function POST(req: NextRequest) {
    try {
        const { id, lang = 'id' } = await req.json()

        // 1. Ambil data dari DB
        const { data: proposal, error } = await supabaseAdmin
            .from('proposals')
            .select('*, committees(*)')
            .eq('id', id)
            .single()

        if (error || !proposal) {
            return NextResponse.json({ error: 'Proposal tidak ditemukan' }, { status: 404 })
        }

        // 2. Render PDF
        const PDFComponent = proposal.type === 'donatur'
            ? ProposalDonaturPDF
            : ProposalSponsorPDF

        const getBase64Image = (filename: string) => {
            try {
                const fullPath = path.join(process.cwd(), 'public', filename)
                const imageBuffer = fs.readFileSync(fullPath)
                return `data:image/png;base64,${imageBuffer.toString('base64')}`
            } catch (e) {
                return `https://pklu.amanloka.com/${filename}`
            }
        }

        const logoUrl = getBase64Image('logo_hut16_pklu.png')

        const buffer = await renderToBuffer(React.createElement(PDFComponent, { data: proposal, lang, logoUrl, origin: req.nextUrl.origin }) as any)

        // 3. Kembalikan PDF secara langsung
        return new NextResponse(buffer as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Proposal_${proposal.type}_${proposal.number.replace(/\//g, '_')}.pdf"`,
            },
        })
    } catch (err: any) {
        console.error(err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}