import React from 'react'
import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { CommitmentPDF } from '@/components/pdf/CommitmentPDF'
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
        const logoUrl = `${req.nextUrl.origin}/logo_hut16_pklu.png`
        const gpibLogoUrl = `${req.nextUrl.origin}/logo_gpib.png`

        const buffer = await renderToBuffer(React.createElement(CommitmentPDF, { data: proposal, lang, logoUrl, gpibLogoUrl, origin: req.nextUrl.origin }) as any)

        // 3. Upload ke Supabase Storage
        const fileName = `${proposal.year}/${proposal.type}/${proposal.number}_commitment_${lang}.pdf`
        const { error: uploadError } = await supabaseAdmin.storage
            .from('proposals')
            .upload(fileName, buffer, {
                contentType: 'application/pdf',
                upsert: true,
            })

        if (uploadError) throw uploadError

        // 4. Dapatkan public URL
        const { data: urlData } = supabaseAdmin.storage
            .from('proposals')
            .getPublicUrl(fileName)

        // 5. Update record
        await supabaseAdmin
            .from('proposals')
            .update({ commitment_pdf_url: urlData.publicUrl, updated_at: new Date().toISOString() })
            .eq('id', id)

        return NextResponse.json({ url: urlData.publicUrl, number: proposal.number })
    } catch (err: any) {
        console.error(err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
