import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import fs from 'fs'
import path from 'path'
import { RegistrationsPDF } from '@/components/pdf/RegistrationsPDF'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl
        const categoryFilter = searchParams.get('category') || 'all'
        const searchQuery = searchParams.get('q') || ''

        // Query all registrations from DB
        const { data: allRegs, error } = await supabaseAdmin
            .from('registrations')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error

        let registrations = allRegs || []

        // 1. Calculate general stats (before visual filter application for completeness)
        let totalRegistrations = registrations.length
        let totalHeadcount = 0
        let mandiriCount = 0
        let rombonganCount = 0
        let umumCount = 0
        let tuanRumahCount = 0
        
        const shirtSizes = { S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, Random: 0 }

        registrations.forEach((r) => {
            const qty = r.registration_mode === "Mandiri" ? 1 : ((r.participant_count || 0) + (r.companion_count || 0))
            totalHeadcount += qty

            if (r.registration_mode === "Mandiri") {
                mandiriCount += 1
                const sz = (r.shirt_size || '').toUpperCase()
                if (sz in shirtSizes) {
                    shirtSizes[sz as keyof typeof shirtSizes] += 1
                } else {
                    shirtSizes.Random += 1
                }
            } else {
                rombonganCount += 1
                if (r.shirt_sizes_summary) {
                    Object.entries(r.shirt_sizes_summary).forEach(([sKey, qtyVal]) => {
                        const uKey = sKey.toUpperCase()
                        if (uKey in shirtSizes) {
                            shirtSizes[uKey as keyof typeof shirtSizes] += Number(qtyVal || 0)
                        }
                    })
                }
            }

            if (r.category === "Umum") {
                umumCount += qty
            } else if (r.category === "Tuan Rumah") {
                tuanRumahCount += qty
            }
        })

        // 2. Apply Filters (matching active list)
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            registrations = registrations.filter(r => 
                (r.registration_code && r.registration_code.toLowerCase().includes(q)) ||
                (r.full_name && r.full_name.toLowerCase().includes(q)) ||
                (r.pic_name && r.pic_name.toLowerCase().includes(q)) ||
                (r.church_name && r.church_name.toLowerCase().includes(q))
            )
        }

        if (categoryFilter !== 'all') {
            registrations = registrations.filter(r => r.category === categoryFilter)
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
            React.createElement(RegistrationsPDF, {
                registrations,
                logoUrl,
                origin: req.nextUrl.origin,
                stats: {
                    totalRegistrations,
                    totalHeadcount,
                    mandiriCount,
                    rombonganCount,
                    umumCount,
                    tuanRumahCount,
                    shirtSizes
                }
            }) as any
        )

        return new NextResponse(buffer as any, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="Laporan_Registrasi_HUT16_PKLU.pdf"'
            }
        })
    } catch (err: any) {
        console.error(err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
