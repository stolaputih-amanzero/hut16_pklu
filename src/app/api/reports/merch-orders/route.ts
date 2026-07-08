import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import fs from 'fs'
import path from 'path'
import { MerchOrdersPDF } from '@/components/pdf/MerchOrdersPDF'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getSizeSurcharge, parseOrderItemType } from '@/lib/utils'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl
        const statusFilter = searchParams.get('status') || 'all'
        const searchQuery = searchParams.get('q') || ''

        // Query all merchandise orders
        const { data: allOrders, error } = await supabaseAdmin
            .from('merch_orders')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error

        let orders = allOrders || []

        // Fetch merch products to get base prices and check has_size
        const { data: productsData } = await supabaseAdmin
            .from('merch_products')
            .select('name, price, has_size')

        // Clean up entity names inside items and compute total price dynamically
        orders = orders.map((o) => {
            const parsedItems = parseOrderItemType(o.item_type)
            let calculatedTotalPrice = 0

            parsedItems.forEach((item) => {
                const matchedProd = productsData?.find(
                    p => p.name.toLowerCase().trim() === item.name.toLowerCase().trim()
                )
                if (matchedProd) {
                    const surcharge = matchedProd.has_size ? getSizeSurcharge(item.size) : 0
                    calculatedTotalPrice += (matchedProd.price + surcharge) * item.quantity
                }
            })

            return {
                ...o,
                buyer_name: o.buyer_name?.replaceAll("&amp;", "&"),
                church_city: o.church_city?.replaceAll("&amp;", "&"),
                item_type: o.item_type?.replaceAll("&amp;", "&"),
                total_price: calculatedTotalPrice
            }
        })

        // 1. Calculate stats (before visual filter application for completeness)
        let totalOrders = orders.length
        let totalRevenue = 0
        let verifiedRevenue = 0
        let pendingRevenue = 0
        let rejectedRevenue = 0
        let totalItemsCount = 0

        orders.forEach((o) => {
            const price = Number(o.total_price || 0)
            const qty = Number(o.quantity || 1)
            totalItemsCount += qty
            totalRevenue += price

            if (o.payment_status === 'verified') {
                verifiedRevenue += price
            } else if (o.payment_status === 'rejected') {
                rejectedRevenue += price
            } else {
                pendingRevenue += price
            }
        })

        // 2. Apply Filters (matching active list)
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            orders = orders.filter(o => 
                (o.buyer_name && o.buyer_name.toLowerCase().includes(q)) ||
                (o.church_city && o.church_city.toLowerCase().includes(q)) ||
                (o.item_type && o.item_type.toLowerCase().includes(q)) ||
                (o.order_code && o.order_code.toLowerCase().includes(q))
            )
        }

        if (statusFilter !== 'all') {
            orders = orders.filter(o => {
                if (statusFilter === 'pending') return o.payment_status === 'pending' || !o.payment_status
                return o.payment_status === statusFilter
            })
        }

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
            React.createElement(MerchOrdersPDF, {
                orders,
                logoUrl,
                origin: req.nextUrl.origin,
                stats: {
                    totalOrders,
                    totalRevenue,
                    verifiedRevenue,
                    pendingRevenue,
                    rejectedRevenue,
                    totalItemsCount
                }
            }) as any
        )

        return new NextResponse(buffer as any, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="Laporan_Pesanan_Merchandise_HUT16_PKLU.pdf"'
            }
        })
    } catch (err: any) {
        console.error(err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
