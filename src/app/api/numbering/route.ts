import { NextResponse } from 'next/server'
import { getNextNumber } from '@/lib/numbering'

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') as 'donatur' | 'sponsorship' | null
    const year = parseInt(searchParams.get('year') || '2026')

    if (!type || !['donatur', 'sponsorship'].includes(type)) {
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }

    try {
        const number = await getNextNumber(type, year)
        return NextResponse.json({ number })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}