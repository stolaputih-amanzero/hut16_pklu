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
        const buffer = await renderToBuffer(React.createElement(PDFComponent, { data: proposal, lang }) as any)

        const fileName = `${proposal.year}/tokens/${proposal.number}_${lang}.pdf`
        const { error: uploadError } = await supabaseAdmin.storage
            .from('proposals')
            .upload(fileName, buffer, { contentType: 'application/pdf', upsert: true })

        if (uploadError) throw uploadError

        const { data: urlData } = supabaseAdmin.storage.from('proposals').getPublicUrl(fileName)

        await supabaseAdmin
            .from('proposals')
            .update({ token_pdf_url: urlData.publicUrl, updated_at: new Date().toISOString() })
            .eq('id', id)

        return NextResponse.json({ url: urlData.publicUrl })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}