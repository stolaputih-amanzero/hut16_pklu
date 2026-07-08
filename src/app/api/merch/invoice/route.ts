import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import fs from 'fs'
import path from 'path'
import { MerchInvoicePDF } from '@/components/pdf/MerchInvoicePDF'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getSizeSurcharge, parseOrderItemType } from '@/lib/utils'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl
        const id = searchParams.get('id') || ''

        if (!id) {
            return new NextResponse('ID Pembelian tidak valid.', { status: 400 })
        }

        // Fetch merchandise order details
        const { data: order, error } = await supabaseAdmin
            .from('merch_orders')
            .select('*')
            .eq('id', id)
            .maybeSingle()

        if (error || !order) {
            return new NextResponse('Pembelian tidak ditemukan.', { status: 404 })
        }

        // Ensure order is verified (lunas)
        if (order.payment_status !== 'verified') {
            return new NextResponse(
                'Pembayaran belum diverifikasi oleh admin. Invoice PDF hanya dapat diunduh untuk status pembayaran LUNAS / VERIFIED.', 
                { status: 400 }
            )
        }

        // Fetch products to map base prices and check size details
        const { data: products } = await supabaseAdmin
            .from('merch_products')
            .select('*')

        // Parse items from order item_type string
        const parsedItems = parseOrderItemType(order.item_type)
        const items = parsedItems.map((item) => {
            const matchedProd = products?.find(
                p => p.name.toLowerCase().trim() === item.name.toLowerCase().trim()
            )
            const basePrice = matchedProd ? matchedProd.price : 0
            const surcharge = (matchedProd && matchedProd.has_size) ? getSizeSurcharge(item.size) : 0
            return {
                name: item.name,
                size: item.size,
                quantity: item.quantity,
                price: basePrice + surcharge
            }
        })

        // Fetch logo Base64 for PDF
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

        // Render to Buffer
        const buffer = await renderToBuffer(
            React.createElement(MerchInvoicePDF, {
                order,
                items,
                logoUrl
            }) as any
        )

        const invCode = `Invoice_MB_${order.id.slice(0, 6).toUpperCase()}`

        return new NextResponse(buffer as any, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${invCode}.pdf"`
            }
        })
    } catch (err: any) {
        console.error(err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
