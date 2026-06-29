'use server'

import { supabaseAdmin } from './supabase/admin'

export type ProposalType = 'donatur' | 'sponsorship'

const PREFIX_MAP: Record<ProposalType, string> = {
    donatur: 'DON',
    sponsorship: 'SPN',
}

export async function getNextNumber(type: ProposalType, year = 2026): Promise<string> {
    const prefix = PREFIX_MAP[type]

    const { data, error } = await supabaseAdmin.rpc('get_next_number', {
        p_prefix: prefix,
        p_year: year,
    })

    if (error) {
        console.error('Numbering error:', error)
        throw new Error(`Gagal mendapatkan nomor: ${error.message}`)
    }

    // data is in format 'PREFIX-001/2026'. We want to extract '001'
    const rawString = data as string
    const seqMatches = rawString.match(/-(\d+)\//)
    const seq = seqMatches ? seqMatches[1] : '000'

    return `${seq}-${prefix}-HUT16-PKLU-${year}`
}