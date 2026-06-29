'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
    DollarSign,
    CheckCircle,
    Send,
    Loader2
} from 'lucide-react'
import { motion } from 'framer-motion'
import { getNextNumber } from '@/lib/numbering'
import { buildWhatsAppLink } from '@/lib/whatsapp'
import { toast } from 'sonner'

import { SearchableSelect } from '@/components/ui/searchable-select'

export default function ProposalSponsorshipPage() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        congregation: '',
        contribution_value: '',
        message: '',
        language: 'id',
        payment_status: 'pending',
        committee_id: ''
    })

    const [loading, setLoading] = useState(false)
    const [proposalNumber, setProposalNumber] = useState('')
    const [proposalId, setProposalId] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [isConfirmed, setIsConfirmed] = useState(false)
    const [tokenUrl, setTokenUrl] = useState('')
    const [proposalPdfUrl, setProposalPdfUrl] = useState('')

    const [committees, setCommittees] = useState<any[]>([])
    const [pendingProposals, setPendingProposals] = useState<any[]>([])
    const [selectedVerificationId, setSelectedVerificationId] = useState('')

    useEffect(() => {
        const fetchData = async () => {
            // Fetch active committees
            const { data: comms } = await supabase
                .from('committees')
                .select('*')
                .eq('is_active', true)
                .order('name', { ascending: true })
            if (comms) setCommittees(comms)

            // Fetch pending sponsorship proposals
            const { data: pends } = await supabase
                .from('proposals')
                .select('*')
                .eq('type', 'sponsorship')
                .eq('payment_status', 'pending')
                .order('number', { ascending: false })
            if (pends) setPendingProposals(pends)
        }
        fetchData()
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '')
        setFormData({ ...formData, [e.target.name]: rawValue })
    }

    const handleGenerateProposal = async () => {
        if (!formData.name || !formData.phone || !formData.contribution_value || !formData.committee_id) {
            toast.error('Silakan lengkapi data yang diperlukan, termasuk Panitia Penanggung Jawab')
            return
        }

        try {
            setIsGenerating(true)

            // 1. Dapatkan nomor urut otomatis
            const number = await getNextNumber('sponsorship', 2026)
            setProposalNumber(number)

            // 2. Simpan ke database
            const { data: proposal, error: saveError } = await supabase
                .from('proposals')
                .insert({
                    type: 'sponsorship',
                    number: number,
                    name: formData.name,
                    display_name: formData.name,
                    phone: formData.phone,
                    congregation: formData.congregation,
                    contribution_value: Number(formData.contribution_value),
                    message: formData.message,
                    lang: formData.language,
                    payment_status: 'pending',
                    committee_id: formData.committee_id
                })
                .select()
                .single()

            if (saveError) throw saveError

            setProposalId(proposal.id)
            toast.success('Proposal berhasil dibuat! Nomor: ' + number)

            // 3. Generate PDF proposal
            const pdfUrl = await generateProposalPDF(proposal.id)
            setProposalPdfUrl(pdfUrl)
        } catch (error: any) {
            toast.error('Gagal membuat proposal: ' + error.message)
        } finally {
            setIsGenerating(false)
        }
    }

    const generateProposalPDF = async (id: string) => {
        try {
            const response = await fetch('/api/generate-proposal', {
                method: 'POST',
                body: JSON.stringify({ id, lang: formData.language })
            })

            const result = await response.json()

            if (result.error) {
                throw new Error(result.error)
            }

            toast.success('PDF proposal berhasil dibuat')
            return result.url
        } catch (error) {
            toast.error('Gagal menghasilkan PDF proposal')
            throw error
        }
    }

    const sendProposalViaWA = async () => {
        if (!proposalId || !proposalNumber) {
            toast.error('Proposal belum dibuat')
            return
        }

        try {
            setIsSending(true)

            // Get proposal data
            const { data: proposal, error } = await supabase
                .from('proposals')
                .select('*')
                .eq('id', proposalId)
                .single()

            if (error) throw error

            // Build WhatsApp message
            const waLink = buildWhatsAppLink(
                proposal.phone,
                'proposal',
                formData.language as 'id' | 'en',
                {
                    number: proposal.number,
                    name: proposal.name,
                    type: 'sponsorship',
                    pdfUrl: proposal.proposal_pdf_url
                }
            )

            // Open WhatsApp
            window.open(waLink, '_blank', 'noopener,noreferrer')
            toast.success('Pesan WhatsApp terbuka')
        } catch (error) {
            toast.error('Gagal membuka WhatsApp')
        } finally {
            setIsSending(false)
        }
    }

    const confirmPayment = async () => {
        if (!proposalId) {
            toast.error('Proposal belum dibuat')
            return
        }

        try {
            setLoading(true)

            // Update payment status
            const { error } = await supabase
                .from('proposals')
                .update({
                    payment_status: 'confirmed',
                    confirmed_at: new Date().toISOString()
                })
                .eq('id', proposalId)

            if (error) throw error

            setIsConfirmed(true)
            toast.success('Sponsorship berhasil dikonfirmasi')

            // Refresh pending sponsorship list
            const { data: pends } = await supabase
                .from('proposals')
                .select('*')
                .eq('type', 'sponsorship')
                .eq('payment_status', 'pending')
                .order('number', { ascending: false })
            if (pends) setPendingProposals(pends)
            setSelectedVerificationId('')
        } catch (error) {
            toast.error('Gagal mengkonfirmasi pembayaran')
        } finally {
            setLoading(false)
        }
    }

    const handleVerificationSelect = (id: string) => {
        setSelectedVerificationId(id)
        const selected = pendingProposals.find(p => p.id === id)
        if (selected) {
            setProposalId(selected.id)
            setProposalNumber(selected.number)
            setTokenUrl(selected.token_pdf_url || '')
            setProposalPdfUrl(selected.proposal_pdf_url || '')
            setIsConfirmed(selected.payment_status === 'confirmed')
            // Set form values
            setFormData(prev => ({ ...prev, language: selected.lang || 'id', name: selected.name, phone: selected.phone, congregation: selected.congregation || '', contribution_value: selected.contribution_value?.toString() || '', message: selected.message || '' }))
        }
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <div className="container mx-auto max-w-4xl pt-4 space-y-8">
            {/* Poka-Yoke Verification Card */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="border-emerald shadow-emerald overflow-hidden bg-[#022c22]/40 backdrop-blur-xl">
                    <CardHeader className="border-b border-[#D4AF37]/20 pb-6 bg-[#022c22]/60">
                        <CardTitle className="text-xl font-bold text-[#FDFBF7] flex items-center">
                            <CheckCircle className="mr-2 h-5 w-5 text-[#D4AF37]" />
                            Verifikasi & Konfirmasi Kerja Sama (Poka-Yoke)
                        </CardTitle>
                        <p className="text-[#FDFBF7]/60 mt-1 text-xs">
                            Cari dan pilih proposal sponsorship pending untuk diverifikasi secara aman.
                        </p>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[#D4AF37] font-semibold text-sm">Cari Proposal Sponsorship Pending</Label>
                            <SearchableSelect
                                options={pendingProposals.map(p => ({
                                    value: p.id,
                                    label: `${p.number} - ${p.name}`,
                                    sublabel: `Rp ${p.contribution_value?.toLocaleString('id-ID')} | Jemaat/Mitra: ${p.congregation || '-'}`
                                }))}
                                value={selectedVerificationId}
                                onChange={handleVerificationSelect}
                                placeholder="Masukkan nomor proposal atau nama sponsor..."
                                searchPlaceholder="Cari nomor/nama..."
                                emptyMessage="Tidak ada proposal pending yang cocok."
                            />
                        </div>

                        {selectedVerificationId && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="p-6 bg-black/20 rounded-xl border border-[#D4AF37]/20 space-y-4"
                            >
                                <h3 className="font-semibold text-[#D4AF37] border-b border-[#D4AF37]/20 pb-2">Rincian Sponsorship Terpilih</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-white/40 text-xs">Nomor Proposal</p>
                                        <p className="text-[#FDFBF7] font-medium">{proposalNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/40 text-xs">Nama Sponsor</p>
                                        <p className="text-[#FDFBF7] font-medium">{formData.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/40 text-xs">Nomor WhatsApp</p>
                                        <p className="text-[#FDFBF7] font-medium">{formData.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/40 text-xs">Nilai Sponsorship</p>
                                        <p className="text-[#D4AF37] font-bold">Rp {Number(formData.contribution_value)?.toLocaleString('id-ID')}</p>
                                    </div>
                                </div>

                                {!isConfirmed ? (
                                    <div className="flex flex-col gap-4 mt-4">
                                        <Button
                                            type="button"
                                            onClick={confirmPayment}
                                            disabled={loading}
                                            className="emerald-button w-full"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Memproses Verifikasi...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="mr-2 h-4 w-4 text-[#022c22]" />
                                                    Konfirmasi Kerja Sama Lunas
                                                </>
                                            )}
                                        </Button>
                                        {proposalPdfUrl && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => window.open(proposalPdfUrl, '_blank')}
                                                className="w-full rounded-full border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#022c22] transition-colors"
                                            >
                                                <DollarSign className="mr-2 h-4 w-4" />
                                                Lihat PDF Proposal
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="pt-4 border-t border-[#D4AF37]/20 space-y-4">
                                        <div className="p-3 bg-[#047857]/30 rounded-lg text-sm text-[#FDFBF7]/90 border border-[#D4AF37]/20">
                                            Status: Kerja Sama Dikonfirmasi & Lunas
                                        </div>
                                        {proposalPdfUrl && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => window.open(proposalPdfUrl, '_blank')}
                                                className="w-full rounded-full border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#022c22] transition-colors"
                                            >
                                                <DollarSign className="mr-2 h-4 w-4" />
                                                Lihat PDF Proposal
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Form Registrasi Baru */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <Card className="border-emerald shadow-emerald overflow-hidden bg-[#022c22]/40 backdrop-blur-xl">
                    <CardHeader className="border-b border-[#D4AF37]/20 pb-6 bg-[#022c22]/60">
                        <CardTitle className="text-2xl font-bold text-[#FDFBF7] flex items-center">
                            <DollarSign className="mr-2 h-6 w-6 text-[#D4AF37]" />
                            Pendaftaran Proposal Sponsorship Baru
                        </CardTitle>
                        <p className="text-[#FDFBF7]/60 mt-2 text-sm italic">
                            "Teruskan Baktimu!" - Lansia Teladan dalam Iman, Karya, dan Pelayanan
                        </p>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="form-container"
                        >
                            <div className="space-y-6">
                                {/* Panitia Penanggung Jawab */}
                                <motion.div variants={itemVariants} className="form-section bg-black/10 p-6 rounded-xl border border-[#D4AF37]/10">
                                    <Label className="form-section-title">Panitia Penanggung Jawab</Label>
                                    <div className="mt-4">
                                        <SearchableSelect
                                            options={committees.map(c => ({ value: c.id, label: c.name, sublabel: c.role }))}
                                            value={formData.committee_id}
                                            onChange={(val) => setFormData(prev => ({ ...prev, committee_id: val }))}
                                            placeholder="Cari dan pilih nama panitia..."
                                            searchPlaceholder="Cari nama atau jabatan..."
                                        />
                                    </div>
                                </motion.div>

                                {/* Nama Sponsor */}
                                <motion.div variants={itemVariants} className="form-section bg-black/10 p-6 rounded-xl border border-[#D4AF37]/10">
                                    <Label className="form-section-title">Nama Instansi / Perusahaan</Label>
                                    <div className="grid grid-cols-1 gap-6 mt-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-[#FDFBF7]/80">Nama Lengkap Sponsor</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="Nama Instansi, Perusahaan, atau Sponsor Pribadi"
                                                className="form-input"
                                                required
                                            />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Kontak */}
                                <motion.div variants={itemVariants} className="form-section bg-black/10 p-6 rounded-xl border border-[#D4AF37]/10">
                                    <Label className="form-section-title">Kontak Hubung</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-[#FDFBF7]/80">Nomor WhatsApp PIC</Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="Contoh: 6281234567890"
                                                className="form-input"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="congregation" className="text-[#FDFBF7]/80">Jemaat / Kemitraan</Label>
                                            <Input
                                                id="congregation"
                                                name="congregation"
                                                value={formData.congregation}
                                                onChange={handleInputChange}
                                                placeholder="Jemaat GPIB / Nama Mitra (Opsional)"
                                                className="form-input"
                                            />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Nilai Dukungan */}
                                <motion.div variants={itemVariants} className="form-section bg-black/10 p-6 rounded-xl border border-[#D4AF37]/10">
                                    <Label className="form-section-title">Nilai Dukungan Sponsorship</Label>
                                    <div className="grid grid-cols-1 gap-6 mt-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="contribution_value" className="text-[#FDFBF7]/80">Nilai Kontrak (Rp)</Label>
                                            <Input
                                                id="contribution_value"
                                                name="contribution_value"
                                                type="text"
                                                value={formData.contribution_value ? new Intl.NumberFormat('id-ID').format(Number(formData.contribution_value)) : ''}
                                                onChange={handleCurrencyChange}
                                                placeholder="10.000.000"
                                                className="form-input"
                                                required
                                            />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Keterangan Tambahan */}
                                <motion.div variants={itemVariants} className="form-section bg-black/10 p-6 rounded-xl border border-[#D4AF37]/10">
                                    <Label htmlFor="message" className="form-section-title">Keterangan / Paket Sponsorship</Label>
                                    <Textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        placeholder="Tulis paket sponsorship atau keterangan kerja sama..."
                                        rows={4}
                                        className="form-input mt-4"
                                    />
                                </motion.div>

                                {/* Bahasa */}
                                <motion.div variants={itemVariants} className="form-section bg-black/10 p-6 rounded-xl border border-[#D4AF37]/10">
                                    <Label htmlFor="language" className="form-section-title">Bahasa Dokumen</Label>
                                    <div className="mt-4">
                                        <Select
                                            value={formData.language}
                                            onValueChange={(value) => setFormData({ ...formData, language: value })}
                                        >
                                            <SelectTrigger id="language" className="form-input border-[#D4AF37]/30 bg-black/20 text-[#FDFBF7]">
                                                <SelectValue placeholder="Pilih bahasa" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#022c22] border-[#D4AF37]/30 text-[#FDFBF7]">
                                                <SelectItem value="id" className="focus:bg-[#D4AF37]/20 focus:text-[#FDFBF7]">Bahasa Indonesia</SelectItem>
                                                <SelectItem value="en" className="focus:bg-[#D4AF37]/20 focus:text-[#FDFBF7]">English</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </motion.div>

                                {/* Actions */}
                                <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 mt-8">
                                    <Button
                                        type="button"
                                        onClick={handleGenerateProposal}
                                        disabled={isGenerating}
                                        className="emerald-button flex-1"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Membuat Proposal
                                            </>
                                        ) : (
                                            <>
                                                <DollarSign className="mr-2 h-4 w-4 text-[#022c22]" />
                                                Buat Proposal Sponsorship
                                            </>
                                        )}
                                    </Button>

                                    {proposalPdfUrl && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => window.open(proposalPdfUrl, '_blank')}
                                            className="flex-1 rounded-full border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#022c22] transition-colors"
                                        >
                                            <DollarSign className="mr-2 h-4 w-4" />
                                            Lihat PDF Proposal
                                        </Button>
                                    )}

                                    {proposalNumber && (
                                        <Button
                                            type="button"
                                            onClick={sendProposalViaWA}
                                            disabled={isSending}
                                            className="bg-[#25D366] hover:bg-[#128C7E] text-white flex-1 rounded-full font-semibold transition-all shadow-[0_4px_14px_0_rgba(37,211,102,0.39)]"
                                        >
                                            {isSending ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Mengirim
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="mr-2 h-4 w-4" />
                                                    Kirim via WhatsApp
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </motion.div>
                            </div>

                            {!isConfirmed && proposalNumber && (
                                <motion.div variants={itemVariants} className="mt-8 p-6 bg-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/40 backdrop-blur-md">
                                    <h3 className="font-bold text-[#D4AF37] mb-2 text-lg">Konfirmasi Sponsorship</h3>
                                    <p className="text-[#FDFBF7]/80 mb-6">
                                        Setelah berkas MoU ditandatangani dan dana disetujui, klik konfirmasi di bawah ini.
                                    </p>
                                    <Button
                                        type="button"
                                        onClick={confirmPayment}
                                        disabled={loading}
                                        className="emerald-button w-full"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Mengecek Konfirmasi
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="mr-2 h-4 w-4 text-[#022c22]" />
                                                Konfirmasi Kerja Sama
                                            </>
                                        )}
                                    </Button>
                                </motion.div>
                            )}

                            {isConfirmed && (
                                <motion.div variants={itemVariants} className="mt-8 p-6 bg-[#047857]/30 rounded-xl border border-[#D4AF37]/40 backdrop-blur-md">
                                    <h3 className="font-bold text-[#D4AF37] mb-2 text-lg">Kerja Sama Sponsorship Dikonfirmasi</h3>
                                    <p className="text-[#FDFBF7]/80">
                                        Sponsorship ini telah lunas/disetujui dan tercatat dalam sistem keuangan panitia.
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
