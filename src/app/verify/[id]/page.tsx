'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { 
    CheckCircle, 
    AlertCircle, 
    ShieldCheck, 
    FileText, 
    User, 
    Calendar, 
    Building, 
    Users,
    ArrowLeft,
    Loader2
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function VerificationPage() {
    const params = useParams()
    const id = params?.id as string

    const [proposal, setProposal] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchProposal = async () => {
            if (!id) return
            try {
                setLoading(true)
                const { data, error: fetchError } = await supabase
                    .from('proposals')
                    .select('*, committees(*)')
                    .eq('id', id)
                    .single()

                if (fetchError) throw fetchError
                setProposal(data)
            } catch (err: any) {
                console.error(err)
                setError(err.message || 'Proposal tidak ditemukan atau ID tidak valid.')
            } finally {
                setLoading(false)
            }
        }

        fetchProposal()
    }, [id])

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr)
            if (isNaN(d.getTime())) return '-'
            return d.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })
        } catch {
            return '-'
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#022c22] flex flex-col items-center justify-center text-[#FDFBF7] px-4">
                <Loader2 className="h-8 w-8 text-[#D4AF37] animate-spin mb-4" />
                <p className="text-sm font-medium tracking-wide text-white/70">Memverifikasi keaslian dokumen...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#022c22] text-[#FDFBF7] relative overflow-hidden flex flex-col justify-between py-10 px-4">
            {/* Background watermarks */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center z-0">
                <ShieldCheck className="w-[500px] h-[500px]" />
            </div>

            <div className="max-w-xl w-full mx-auto z-10 flex-1 flex flex-col justify-center">
                {/* Header Logo & App Title */}
                <div className="text-center mb-8">
                    <h1 className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold mb-1">
                        Sistem Verifikasi Dokumen Digital
                    </h1>
                    <p className="text-xs text-white/50">HUT 16 Pelkat PKLU GPIB Mupel Bekasi</p>
                </div>

                {error || !proposal ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-black/40 backdrop-blur-md rounded-2xl border border-red-500/20 p-8 text-center shadow-2xl"
                    >
                        <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                            <AlertCircle className="h-8 w-8 text-red-400" />
                        </div>
                        <h2 className="text-lg font-bold text-red-400 mb-2">Dokumen Tidak Valid</h2>
                        <p className="text-sm text-white/60 mb-6 leading-relaxed">
                            ID dokumen ini tidak terdaftar dalam database resmi Panitia HUT 16 Pelkat PKLU GPIB Mupel Bekasi. Mohon periksa kembali QR Code Anda.
                        </p>
                        <Link 
                            href="/" 
                            className="inline-flex items-center text-xs font-semibold text-[#D4AF37] hover:underline"
                        >
                            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Kembali ke Beranda
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Status Card */}
                        <div className="bg-black/35 backdrop-blur-md rounded-2xl border border-[#D4AF37]/30 p-6 text-center shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
                            
                            <div className="mx-auto w-16 h-16 rounded-full bg-[#D4AF37]/15 flex items-center justify-center mb-4 border border-[#D4AF37]/35 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                                <ShieldCheck className="h-9 w-9 text-[#D4AF37]" />
                            </div>
                            <h2 className="text-lg font-bold text-[#D4AF37] uppercase tracking-wide">
                                Tanda Tangan Valid & Terverifikasi
                            </h2>
                            <p className="text-xs text-white/60 mt-1">
                                Dokumen ini adalah Proposal Resmi yang sah diterbitkan oleh Panitia.
                            </p>
                        </div>

                        {/* Details Card */}
                        <div className="bg-black/25 backdrop-blur-md rounded-2xl border border-white/5 p-6 shadow-xl space-y-4">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37] border-b border-white/10 pb-2 mb-3">
                                Rincian Proposal
                            </h3>

                            <div className="space-y-3.5">
                                <div className="flex gap-3">
                                    <FileText className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-white/40 text-[10px] uppercase tracking-wide">Nomor Proposal</p>
                                        <p className="text-sm font-semibold tracking-wide text-[#FDFBF7]">{proposal.number}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <User className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-white/40 text-[10px] uppercase tracking-wide">Calon Donatur / Sponsor</p>
                                        <p className="text-sm font-semibold text-[#FDFBF7]">{proposal.name}</p>
                                        {proposal.display_name && proposal.display_name !== proposal.name && (
                                            <p className="text-xs text-white/60 mt-0.5">({proposal.display_name})</p>
                                        )}
                                        {proposal.company_name && (
                                            <p className="text-xs text-white/60 mt-0.5">{proposal.company_name}</p>
                                        )}
                                        {proposal.pic_name && (
                                            <p className="text-xs text-white/50 italic mt-0.5">
                                                U.p. Bpk/Ibu {proposal.pic_name} {proposal.pic_position ? `(${proposal.pic_position})` : ''}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Users className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-white/40 text-[10px] uppercase tracking-wide">Pembawa Proposal</p>
                                        <p className="text-sm font-medium text-[#FDFBF7]">
                                            {proposal.committees?.name || '-'}
                                        </p>
                                        <p className="text-xs text-white/50">{proposal.committees?.role || 'Panitia'}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Calendar className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-white/40 text-[10px] uppercase tracking-wide">Tanggal Diterbitkan</p>
                                        <p className="text-sm font-semibold text-[#FDFBF7]">{formatDate(proposal.created_at)}</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Building className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-white/40 text-[10px] uppercase tracking-wide">Kategori Dokumen</p>
                                        <p className="text-sm font-semibold text-[#FDFBF7] uppercase">
                                            Proposal {proposal.type === 'donatur' ? 'Dukungan Kasih (Donatur)' : 'Kemitraan Sponsorship'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Signers Panel */}
                        <div className="bg-black/15 rounded-2xl border border-white/5 p-5 space-y-3">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-white/40 text-center">
                                Penandatangan Dokumen
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-center pt-2">
                                <div className="p-2 border border-white/5 rounded-lg bg-black/10">
                                    <p className="text-xs font-bold text-[#FDFBF7]">Vrilly Rondonuwu</p>
                                    <p className="text-[9px] text-white/50">Ketua Panitia</p>
                                </div>
                                <div className="p-2 border border-white/5 rounded-lg bg-black/10">
                                    <p className="text-xs font-bold text-[#FDFBF7]">Vevi Mayo</p>
                                    <p className="text-[9px] text-white/50">Sekretaris I</p>
                                </div>
                                <div className="col-span-2 p-2 border border-[#D4AF37]/10 rounded-lg bg-[#D4AF37]/5">
                                    <p className="text-xs font-bold text-[#D4AF37]">Pdt. Daniel J C Lumentut, S.Th., M.M</p>
                                    <p className="text-[9px] text-white/50">Ketua B.P Mupel Bekasi (Mengetahui)</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Footer Copyright */}
            <div className="text-center text-[10px] text-white/30 mt-8 z-10">
                &copy; {new Date().getFullYear()} PKLU GPIB Mupel Bekasi. All Rights Reserved.
            </div>
        </div>
    )
}
