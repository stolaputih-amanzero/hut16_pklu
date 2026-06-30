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
    Download
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
        phone: '',
        email: '',
        congregation: '',
        language: 'id',
        committee_id: ''
    })

    const [committees, setCommittees] = useState<any[]>([])
    const [isGenerating, setIsGenerating] = useState(false)
    
    // State for Success View
    const [proposalId, setProposalId] = useState('')
    const [proposalNumber, setProposalNumber] = useState('')
    const [proposalPdfUrl, setProposalPdfUrl] = useState('')
    const [isSuccess, setIsSuccess] = useState(false)

    useEffect(() => {
        const fetchCommittees = async () => {
            const { data: comms } = await supabase
                .from('committees')
                .select('*')
                .eq('is_active', true)
                .order('name', { ascending: true })
            if (comms) setCommittees(comms)
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
            phone: '',
            email: '',
            congregation: ''
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

            // 1. Dapatkan nomor urut otomatis
            const number = await getNextNumber(proposalType, 2026)
            setProposalNumber(number)

            // 2. Simpan ke database (status pending, nilai kosong karena ini tahap pertama)
            const { data: proposal, error: saveError } = await supabase
                .from('proposals')
                .insert({
                    type: proposalType,
                    number: number,
                    name: formData.name,
                    display_name: formData.display_name || formData.name,
                    company_name: formData.company_name || null,
                    phone: formData.phone,
                    email: formData.email || null,
                    congregation: formData.congregation || null,
                    lang: formData.language,
                    payment_status: 'pending',
                    committee_id: formData.committee_id
                })
                .select()
                .single()

            if (saveError) throw saveError

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
            body: JSON.stringify({ id, lang })
        })
        const result = await response.json()
        if (result.error) throw new Error(result.error)
        return result.url
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
                
                <Button 
                    variant="outline" 
                    className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#022c22] group transition-all"
                    onClick={() => router.push('/daftar-proposal')}
                >
                    <ArchiveIcon className="w-4 h-4 mr-2" />
                    Lihat Daftar Proposal
                    <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
                </Button>
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
                        <Card className="bg-[#022c22]/50 border-[#D4AF37]/30 backdrop-blur-sm shadow-xl">
                            <CardHeader className="border-b border-[#D4AF37]/20 bg-[#D4AF37]/5 rounded-t-lg">
                                <CardTitle className="text-[#D4AF37] flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                                        1
                                    </div>
                                    Pengaturan Global
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Type Selection */}
                                <div className="space-y-3">
                                    <Label className="text-[#FDFBF7]">Tipe Proposal</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setProposalType('donatur')}
                                            className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 ${
                                                proposalType === 'donatur' 
                                                ? 'bg-[#D4AF37] border-[#D4AF37] text-[#022c22] shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                                                : 'bg-transparent border-[#D4AF37]/30 text-[#A0AEC0] hover:border-[#D4AF37]/70 hover:text-[#FDFBF7]'
                                            }`}
                                        >
                                            <Heart className="w-6 h-6" />
                                            <span className="font-semibold text-sm">Donatur Pribadi</span>
                                        </button>
                                        <button
                                            onClick={() => setProposalType('sponsorship')}
                                            className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 ${
                                                proposalType === 'sponsorship' 
                                                ? 'bg-[#D4AF37] border-[#D4AF37] text-[#022c22] shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                                                : 'bg-transparent border-[#D4AF37]/30 text-[#A0AEC0] hover:border-[#D4AF37]/70 hover:text-[#FDFBF7]'
                                            }`}
                                        >
                                            <Users className="w-6 h-6" />
                                            <span className="font-semibold text-sm">Sponsorship Institusi</span>
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="space-y-6">
                                    {/* Language Selection */}
                                    <div className="space-y-3">
                                        <Label className="text-[#FDFBF7]">Bahasa Proposal</Label>
                                        <div className="flex bg-[#011a14] p-1 rounded-lg border border-[#D4AF37]/20">
                                            <button
                                                onClick={() => setFormData({ ...formData, language: 'id' })}
                                                className={`flex-1 py-2 text-sm rounded-md transition-all ${
                                                    formData.language === 'id' ? 'bg-[#D4AF37] text-[#022c22] font-semibold' : 'text-[#A0AEC0] hover:text-[#FDFBF7]'
                                                }`}
                                            >
                                                Indonesia (ID)
                                            </button>
                                            <button
                                                onClick={() => setFormData({ ...formData, language: 'en' })}
                                                className={`flex-1 py-2 text-sm rounded-md transition-all ${
                                                    formData.language === 'en' ? 'bg-[#D4AF37] text-[#022c22] font-semibold' : 'text-[#A0AEC0] hover:text-[#FDFBF7]'
                                                }`}
                                            >
                                                English (EN)
                                            </button>
                                        </div>
                                    </div>

                                    {/* PIC Selection */}
                                    <div className="space-y-3">
                                        <Label className="text-[#FDFBF7]">Panitia Penanggung Jawab (PIC) <span className="text-red-400">*</span></Label>
                                        <SearchableSelect
                                            options={committees.map(c => ({ value: c.id, label: c.name }))}
                                            value={formData.committee_id}
                                            onChange={(val) => setFormData(prev => ({ ...prev, committee_id: val }))}
                                            placeholder="Pilih nama panitia..."
                                            disabled={committees.length === 0}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* TARGET INFORMATION */}
                        <Card className="bg-[#022c22]/50 border-[#D4AF37]/30 backdrop-blur-sm shadow-xl relative overflow-hidden">
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
                                        <Label className="text-[#FDFBF7]">Nama Lengkap (Sesuai Identitas) <span className="text-red-400">*</span></Label>
                                        <Input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Cth: Bapak Budi Santoso"
                                            className="bg-[#011a14]/50 border-[#D4AF37]/30 focus:border-[#D4AF37] text-[#FDFBF7] placeholder:text-[#A0AEC0]/50"
                                        />
                                    </div>
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
                                </div>

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
                                        Generate Proposal {proposalType === 'donatur' ? 'Donatur' : 'Sponsorship'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function ArchiveIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="5" x="2" y="4" rx="1" />
      <path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9" />
      <path d="M10 13h4" />
    </svg>
  )
}