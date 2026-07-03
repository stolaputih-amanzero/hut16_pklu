const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'app', 'api', 'generate-lpj', 'route.ts');

const newContent = `import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import fs from 'fs'
import path from 'path'
import { LaporanLpjPDF } from '@/components/pdf/LaporanLpjPDF'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl
        const statusFilter = searchParams.get('status') || 'all'
        const searchQuery = searchParams.get('q') || ''

        const { data: allProposals, error } = await supabaseAdmin
            .from('proposals')
            .select('*')
            .order('created_at', { ascending: false })
            
        if (error) throw error

        let proposals = allProposals || []

        // 1. Stats calculation (Always based on ALL proposals before filtering)
        const computeStats = (type: string) => {
            const typeProposals = proposals.filter(p => p.type === type)
            
            const requestTotal = typeProposals.filter(p => p.specific_support === 'request').length
            
            // Active requests: request, pending, no value, no form
            const activeRequests = typeProposals.filter(p => 
                p.specific_support === 'request' && 
                p.payment_status === 'pending' && 
                !p.contribution_value && 
                !p.contribution_form
            ).length

            const requestFollowedUp = requestTotal - activeRequests

            // Non-request proposals
            const nonRequest = typeProposals.filter(p => p.specific_support !== 'request')
            
            const diterbitkan = nonRequest.filter(p => 
                p.payment_status === 'pending' && !p.contribution_value && !p.contribution_form
            ).length

            const komitmen = nonRequest.filter(p => 
                p.payment_status === 'pending' && (p.contribution_value > 0 || p.contribution_form)
            ).length

            const lunas = nonRequest.filter(p => p.payment_status === 'confirmed').length

            return {
                diterbitkan,
                komitmen,
                lunas,
                requestTotal,
                requestFollowedUp
            }
        }

        const stats = {
            donatur: computeStats('donatur'),
            sponsor: computeStats('sponsorship')
        }

        // 2. Apply Filters for the Lists
        if (searchQuery) {
            proposals = proposals.filter(p => 
                p.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.company_name && p.company_name.toLowerCase().includes(searchQuery.toLowerCase()))
            )
        }

        if (statusFilter !== 'all') {
            proposals = proposals.filter(p => {
                const isLunas = p.payment_status === 'confirmed'
                const isBatal = p.payment_status === 'cancelled'
                const isRequest = p.specific_support === 'request'
                const isKomitmen = p.payment_status === 'pending' && !isRequest && (p.contribution_value > 0 || p.contribution_form)
                const isTerkirim = p.payment_status === 'pending' && !isRequest && !p.contribution_value && !p.contribution_form

                if (statusFilter === 'request') return isRequest
                if (statusFilter === 'terkirim') return isTerkirim
                if (statusFilter === 'komitmen') return isKomitmen
                if (statusFilter === 'lunas') return isLunas
                if (statusFilter === 'batal') return isBatal
                return true
            })
        }

        // 3. Separate into categories
        const donaturProposals = proposals.filter(p => p.type === 'donatur' && p.specific_support !== 'request')
        const sponsorProposals = proposals.filter(p => p.type === 'sponsorship' && p.specific_support !== 'request')
        const requestProposals = proposals.filter(p => p.specific_support === 'request')

        const totalDanaDonatur = donaturProposals
            .reduce((sum, p) => sum + ((p.payment_status === 'confirmed' ? Number(p.contribution_value) : 0) || 0), 0)
        const totalDanaSponsor = sponsorProposals
            .reduce((sum, p) => sum + ((p.payment_status === 'confirmed' ? Number(p.contribution_value) : 0) || 0), 0)
        const totalDana = totalDanaDonatur + totalDanaSponsor

        const getBase64Logo = () => {
            try {
                const fullPath = path.join(process.cwd(), 'public', 'logo_hut16_pklu.png')
                const imageBuffer = fs.readFileSync(fullPath)
                return \`data:image/png;base64,\${imageBuffer.toString('base64')}\`
            } catch (e) {
                return \`https://pklu.amanloka.com/logo_hut16_pklu.png\`
            }
        }

        const logoUrl = getBase64Logo()

        const buffer = await renderToBuffer(
            React.createElement(LaporanLpjPDF, {
                donaturProposals,
                sponsorProposals,
                requestProposals,
                totalDanaDonatur,
                totalDanaSponsor,
                totalDana,
                logoUrl,
                origin: req.nextUrl.origin,
                stats
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
`;

fs.writeFileSync(filePath, newContent);
console.log("Updated route.ts successfully.");
