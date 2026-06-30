'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { 
    CheckCircle, 
    ShieldCheck, 
    FileText, 
    Calendar, 
    TrendingUp, 
    DollarSign, 
    ArrowLeft,
    Loader2,
    Download
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { formatRupiah } from '@/lib/utils'

export default function LaporanLpjPublicPage() {
    const [proposals, setProposals] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchLpjData = async () => {
            try {
                setLoading(true)
                const { data, error: fetchError } = await supabase
                    .from('proposals')
                    .select('*')
                    .eq('payment_status', 'confirmed')
                    .order('created_at', { ascending: false })

                if (fetchError) throw fetchError
                setProposals(data || [])
            } catch (err: any) {
                console.error(err)
                setError(err.message || 'Gagal memuat data laporan.')
            } finally {
                setLoading(false)
            }
        }

        fetchLpjData()
    }, [])

    const totalDanaDonatur = proposals
        .filter(p => p.type === 'donatur')
        .reduce((sum, p) => sum + (Number(p.contribution_value) || 0), 0)
    const totalDanaSponsor = proposals
        .filter(p => p.type === 'sponsorship')
        .reduce((sum, p) => sum + (Number(p.contribution_value) || 0), 0)
    const totalDana = totalDanaDonatur + totalDanaSponsor

    const currentDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })

    if (loading) {
        return (
            <div className="min-h-screen bg-[#022c22] flex flex-col items-center justify-center text-[#FDFBF7] px-4">
                <Loader2 className="h-8 w-8 text-[#D4AF37] animate-spin mb-4" />
                <p className="text-sm font-medium tracking-wide text-white/70">Memuat Laporan Pertanggungjawaban...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#022c22] text-[#FDFBF7] relative overflow-hidden flex flex-col justify-between py-10 px-4">
            {/* Background watermarks */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none flex items-center justify-center z-0">
                <ShieldCheck className="w-[600px] h-[600px]" />
            </div>

            <div className="max-w-4xl w-full mx-auto z-10 flex-1 flex flex-col justify-center">
                {/* Header Logo & App Title */}
                <div className="text-center mb-6">
                    <h1 className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold mb-1">
                        Sistem Verifikasi Dokumen Digital
                    </h1>
                    <p className="text-xs text-white/50">HUT 16 Pelkat PKLU GPIB Mupel Bekasi</p>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Status Card */}
                    <div className="bg-black/35 backdrop-blur-md rounded-2xl border border-emerald-500/20 p-6 text-center shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
                        
                        <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 border border-emerald-500/35 text-emerald-400 bg-emerald-500/15 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                            <CheckCircle className="h-9 w-9" />
                        </div>
                        <h2 className="text-base font-bold uppercase tracking-wide text-emerald-400">
                            LAPORAN LPJ SAH & TERVERIFIKASI
                        </h2>
                        <p className="text-xs text-white/70 mt-2 max-w-md mx-auto leading-relaxed">
                            Dokumen ini adalah data real-time penerimaan donasi terkonfirmasi yang sah dalam database Panitia HUT 16 Pelkat PKLU GPIB.
                        </p>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-black/25 backdrop-blur-md rounded-2xl border border-white/5 p-6 shadow-xl space-y-6">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37] border-b border-white/10 pb-2">
                            Ringkasan Perolehan Dana
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-4 bg-[#022c22]/50 rounded-xl border border-white/5 space-y-1">
                                <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Total Dana Donatur</span>
                                <p className="text-lg font-bold text-[#FDFBF7]">{formatRupiah(totalDanaDonatur)}</p>
                            </div>
                            <div className="p-4 bg-[#022c22]/50 rounded-xl border border-white/5 space-y-1">
                                <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Total Dana Sponsorship</span>
                                <p className="text-lg font-bold text-[#FDFBF7]">{formatRupiah(totalDanaSponsor)}</p>
                            </div>
                            <div className="p-4 bg-[#022c22]/50 rounded-xl border border-[#D4AF37]/20 space-y-1 bg-[#D4AF37]/5">
                                <span className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-semibold">Total Keseluruhan Dana</span>
                                <p className="text-xl font-black text-amber-400">{formatRupiah(totalDana)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Details Table Card */}
                    <div className="bg-black/25 backdrop-blur-md rounded-2xl border border-white/5 p-6 shadow-xl space-y-4">
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                                Rincian Penerimaan Terkonfirmasi
                            </h3>
                            <span className="text-[10px] text-white/40 font-mono">{proposals.length} Transaksi</span>
                        </div>

                        {proposals.length === 0 ? (
                            <p className="text-xs text-white/40 text-center py-6">Belum ada perolehan yang terkonfirmasi lunas.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="text-[#D4AF37] border-b border-white/5">
                                            <th className="py-2.5 font-semibold">No. Proposal</th>
                                            <th className="py-2.5 font-semibold">Nama / Institusi</th>
                                            <th className="py-2.5 font-semibold">Tipe</th>
                                            <th className="py-2.5 font-semibold text-right">Nilai (Rp)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-white/80">
                                        {proposals.map((p) => (
                                            <tr key={p.id} className="hover:bg-white/5 transition-colors">
                                                <td className="py-2.5 font-mono text-[11px] text-white/60">{p.number}</td>
                                                <td className="py-2.5 font-semibold">
                                                    <div>{p.name}</div>
                                                    {p.company_name && <div className="text-[10px] text-white/40 font-normal">{p.company_name}</div>}
                                                </td>
                                                <td className="py-2.5">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${p.type === 'sponsorship' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                                        {p.type === 'sponsorship' ? 'Sponsor' : 'Donatur'}
                                                    </span>
                                                </td>
                                                <td className="py-2.5 text-right font-semibold font-mono text-[#FDFBF7]">
                                                    {p.contribution_value ? p.contribution_value.toLocaleString('id-ID') : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Actions Panel */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-black/15 rounded-2xl border border-white/5 p-5">
                        <div className="flex items-center gap-2.5 text-xs text-white/60">
                            <Calendar className="h-4 w-4 text-[#D4AF37]" />
                            <span>Data per: {currentDate}</span>
                        </div>
                        <a
                            href="/api/generate-lpj"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#D4AF37]/80 text-[#022c22] font-semibold text-sm px-6 py-2.5 rounded-full transition-all shadow-lg hover:shadow-[#D4AF37]/25"
                        >
                            <Download className="h-4 w-4" />
                            Unduh PDF LPJ Resmi
                        </a>
                    </div>
                </motion.div>
            </div>

            {/* Footer Copyright */}
            <div className="text-center text-[10px] text-white/30 mt-8 z-10 flex flex-col items-center gap-2">
                <div>&copy; {new Date().getFullYear()} PKLU GPIB Mupel Bekasi. All Rights Reserved.</div>
                <Link href="/" className="text-[#D4AF37] hover:underline">Kembali ke Beranda</Link>
            </div>
        </div>
    )
}
