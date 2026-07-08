import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import fs from 'fs'
import path from 'path'
import { MerchCollectionReportPDF } from '@/components/pdf/MerchCollectionReportPDF'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
    try {
        // Query all collected merchandise orders
        const { data: collectedOrders, error } = await supabaseAdmin
            .from('merch_orders')
            .select('*')
            .eq('merch_collected', true)
            .order('collected_at', { ascending: false })

        if (error) throw error

        const orders = collectedOrders || []

        // Calculate statistics
        let orderCount = orders.length
        let itemCount = 0

        orders.forEach((o) => {
            itemCount += (o.quantity || 1)
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
            React.createElement(MerchCollectionReportPDF, {
                orders,
                logoUrl,
                origin: req.nextUrl.origin,
                stats: {
                    orderCount,
                    itemCount
                }
            }) as any
        )

        return new NextResponse(buffer as any, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="Laporan_Pengambilan_Merch_HUT16_PKLU.pdf"'
            }
        })
    } catch (err: any) {
        console.error("API merch collected report error:", err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
