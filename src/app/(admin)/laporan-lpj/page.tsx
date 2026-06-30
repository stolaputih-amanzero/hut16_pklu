'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { formatRupiah } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Printer, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function LaporanLPJPage() {
    const [proposals, setProposals] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProposals = async () => {
            const { data } = await supabase
                .from('proposals')
                .select('*')
                .eq('payment_status', 'confirmed')
                .order('created_at', { ascending: true })
            
            setProposals(data || [])
            setLoading(false)
        }
        fetchProposals()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#D4AF37]" />
            </div>
        )
    }

    const donaturList = proposals.filter(p => p.type === 'donatur')
    const sponsorList = proposals.filter(p => p.type === 'sponsorship')

    const totalDanaDonatur = donaturList.reduce((acc, p) => acc + (p.contribution_value || 0), 0)
    const totalDanaSponsor = sponsorList.reduce((acc, p) => acc + (p.contribution_value || 0), 0)
    const totalDana = totalDanaDonatur + totalDanaSponsor

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="bg-[#FDFBF7] min-h-screen text-[#022c22] p-4 md:p-8 rounded-xl shadow-inner print:p-0 print:shadow-none">
            <div className="print:hidden mb-6 flex justify-between items-center">
                <Link href="/daftar-proposal">
                    <Button variant="outline" className="border-[#022c22]/20 text-[#022c22] hover:bg-[#022c22]/5">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                    </Button>
                </Link>
                <Button onClick={handlePrint} className="bg-[#022c22] hover:bg-[#033B2B] text-[#FDFBF7]">
                    <Printer className="mr-2 h-4 w-4" /> Cetak Laporan
                </Button>
            </div>

            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold uppercase tracking-wide font-playfair">Laporan Pertanggungjawaban (LPJ)</h1>
                <h2 className="text-xl font-semibold mt-1">Perolehan Donatur & Sponsorship</h2>
                <p className="text-[#022c22]/70 mt-2 font-medium">HUT ke-16 Pelayanan Kategorial Lanjut Usia (PKLU)</p>
            </div>

            {/* Summary Section */}
            <div className="mb-8 bg-white p-6 rounded-xl border border-[#D4AF37]/30 shadow-sm print:border-none print:shadow-none print:p-0">
                <h3 className="text-lg font-bold border-b-2 border-[#D4AF37] pb-2 mb-4 uppercase tracking-wider">Ringkasan Perolehan Dana</h3>
                <table className="w-full max-w-md text-sm border-collapse">
                    <tbody>
                        <tr>
                            <td className="py-2 font-medium w-1/2">Total Dana Donatur</td>
                            <td className="py-2 font-semibold">: {formatRupiah(totalDanaDonatur)}</td>
                        </tr>
                        <tr>
                            <td className="py-2 font-medium">Total Dana Sponsorship</td>
                            <td className="py-2 font-semibold">: {formatRupiah(totalDanaSponsor)}</td>
                        </tr>
                        <tr className="font-bold text-base border-t-2 border-[#022c22]/10">
                            <td className="py-3">Total Keseluruhan Dana</td>
                            <td className="py-3 text-[#047857]">: {formatRupiah(totalDana)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Details Section */}
            <div className="mb-8">
                <h3 className="text-lg font-bold border-b-2 border-[#D4AF37] pb-2 mb-4 uppercase tracking-wider">Rincian Penerimaan Terkonfirmasi</h3>
                
                <div className="overflow-x-auto rounded-xl border border-[#022c22]/20 print:border-black print:rounded-none">
                    <table className="w-full text-sm border-collapse bg-white">
                        <thead className="bg-[#022c22] text-[#FDFBF7] print:bg-gray-200 print:text-black">
                            <tr>
                                <th className="border border-[#022c22]/20 print:border-black px-4 py-3 text-left font-semibold">No.</th>
                                <th className="border border-[#022c22]/20 print:border-black px-4 py-3 text-left font-semibold">Nomor Proposal</th>
                                <th className="border border-[#022c22]/20 print:border-black px-4 py-3 text-left font-semibold">Tipe</th>
                                <th className="border border-[#022c22]/20 print:border-black px-4 py-3 text-left font-semibold">Nama / Institusi</th>
                                <th className="border border-[#022c22]/20 print:border-black px-4 py-3 text-right font-semibold">Nilai (Rp)</th>
                                <th className="border border-[#022c22]/20 print:border-black px-4 py-3 text-left font-semibold">Bentuk Lainnya</th>
                                <th className="border border-[#022c22]/20 print:border-black px-4 py-3 text-left font-semibold">Dukungan Spesifik</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#022c22]/10 print:divide-black">
                            {proposals.map((p, index) => (
                                <tr key={p.id} className="hover:bg-[#f8f9fa] print:hover:bg-transparent">
                                    <td className="border border-[#022c22]/20 print:border-black px-4 py-3">{index + 1}</td>
                                    <td className="border border-[#022c22]/20 print:border-black px-4 py-3 font-medium">{p.number}</td>
                                    <td className="border border-[#022c22]/20 print:border-black px-4 py-3 capitalize">{p.type}</td>
                                    <td className="border border-[#022c22]/20 print:border-black px-4 py-3">
                                        <div className="font-semibold">{p.name}</div>
                                        {p.company_name && <div className="text-xs text-gray-500 print:text-black">{p.company_name}</div>}
                                    </td>
                                    <td className="border border-[#022c22]/20 print:border-black px-4 py-3 text-right font-medium">
                                        {p.contribution_value ? p.contribution_value.toLocaleString('id-ID') : '-'}
                                    </td>
                                    <td className="border border-[#022c22]/20 print:border-black px-4 py-3">
                                        {p.contribution_form && p.contribution_form !== 'dana' ? (
                                            <span className="capitalize px-2 py-1 bg-[#D4AF37]/20 text-[#022c22] rounded-md text-xs font-semibold print:bg-transparent print:p-0">
                                                {p.contribution_form}
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td className="border border-[#022c22]/20 print:border-black px-4 py-3 text-xs">
                                        {p.specific_support || '-'}
                                    </td>
                                </tr>
                            ))}
                            {proposals.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="border border-[#022c22]/20 print:border-black px-4 py-6 text-center text-gray-500 font-medium">
                                        Belum ada perolehan yang terkonfirmasi lunas.
                                    </td>
                                </tr>
                            )}
                            {proposals.length > 0 && (
                                <tr className="font-bold bg-[#f8f9fa] print:bg-gray-100">
                                    <td colSpan={4} className="border border-[#022c22]/20 print:border-black px-4 py-4 text-right">TOTAL KESELURUHAN DANA:</td>
                                    <td className="border border-[#022c22]/20 print:border-black px-4 py-4 text-right text-base text-[#047857] print:text-black">
                                        {totalDana.toLocaleString('id-ID')}
                                    </td>
                                    <td colSpan={2} className="border border-[#022c22]/20 print:border-black px-4 py-4"></td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-16 flex justify-end print:block print:mt-24">
                <div className="text-center w-64 float-right">
                    <p className="mb-20 text-sm">Mengetahui,</p>
                    <p className="font-bold border-b border-black pb-1 uppercase">Ketua Panitia</p>
                    <p className="text-xs mt-1 text-gray-600 print:text-black">HUT ke-16 PKLU</p>
                </div>
            </div>
        </div>
    )
}
