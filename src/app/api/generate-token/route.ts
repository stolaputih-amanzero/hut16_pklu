import React from 'react'
import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { TandaPenghargaanPDF } from '@/components/pdf/TandaPenghargaanPDF'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs' // wajib untuk @react-pdf/renderer

export async function POST(req: NextRequest) {
    try {
        const { id, lang = 'id' } = await req.json()

        const { data: proposal, error } = await supabaseAdmin
            .from('proposals')
            .select('*, committees(*)')
            .eq('id', id)
            .single()

        if (error || !proposal) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        const PDFComponent = TandaPenghargaanPDF
        const logoUrl = `${req.nextUrl.origin}/logo_hut16_pklu.png`
        
        const buffer = await renderToBuffer(
            React.createElement(PDFComponent, { 
                data: proposal, 
                lang,
                logoUrl,
                origin: req.nextUrl.origin
            }) as any
        )

        // Kembalikan PDF secara langsung
        return new NextResponse(buffer as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="TandaPenghargaan_${proposal.type}_${proposal.number.replace(/\//g, '_')}_${lang}.pdf"`,
            },
        })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}