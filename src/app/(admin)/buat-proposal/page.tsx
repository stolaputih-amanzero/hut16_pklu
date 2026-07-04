'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
    Heart,
    Users,
    Send,
    Loader2,
    FileText,
    ArrowRight,
    Building2,
    CheckCircle,
    Download,
    FileSpreadsheet,
    HelpCircle,
    X,
    Info
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getNextNumber } from '@/lib/numbering'
import { buildWhatsAppLink } from '@/lib/whatsapp'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { SearchableSelect } from '@/components/ui/searchable-select'

export default function BuatProposalPage() {
    const router = useRouter()
    const [proposalType, setProposalType] = useState<'donatur' | 'sponsorship'>('donatur')
    
    const [formData, setFormData] = useState({
        name: '',
        display_name: '',
        company_name: '',
        pic_name: '',
        pic_position: '',
        phone: '',
        email: '',
        congregation: '',
        language: 'id',
        committee_id: '',
        proposal_date: new Date().toISOString().split('T')[0]
    })

    const [committees, setCommittees] = useState<any[]>([])
    const [isGenerating, setIsGenerating] = useState(false)
    
    // State for Success View
    const [proposalId, setProposalId] = useState('')
    const [proposalNumber, setProposalNumber] = useState('')
    const [proposalPdfUrl, setProposalPdfUrl] = useState('')
    const [isSuccess, setIsSuccess] = useState(false)
    const [isGuideOpen, setIsGuideOpen] = useState(false)

    useEffect(() => {
        const fetchCommittees = async () => {
            try {
                const { data: comms, error } = await supabase
                    .from('committees')
                    .select('*')
                    .eq('is_active', true)
                    .order('name', { ascending: true })
                if (error) console.error('Error fetching committees:', error)
                if (comms) setCommittees(comms)
            } catch (error: any) {
                console.error('Unexpected error fetching committees:', error)
            }
        }
        fetchCommittees()
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const resetForm = () => {
        setFormData(prev => ({
            ...prev,
            name: '',
            display_name: '',
            company_name: '',
            pic_name: '',
            pic_position: '',
            phone: '',
            email: '',
            congregation: '',
            proposal_date: new Date().toISOString().split('T')[0]
        }))
        setIsSuccess(false)
        setProposalId('')
        setProposalNumber('')
        setProposalPdfUrl('')
    }

    const handleGenerateProposal = async () => {
        if (!formData.name || !formData.phone || !formData.committee_id) {
            toast.error('Silakan lengkapi data wajib (Nama, WhatsApp, dan Panitia Penanggung Jawab)')
            return
        }

        try {
            setIsGenerating(true)

            let success = false
            let retries = 5
            let number = ''
            let saveError = null
            let proposal = null

            while (retries > 0 && !success) {
                // 1. Dapatkan nomor urut otomatis
                number = await getNextNumber(proposalType, 2026)

                // 2. Simpan ke database (status pending, nilai kosong karena ini tahap pertama)
                const { data, error } = await supabase
                    .from('proposals')
                    .insert({
                        type: proposalType,
                        number: number,
                        name: formData.name,
                        display_name: proposalType === 'donatur' ? (formData.display_name || formData.name) : null,
                        company_name: formData.company_name || null,
                        pic_name: proposalType === 'sponsorship' ? (formData.pic_name || null) : null,
                        pic_position: proposalType === 'sponsorship' ? (formData.pic_position || null) : null,
                        phone: formData.phone,
                        email: formData.email || null,
                        congregation: proposalType === 'donatur' ? (formData.congregation || null) : null,
                        lang: formData.language,
                        payment_status: 'pending',
                        committee_id: formData.committee_id,
                        proposal_date: formData.proposal_date
                    })
                    .select()
                    .single()

                if (!error) {
                    success = true
                    proposal = data
                    setProposalNumber(number)
                } else if (error.code === '23505') {
                    // Unique constraint violation (concurrency collision), retry with next number
                    retries--
                    saveError = error
                    await new Promise(resolve => setTimeout(resolve, 100))
                } else {
                    // Other database errors, fail immediately
                    throw error
                }
            }

            if (!success || !proposal) {
                throw new Error(`Gagal mengunci nomor proposal: ${saveError?.message || 'Kesalahan tidak diketahui'}`)
            }

            setProposalId(proposal.id)
            
            // 3. Generate PDF proposal via API
            const pdfUrl = await generateProposalPDF(proposal.id, formData.language)
            setProposalPdfUrl(pdfUrl)
            
            setIsSuccess(true)
            toast.success(`Proposal ${proposalType === 'donatur' ? 'Donatur' : 'Sponsorship'} berhasil dibuat! Nomor: ` + number)

        } catch (error: any) {
            toast.error('Gagal membuat proposal: ' + error.message)
        } finally {
            setIsGenerating(false)
        }
    }

    const generateProposalPDF = async (id: string, lang: string) => {
        const response = await fetch('/api/generate-proposal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, lang })
        })
        if (!response.ok) {
            const errResult = await response.json().catch(() => ({}))
            throw new Error(errResult.error || 'Gagal menghasilkan PDF')
        }
        const blob = await response.blob()
        return URL.createObjectURL(blob)
    }

    const handleDownload = async (url: string, filename: string) => {
        try {
            toast.loading('Menyiapkan file unduhan...', { id: 'download' })
            const response = await fetch(url)
            const blob = await response.blob()
            const blobUrl = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = blobUrl
            a.download = filename
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(blobUrl)
            toast.success('Berhasil mengunduh proposal', { id: 'download' })
        } catch (error) {
            toast.error('Gagal mengunduh PDF, membuka di tab baru', { id: 'download' })
            window.open(url, '_blank')
        }
    }

    const sendProposalViaWA = () => {
        if (!proposalPdfUrl) return
        
        const waLink = buildWhatsAppLink(
            formData.phone,
            'proposal',
            formData.language as 'id' | 'en',
            {
                number: proposalNumber,
                name: formData.name,
                type: proposalType,
                pdfUrl: proposalPdfUrl
            }
        )
        window.open(waLink, '_blank', 'noopener,noreferrer')
        toast.success('Membuka WhatsApp...')
    }

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] to-[#FDFBF7]">
                        Pembuatan Proposal Baru
                    </h1>
                    <p className="text-[#A0AEC0] mt-2">Pusat pembuatan dokumen Proposal Donatur dan Sponsorship</p>
                </div>
                <div className="flex flex-col gap-2 w-full md:w-auto items-end">
                    <button
                        type="button"
                        className="w-full md:w-56 h-10 rounded-md border border-[#D4AF37]/50 text-[#D4AF37] bg-[#D4AF37]/5 hover:bg-[#D4AF37] hover:text-[#022c22] font-bold tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer text-sm shadow-[0_0_10px_rgba(212,175,55,0.05)] hover:shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                        style={{
                            animation: 'soft-blink 2s infinite ease-in-out',
                        }}
                        onClick={() => setIsGuideOpen(true)}
                    >
                        <HelpCircle className="w-4 h-4 transition-colors" />
                        Panduan Pembuatan

                        <style>{`
                            @keyframes soft-blink {
                                0%, 100% {
                                    border-color: rgba(212, 175, 55, 0.4);
                                    box-shadow: 0 0 10px rgba(212, 175, 55, 0.05);
                                }
                                50% {
                                    border-color: rgba(212, 175, 55, 1);
                                    box-shadow: 0 0 15px rgba(212, 175, 55, 0.35);
                                }
                            }
                        `}</style>
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {isSuccess ? (
                    <motion.div 
                        key="success"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <Card className="bg-[#022c22]/50 border-[#D4AF37]/30 backdrop-blur-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-[#D4AF37]/20 via-transparent to-transparent p-6 text-center">
                                <CheckCircle className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-[#FDFBF7] mb-2">Proposal Berhasil Dibuat!</h2>
                                <p className="text-[#D4AF37] font-mono text-lg">{proposalNumber}</p>
                                <p className="text-[#FDFBF7] font-semibold mt-1.5 text-sm tracking-wide capitalize">{formData.name}</p>
                            </div>
                            <CardContent className="p-6">
                                <div className="bg-[#022c22] rounded-lg p-4 border border-[#D4AF37]/20 mb-6 flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 space-y-2">
                                        <div className="text-sm text-[#A0AEC0]">Tipe Proposal</div>
                                        <div className="font-semibold text-[#FDFBF7] capitalize">{proposalType}</div>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="text-sm text-[#A0AEC0]">Nama Target</div>
                                        <div className="font-semibold text-[#FDFBF7]">{formData.name}</div>
                                    </div>
                                    {formData.company_name && (
                                        <div className="flex-1 space-y-2">
                                            <div className="text-sm text-[#A0AEC0]">Perusahaan / Instansi</div>
                                            <div className="font-semibold text-[#FDFBF7]">{formData.company_name}</div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button
                                        onClick={() => handleDownload(proposalPdfUrl, `Proposal_${proposalType}_${proposalNumber.replace(/\//g, '_')}.pdf`)}
                                        className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#022c22] flex-1 py-6 text-lg shadow-lg hover:shadow-[#D4AF37]/25"
                                        disabled={!proposalPdfUrl}
                                    >
                                        <Download className="mr-2 h-5 w-5" />
                                        Download PDF
                                    </Button>
                                    <Button
                                        onClick={sendProposalViaWA}
                                        className="bg-[#25D366] hover:bg-[#128C7E] text-white flex-1 py-6 text-lg shadow-lg hover:shadow-[#25D366]/25"
                                        disabled={!proposalPdfUrl}
                                    >
                                        <Send className="mr-2 h-5 w-5" />
                                        Kirim via WhatsApp
                                    </Button>
                                </div>
                                
                                <div className="mt-6 p-4 bg-black/25 rounded-lg border border-[#D4AF37]/15 text-left space-y-2 max-w-xl mx-auto">
                                    <h4 className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                                        <Info className="w-3.5 h-3.5" />
                                        Alur Pengiriman Dokumen
                                    </h4>
                                    <div className="space-y-1.5 text-[11px] text-[#A0AEC0] leading-relaxed">
                                        <div className="flex gap-2">
                                            <span className="text-[#D4AF37] font-semibold">1.</span>
                                            <p>Unduh berkas proposal dengan mengeklik tombol <strong className="text-[#FDFBF7]">Download PDF</strong>.</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-[#D4AF37] font-semibold">2.</span>
                                            <p>Setelah berhasil terunduh, klik tombol <strong className="text-[#FDFBF7]">Kirim via WhatsApp</strong> untuk otomatis membuka WhatsApp beserta isi pesan pengantar.</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-[#D4AF37] font-semibold">3.</span>
                                            <p>Pada chat WhatsApp yang terbuka, klik ikon lampiran <strong className="text-[#FDFBF7]">(clip kertas / tambah +)</strong>, pilih <strong className="text-[#FDFBF7]">Dokumen</strong>, lalu lampirkan file PDF proposal yang baru Anda unduh.</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-[#D4AF37] font-semibold">4.</span>
                                            <p>Kirim pesan dan lampiran proposal tersebut secara bersamaan.</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-8 text-center">
                                    <Button variant="ghost" className="text-[#A0AEC0] hover:text-[#FDFBF7]" onClick={resetForm}>
                                        + Buat Proposal Lainnya
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-6"
                    >
                        {/* GLOBAL CHOICES */}
                        <Card className="bg-[#022c22]/50 border-[#D4AF37]/30 backdrop-blur-sm shadow-xl relative z-20 overflow-visible">
                            <CardHeader className="border-b border-[#D4AF37]/20 bg-[#D4AF37]/5 rounded-t-lg">
                                <CardTitle className="text-[#D4AF37] flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-sm">
                                        1
                                    </div>
                                    Pengaturan Global
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Tipe Proposal (Baris Pertama) */}
                                <div className="space-y-2 md:col-span-3">
                                    <Label className="text-[#FDFBF7] text-xs font-semibold uppercase tracking-wider">Tipe Proposal</Label>
                                    <div className="flex bg-[#011a14] p-1 rounded-lg border border-[#D4AF37]/20 h-11 w-full">
                                        <button
                                            type="button"
                                            onClick={() => setProposalType('donatur')}
                                            className={`flex-1 text-sm rounded-md transition-all font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                                                proposalType === 'donatur' 
                                                ? 'bg-[#D4AF37] text-[#022c22] shadow-[0_0_8px_rgba(212,175,55,0.25)]' 
                                                : 'text-[#A0AEC0] hover:text-[#D4AF37]'
                                            }`}
                                        >
                                            <Heart className="w-4 h-4" />
                                            Donatur
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setProposalType('sponsorship')}
                                            className={`flex-1 text-sm rounded-md transition-all font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                                                proposalType === 'sponsorship' 
                                                ? 'bg-[#D4AF37] text-[#022c22] shadow-[0_0_8px_rgba(212,175,55,0.25)]' 
                                                : 'text-[#A0AEC0] hover:text-[#D4AF37]'
                                            }`}
                                        >
                                            <Users className="w-4 h-4" />
                                            Sponsorship
                                        </button>
                                    </div>
                                </div>

                                {/* Bahasa Proposal */}
                                <div className="space-y-2 md:col-span-1">
                                    <Label className="text-[#FDFBF7] text-xs font-semibold uppercase tracking-wider">Bahasa</Label>
                                    <div className="flex bg-[#011a14] p-1 rounded-lg border border-[#D4AF37]/20 h-11">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, language: 'id' })}
                                            className={`flex-1 text-sm rounded-md transition-all font-semibold cursor-pointer ${
                                                formData.language === 'id' ? 'bg-[#D4AF37] text-[#022c22]' : 'text-[#A0AEC0] hover:text-[#FDFBF7]'
                                            }`}
                                        >
                                            ID
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, language: 'en' })}
                                            className={`flex-1 text-sm rounded-md transition-all font-semibold cursor-pointer ${
                                                formData.language === 'en' ? 'bg-[#D4AF37] text-[#022c22]' : 'text-[#A0AEC0] hover:text-[#FDFBF7]'
                                            }`}
                                        >
                                            EN
                                        </button>
                                    </div>
                                </div>

                                {/* PIC Selection */}
                                <div className="space-y-2 md:col-span-1">
                                    <Label className="text-[#FDFBF7] text-xs font-semibold uppercase tracking-wider">
                                        PIC Panitia <span className="text-red-400">*</span>
                                    </Label>
                                    <SearchableSelect
                                        options={committees.map(c => ({ value: c.id, label: c.name }))}
                                        value={formData.committee_id}
                                        onChange={(val) => setFormData(prev => ({ ...prev, committee_id: val }))}
                                        placeholder="Pilih nama..."
                                        disabled={committees.length === 0}
                                    />
                                </div>

                                {/* Proposal Date */}
                                <div className="space-y-2 md:col-span-1">
                                    <Label className="text-[#FDFBF7] text-xs font-semibold uppercase tracking-wider">Tanggal</Label>
                                    <Input
                                        type="date"
                                        name="proposal_date"
                                        value={formData.proposal_date}
                                        onChange={handleInputChange}
                                        className="bg-[#011a14]/50 border-[#D4AF37]/30 focus:border-[#D4AF37] text-[#FDFBF7] [color-scheme:dark] h-11 text-sm"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* TARGET INFORMATION */}
                        <Card className="bg-[#022c22]/50 border-[#D4AF37]/30 backdrop-blur-sm shadow-xl relative z-10 overflow-visible">
                            {/* Ambient gradient behind the form */}
                            <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-20 -z-10 transition-colors duration-1000 ${proposalType === 'donatur' ? 'bg-pink-500' : 'bg-blue-500'}`} />
                            
                            <CardHeader className="border-b border-[#D4AF37]/20 bg-[#D4AF37]/5 rounded-t-lg">
                                <CardTitle className="text-[#D4AF37] flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                                        2
                                    </div>
                                    Informasi Target Dukungan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[#FDFBF7]">
                                            {proposalType === 'donatur' ? 'Nama Lengkap Donatur (Sesuai Identitas)' : 'Nama Sponsor / Perusahaan / Lembaga'} <span className="text-red-400">*</span>
                                        </Label>
                                        <Input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder={proposalType === 'donatur' ? 'Cth: Bapak Budi Santoso' : 'Cth: PT. Bank Mandiri'}
                                            className="bg-[#011a14]/50 border-[#D4AF37]/30 focus:border-[#D4AF37] text-[#FDFBF7] placeholder:text-[#A0AEC0]/50"
                                        />
                                    </div>
                                    {proposalType === 'donatur' ? (
                                        <div className="space-y-2">
                                            <Label className="text-[#FDFBF7]">Nama Tercantum (Di Buku Acara)</Label>
                                            <Input
                                                name="display_name"
                                                value={formData.display_name}
                                                onChange={handleInputChange}
                                                placeholder="Kosongkan jika sama dengan nama lengkap"
                                                className="bg-[#011a14]/50 border-[#D4AF37]/30 focus:border-[#D4AF37] text-[#FDFBF7] placeholder:text-[#A0AEC0]/50"
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Label className="text-[#FDFBF7]">Nama Penanggung Jawab (PIC)</Label>
                                            <Input
                                                name="pic_name"
                                                value={formData.pic_name}
                                                onChange={handleInputChange}
                                                placeholder="Cth: Ibu Rina Wijaya"
                                                className="bg-[#011a14]/50 border-[#D4AF37]/30 focus:border-[#D4AF37] text-[#FDFBF7] placeholder:text-[#A0AEC0]/50"
                                            />
                                        </div>
                                    )}
                                </div>

                                {proposalType === 'donatur' ? (
                                    <div className="space-y-2">
                                        <Label className="text-[#FDFBF7] flex items-center gap-2">
                                            Nama Perusahaan / Instansi
                                            <span className="text-xs font-normal text-[#A0AEC0]">(Opsional - Untuk Pencantuman Gelar/Posisi)</span>
                                        </Label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0AEC0]" />
                                            <Input
                                                name="company_name"
                                                value={formData.company_name}
                                                onChange={handleInputChange}
                                                placeholder="Cth: PT. Maju Bersama / Direktur Keuangan"
                                                className="bg-[#011a14]/50 border-[#D4AF37]/30 focus:border-[#D4AF37] text-[#FDFBF7] placeholder:text-[#A0AEC0]/50 pl-10"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label className="text-[#FDFBF7]">Jabatan PIC</Label>
                                        <Input
                                            name="pic_position"
                                            value={formData.pic_position}
                                            onChange={handleInputChange}
                                            placeholder="Cth: Manager CSR / Humas"
                                            className="bg-[#011a14]/50 border-[#D4AF37]/30 focus:border-[#D4AF37] text-[#FDFBF7] placeholder:text-[#A0AEC0]/50"
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[#FDFBF7]">Nomor WhatsApp <span className="text-red-400">*</span></Label>
                                        <Input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="Cth: 08123456789"
                                            className="bg-[#011a14]/50 border-[#D4AF37]/30 focus:border-[#D4AF37] text-[#FDFBF7] placeholder:text-[#A0AEC0]/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[#FDFBF7]">Email</Label>
                                        <Input
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="Cth: budi@email.com"
                                            className="bg-[#011a14]/50 border-[#D4AF37]/30 focus:border-[#D4AF37] text-[#FDFBF7] placeholder:text-[#A0AEC0]/50"
                                        />
                                    </div>
                                </div>
                                
                                {proposalType === 'donatur' && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-2 overflow-hidden"
                                    >
                                        <Label className="text-[#FDFBF7]">Asal Jemaat (Khusus Warga GPIB)</Label>
                                        <Input
                                            name="congregation"
                                            value={formData.congregation}
                                            onChange={handleInputChange}
                                            placeholder="Cth: GPIB Menara Kasih"
                                            className="bg-[#011a14]/50 border-[#D4AF37]/30 focus:border-[#D4AF37] text-[#FDFBF7] placeholder:text-[#A0AEC0]/50"
                                        />
                                    </motion.div>
                                )}
                            </CardContent>
                        </Card>

                        {/* GENERATE BUTTON */}
                        <div className="pt-4 flex justify-end">
                            <Button
                                onClick={handleGenerateProposal}
                                disabled={isGenerating}
                                className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#022c22] px-8 py-6 rounded-xl text-lg font-bold shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_25px_rgba(212,175,55,0.5)] transition-all flex items-center w-full md:w-auto"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                        Sedang Membuat...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="w-5 h-5 mr-3" />
                                        Generate Proposal
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <ProposalGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
        </div>
    )
}

function ProposalGuideModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.95, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.95, y: 20, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                        className="bg-[#022c22] border border-[#D4AF37]/35 rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative z-10"
                    >
                        {/* Accent Glow */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-[#D4AF37] to-emerald-500" />
                        
                        {/* Modal Header */}
                        <div className="p-5 border-b border-[#D4AF37]/20 flex items-center justify-between bg-black/25">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/15 flex items-center justify-center">
                                    <HelpCircle className="w-4 h-4 text-[#D4AF37]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#FDFBF7] text-base font-playfair tracking-wide">
                                        Panduan Pembuatan Proposal
                                    </h3>
                                    <p className="text-[10px] text-[#D4AF37]/80">Alur kerja sistem proposal HUT ke-16 PKLU</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-lg text-[#A0AEC0] hover:text-[#FDFBF7] hover:bg-white/5 transition-all cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Donatur Card */}
                                <div className="bg-black/20 border border-[#D4AF37]/15 rounded-xl p-4 space-y-2">
                                    <div className="flex items-center gap-2 text-[#D4AF37]">
                                        <Heart className="w-4 h-4 text-[#D4AF37]" />
                                        <span className="font-bold text-xs uppercase tracking-wider">1. Tipe Donatur</span>
                                    </div>
                                    <p className="text-[11px] text-[#A0AEC0] leading-relaxed">
                                        Ditujukan untuk perorangan, jemaat, keluarga, atau donatur pribadi. Format proposal lebih kasual, fokus pada dukungan sukarela dan kebersamaan pelayanan.
                                    </p>
                                    <ul className="text-[10px] text-[#A0AEC0]/85 list-disc list-inside space-y-1">
                                        <li>Nama donatur tercantum di Buku Acara</li>
                                        <li>Informasi asal jemaat GPIB (opsional)</li>
                                    </ul>
                                </div>

                                {/* Sponsorship Card */}
                                <div className="bg-black/20 border border-[#D4AF37]/15 rounded-xl p-4 space-y-2">
                                    <div className="flex items-center gap-2 text-[#D4AF37]">
                                        <Users className="w-4 h-4 text-[#D4AF37]" />
                                        <span className="font-bold text-xs uppercase tracking-wider">2. Tipe Sponsorship</span>
                                    </div>
                                    <p className="text-[11px] text-[#A0AEC0] leading-relaxed">
                                        Ditujukan untuk instansi komersial, perusahaan, atau organisasi. Mengedepankan kerja sama promosi timbal balik dan kontrak bernilai komitmen tertentu.
                                    </p>
                                    <ul className="text-[10px] text-[#A0AEC0]/85 list-disc list-inside space-y-1">
                                        <li>Wajib mencantumkan Nama PIC instansi</li>
                                        <li>Wajib mengisi Jabatan PIC instansi</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Flow Steps */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-xs text-[#FDFBF7] uppercase tracking-widest border-b border-[#D4AF37]/15 pb-1">
                                    Langkah Pembuatan & Pengiriman:
                                </h4>
                                
                                <div className="space-y-3 text-xs">
                                    <div className="flex gap-3">
                                        <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center font-bold text-[10px] shrink-0">
                                            A
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-semibold text-[#FDFBF7]">Atur Pengaturan Global</p>
                                            <p className="text-[11px] text-[#A0AEC0]">
                                                Pilih jenis proposal, atur bahasa (ID/EN), pilih Panitia yang bertanggung jawab sebagai kontak rujukan, serta atur tanggal proposal.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center font-bold text-[10px] shrink-0">
                                            B
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-semibold text-[#FDFBF7]">Input Data Target & WhatsApp</p>
                                            <p className="text-[11px] text-[#A0AEC0]">
                                                Masukkan identitas calon pendukung dengan benar. Pastikan Nomor WhatsApp aktif (format nomor lokal Indonesia).
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center font-bold text-[10px] shrink-0">
                                            C
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-semibold text-[#FDFBF7]">Generate PDF & Kirimkan</p>
                                            <p className="text-[11px] text-[#A0AEC0]">
                                                Klik tombol generate. Sistem akan mengunci nomor proposal unik dan membuat PDF secara instan. Anda dapat langsung mengunduh PDF atau menekan "Kirim via WhatsApp" untuk mengirim proposal disertai tautan dan pesan pengantar otomatis.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-[#D4AF37]/15 flex justify-end bg-black/25">
                            <Button
                                type="button"
                                onClick={onClose}
                                className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#022c22] font-semibold text-xs rounded-lg px-4 h-9 cursor-pointer"
                            >
                                Saya Mengerti
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}