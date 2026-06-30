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
    Heart,
    CheckCircle,
    Send,
    Loader2,
    FileText
} from 'lucide-react'
import { motion } from 'framer-motion'
import { getNextNumber } from '@/lib/numbering'
import { buildWhatsAppLink } from '@/lib/whatsapp'
import { toast } from 'sonner'

import { SearchableSelect } from '@/components/ui/searchable-select'

export default function ProposalSponsorshipPage() {
    const [formData, setFormData] = useState({
        name: '',
        display_name: '',
        company_name: '',
        phone: '',
        email: '',
        congregation: '',
        contribution_value: '',
        contribution_form: '',
        sponsor_package: 'donatur',
        specific_support: '',
        message: '',
        language: 'id',
        payment_status: 'pending',
        committee_id: '',
        payment_proof_url: '',
        commitment_pdf_url: ''
    })

    const [loading, setLoading] = useState(false)
    const [proposalNumber, setProposalNumber] = useState('')
    const [proposalId, setProposalId] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [isConfirmed, setIsConfirmed] = useState(false)
    const [tokenUrl, setTokenUrl] = useState('')
    const [proposalPdfUrl, setProposalPdfUrl] = useState('')
    const [commitmentPdfUrl, setCommitmentPdfUrl] = useState('')

    const [isEditingCommitment, setIsEditingCommitment] = useState(false)
    const [savingCommitment, setSavingCommitment] = useState(false)
    const [uploadingProof, setUploadingProof] = useState(false)

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
        if (!formData.name || !formData.phone || !formData.committee_id) {
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

            // Generate token
            await generateToken(proposalId)
            setIsConfirmed(true)
            toast.success('Sponsorship berhasil dikonfirmasi & token dibuat')

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

    const generateToken = async (id: string) => {
        try {
            const response = await fetch('/api/generate-token', {
                method: 'POST',
                body: JSON.stringify({ id, lang: formData.language })
            })

            const result = await response.json()

            if (result.error) {
                throw new Error(result.error)
            }

            setTokenUrl(result.url)
            toast.success('Token penghargaan berhasil dibuat')
            return result.url
        } catch (error) {
            toast.error('Gagal menghasilkan token penghargaan')
            throw error
        }
    }

    const sendTokenViaWA = async () => {
        if (!proposalId || !tokenUrl) {
            toast.error('Token belum dibuat')
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
                'token',
                formData.language as 'id' | 'en',
                {
                    number: proposal.number,
                    name: proposal.name,
                    display_name: proposal.display_name || proposal.name,
                    category: proposal.sponsor_package,
                    token_url: tokenUrl
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

    const generateCommitmentPDF = async (id: string) => {
        try {
            const response = await fetch('/api/generate-commitment', {
                method: 'POST',
                body: JSON.stringify({ id, lang: formData.language })
            })
            const result = await response.json()
            if (result.error) throw new Error(result.error)
            toast.success('Surat komitmen berhasil dibuat')
            return result.url
        } catch (error) {
            toast.error('Gagal menghasilkan surat komitmen')
            throw error
        }
    }

    const sendCommitmentViaWA = async () => {
        if (!proposalId || !commitmentPdfUrl) {
            toast.error('Surat komitmen belum dibuat')
            return
        }

        try {
            setIsSending(true)

            // Build WhatsApp message
            const waLink = buildWhatsAppLink(
                formData.phone,
                'commitment',
                formData.language as 'id' | 'en',
                {
                    number: proposalNumber,
                    name: formData.name,
                    commitment_url: commitmentPdfUrl
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

    const handleSaveCommitment = async () => {
        if (!proposalId) return
        const val = Number(formData.contribution_value) || 0
        const form = formData.contribution_form
        if (!form) {
            toast.error('Silakan pilih Jenis Komitmen')
            return
        }
        if ((form === 'tunai' || form === 'transfer') && val <= 0) {
            toast.error('Nilai komitmen sponsorship harus lebih dari 0')
            return
        }

        try {
            setSavingCommitment(true)

            let pkg = formData.sponsor_package
            if (val > 0) {
                if (val >= 50000000) pkg = 'platinum'
                else if (val >= 25000000) pkg = 'gold'
                else if (val >= 15000000) pkg = 'silver'
                else if (val >= 5000000) pkg = 'bronze'
                else pkg = 'donatur' // Partisipasi
            }

            const { error } = await supabase
                .from('proposals')
                .update({
                    contribution_value: val > 0 ? val : null,
                    contribution_form: form,
                    sponsor_package: pkg || null,
                    company_name: formData.company_name || formData.name,
                    display_name: formData.display_name || formData.name,
                    specific_support: formData.specific_support || null,
                    message: formData.message || null
                })
                .eq('id', proposalId)

            if (error) throw error

            // Regenerate PDF proposal & generate commitment PDF
            const newPdfUrl = await generateProposalPDF(proposalId)
            setProposalPdfUrl(newPdfUrl)

            const newCommitmentUrl = await generateCommitmentPDF(proposalId)
            setCommitmentPdfUrl(newCommitmentUrl)

            // Refresh pending list
            const { data: pends } = await supabase
                .from('proposals')
                .select('*')
                .eq('type', 'sponsorship')
                .eq('payment_status', 'pending')
                .order('number', { ascending: false })
            if (pends) {
                setPendingProposals(pends)
                const updated = pends.find(p => p.id === proposalId)
                if (updated) {
                    setFormData(prev => ({
                        ...prev,
                        contribution_value: updated.contribution_value?.toString() || '',
                        contribution_form: updated.contribution_form || '',
                        sponsor_package: updated.sponsor_package || 'donatur',
                        display_name: updated.display_name || updated.name,
                        company_name: updated.company_name || updated.name,
                        specific_support: updated.specific_support || '',
                        message: updated.message || '',
                        payment_proof_url: updated.payment_proof_url || ''
                    }))
                    setCommitmentPdfUrl(updated.commitment_pdf_url || '')
                }
            }

            toast.success('Komitmen sponsorship berhasil dicatat & PDF diperbarui!')
            setIsEditingCommitment(false)
        } catch (err: any) {
            toast.error('Gagal menyimpan komitmen: ' + err.message)
        } finally {
            setSavingCommitment(false)
        }
    }

    const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !proposalId) return

        try {
            setUploadingProof(true)

            const fileExt = file.name.split('.').pop()
            const filePath = `proofs/${proposalId}_proof.${fileExt}`
            
            const { error: uploadError } = await supabase.storage
                .from('proposals')
                .upload(filePath, file, {
                    upsert: true
                })

            if (uploadError) throw uploadError

            const { data: urlData } = supabase.storage
                .from('proposals')
                .getPublicUrl(filePath)

            const publicUrl = urlData.publicUrl

            const { error: updateError } = await supabase
                .from('proposals')
                .update({
                    payment_proof_url: publicUrl
                })
                .eq('id', proposalId)

            if (updateError) throw updateError

            setFormData(prev => ({ ...prev, payment_proof_url: publicUrl }))
            
            // Refresh pendingProposals list
            const { data: pends } = await supabase
                .from('proposals')
                .select('*')
                .eq('type', 'sponsorship')
                .eq('payment_status', 'pending')
                .order('number', { ascending: false })
            if (pends) setPendingProposals(pends)

            toast.success('Bukti pembayaran berhasil diunggah!')
        } catch (err: any) {
            console.error(err)
            toast.error('Gagal mengnggah bukti pembayaran: ' + err.message)
        } finally {
            setUploadingProof(false)
        }
    }

    const handleRemoveProof = async () => {
        if (!proposalId) return

        try {
            setUploadingProof(true)

            const { error: updateError } = await supabase
                .from('proposals')
                .update({
                    payment_proof_url: null
                })
                .eq('id', proposalId)

            if (updateError) throw updateError

            setFormData(prev => ({ ...prev, payment_proof_url: '' }))
            
            // Refresh pendingProposals list
            const { data: pends } = await supabase
                .from('proposals')
                .select('*')
                .eq('type', 'sponsorship')
                .eq('payment_status', 'pending')
                .order('number', { ascending: false })
            if (pends) setPendingProposals(pends)

            toast.success('Bukti pembayaran berhasil dihapus!')
        } catch (err: any) {
            console.error(err)
            toast.error('Gagal menghapus bukti pembayaran: ' + err.message)
        } finally {
            setUploadingProof(false)
        }
    }

    const handleVerificationSelect = (id: string) => {
        setSelectedVerificationId(id)
        setIsEditingCommitment(false)
        const selected = pendingProposals.find(p => p.id === id)
        if (selected) {
            setProposalId(selected.id)
            setProposalNumber(selected.number)
            setTokenUrl(selected.token_pdf_url || '')
            setProposalPdfUrl(selected.proposal_pdf_url || '')
            setCommitmentPdfUrl(selected.commitment_pdf_url || '')
            setIsConfirmed(selected.payment_status === 'confirmed')
            // Set form values
            setFormData(prev => ({ 
                ...prev, 
                language: selected.lang || 'id', 
                name: selected.name, 
                display_name: selected.display_name || selected.name,
                company_name: selected.company_name || '',
                phone: selected.phone, 
                email: selected.email || '',
                congregation: selected.congregation || '', 
                contribution_value: selected.contribution_value?.toString() || '', 
                contribution_form: selected.contribution_form || '',
                sponsor_package: selected.sponsor_package || 'donatur',
                message: selected.message || '',
                specific_support: selected.specific_support || '',
                committee_id: selected.committee_id || '',
                payment_proof_url: selected.payment_proof_url || ''
            }))
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

                        {selectedVerificationId && (() => {
                            const selectedProposal = pendingProposals.find(p => p.id === selectedVerificationId)
                            const hasCommitment = selectedProposal && (
                                (selectedProposal.contribution_value && Number(selectedProposal.contribution_value) > 0) || 
                                selectedProposal.contribution_form
                            )
                            
                            return (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="p-6 bg-black/20 rounded-xl border border-[#D4AF37]/20 space-y-6"
                                >
                                    <div className="flex justify-between items-center border-b border-[#D4AF37]/20 pb-2">
                                        <h3 className="font-semibold text-[#D4AF37]">
                                            {!hasCommitment || isEditingCommitment ? 'Catat Komitmen Sponsorship' : 'Rincian Proposal Terpilih'}
                                        </h3>
                                        {hasCommitment && !isEditingCommitment && !isConfirmed && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setIsEditingCommitment(true)}
                                                className="h-7 px-3 text-xs border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/20 rounded-full"
                                            >
                                                Edit Komitmen
                                            </Button>
                                        )}
                                    </div>

                                    {!hasCommitment || isEditingCommitment ? (
                                        // Form Pencatatan Komitmen
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="edit_contribution_form" className="text-[#FDFBF7]/85 text-xs">Jenis Komitmen</Label>
                                                    <Select
                                                        value={formData.contribution_form}
                                                        onValueChange={(value) => setFormData({ ...formData, contribution_form: value })}
                                                    >
                                                        <SelectTrigger id="edit_contribution_form" className="form-input border-[#D4AF37]/30 bg-black/20 text-[#FDFBF7]">
                                                            <SelectValue placeholder="Pilih jenis komitmen" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-[#022c22] border-[#D4AF37]/30 text-[#FDFBF7]">
                                                            <SelectItem value="tunai">Uang Tunai</SelectItem>
                                                            <SelectItem value="transfer">Transfer Bank</SelectItem>
                                                            <SelectItem value="barang">Barang (In-Kind)</SelectItem>
                                                            <SelectItem value="jasa">Jasa</SelectItem>
                                                            <SelectItem value="konsumsi">Konsumsi</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="edit_contribution_value" className="text-[#FDFBF7]/85 text-xs">Nilai Sponsorship (Rp)</Label>
                                                    <Input
                                                        id="edit_contribution_value"
                                                        name="contribution_value"
                                                        type="text"
                                                        value={formData.contribution_value ? new Intl.NumberFormat('id-ID').format(Number(formData.contribution_value)) : ''}
                                                        onChange={handleCurrencyChange}
                                                        placeholder="Contoh: 10.000.000 (jika ada)"
                                                        className="form-input border-[#D4AF37]/30 bg-black/20 text-[#FDFBF7]"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="edit_display_name" className="text-[#FDFBF7]/85 text-xs">Nama untuk Buku Acara</Label>
                                                    <Input
                                                        id="edit_display_name"
                                                        name="display_name"
                                                        value={formData.display_name}
                                                        onChange={handleInputChange}
                                                        placeholder="Kosongkan jika sama dengan nama sponsor"
                                                        className="form-input border-[#D4AF37]/30 bg-black/20 text-[#FDFBF7]"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="edit_language" className="text-[#FDFBF7]/85 text-xs">Bahasa PDF</Label>
                                                    <Select
                                                        value={formData.language}
                                                        onValueChange={(value) => setFormData({ ...formData, language: value })}
                                                    >
                                                        <SelectTrigger id="edit_language" className="form-input border-[#D4AF37]/30 bg-black/20 text-[#FDFBF7]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-[#022c22] border-[#D4AF37]/30 text-[#FDFBF7]">
                                                            <SelectItem value="id">Bahasa Indonesia</SelectItem>
                                                            <SelectItem value="en">English</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            {/* Paket Sponsor */}
                                            <div className="space-y-2">
                                                <Label className="text-[#FDFBF7]/85 text-xs">Paket Sponsor</Label>
                                                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                                                    {['platinum', 'gold', 'silver', 'bronze', 'in_kind', 'donatur'].map((pkg) => {
                                                        const labels: Record<string, string> = {
                                                            platinum: 'Platinum',
                                                            gold: 'Gold',
                                                            silver: 'Silver',
                                                            bronze: 'Bronze',
                                                            in_kind: 'In-Kind',
                                                            donatur: 'Partisipasi'
                                                        }
                                                        const sublabels: Record<string, string> = {
                                                            platinum: 'Rp50Jt+',
                                                            gold: 'Rp25Jt+',
                                                            silver: 'Rp15Jt+',
                                                            bronze: 'Rp5Jt+',
                                                            in_kind: 'Barang/Jasa',
                                                            donatur: 'Bebas'
                                                        }
                                                        const active = formData.sponsor_package === pkg
                                                        return (
                                                            <Button
                                                                key={pkg}
                                                                type="button"
                                                                variant={active ? 'default' : 'outline'}
                                                                className={`h-auto py-2 px-1 flex flex-col items-center text-center justify-center border-[#D4AF37]/30 ${active ? 'bg-[#D4AF37] text-[#022c22] hover:bg-[#D4AF37]/90' : 'bg-transparent text-[#FDFBF7] hover:bg-[#D4AF37]/20 hover:text-[#D4AF37]'}`}
                                                                onClick={() => setFormData({ ...formData, sponsor_package: pkg })}
                                                            >
                                                                <span className="font-semibold text-[10px] mb-0.5">{labels[pkg]}</span>
                                                                <span className="text-[8px] opacity-80">{sublabels[pkg]}</span>
                                                            </Button>
                                                        )
                                                    })}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="edit_specific_support" className="text-[#FDFBF7]/85 text-xs">Alokasi Dukungan Spesifik</Label>
                                                <Select
                                                    value={formData.specific_support}
                                                    onValueChange={(value) => setFormData({ ...formData, specific_support: value })}
                                                >
                                                    <SelectTrigger id="edit_specific_support" className="form-input border-[#D4AF37]/30 bg-black/20 text-[#FDFBF7]">
                                                        <SelectValue placeholder="Pilih dukungan spesifik" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[#022c22] border-[#D4AF37]/30 text-[#FDFBF7]">
                                                        <SelectItem value="konsumsi_lansia">Konsumsi Lansia</SelectItem>
                                                        <SelectItem value="hadiah_lomba">Hadiah Lomba</SelectItem>
                                                        <SelectItem value="souvenir_peserta">Souvenir Peserta</SelectItem>
                                                        <SelectItem value="dokumentasi">Dokumentasi</SelectItem>
                                                        <SelectItem value="webinar">Webinar</SelectItem>
                                                        <SelectItem value="peserta_lansia">Dukung Peserta Lansia</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="edit_message" className="text-[#FDFBF7]/85 text-xs">Ucapan / Keterangan (Maks 40 Kata)</Label>
                                                <Textarea
                                                    id="edit_message"
                                                    name="message"
                                                    value={formData.message}
                                                    onChange={handleInputChange}
                                                    placeholder="Tulis keterangan tambahan atau ucapan..."
                                                    rows={3}
                                                    className="form-input border-[#D4AF37]/30 bg-black/20 text-[#FDFBF7]"
                                                />
                                            </div>

                                            <div className="flex gap-4 pt-2">
                                                <Button
                                                    type="button"
                                                    onClick={handleSaveCommitment}
                                                    disabled={savingCommitment}
                                                    className="emerald-button flex-1"
                                                >
                                                    {savingCommitment ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Menyimpan...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="mr-2 h-4 w-4 text-[#022c22]" />
                                                            Simpan Komitmen & Buat Ulang PDF
                                                        </>
                                                    )}
                                                </Button>
                                                {hasCommitment && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => setIsEditingCommitment(false)}
                                                        className="rounded-full border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#022c22]"
                                                    >
                                                        Batal
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        // View Rincian Komitmen
                                        <div className="space-y-4">
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
                                                {formData.email && (
                                                    <div>
                                                        <p className="text-white/40 text-xs">Email</p>
                                                        <p className="text-[#FDFBF7] font-medium">{formData.email}</p>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-white/40 text-xs">Asal Jemaat / Mitra</p>
                                                    <p className="text-[#FDFBF7] font-medium">{formData.congregation || '-'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-white/40 text-xs">Jenis Komitmen</p>
                                                    <p className="text-[#FDFBF7] font-medium capitalize">
                                                        {formData.contribution_form ? (formData.contribution_form === 'tunai' ? 'Uang Tunai' : formData.contribution_form === 'transfer' ? 'Transfer Bank' : formData.contribution_form) : '-'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-white/40 text-xs">Nilai Sponsorship</p>
                                                    <p className="text-[#D4AF37] font-bold">
                                                        {formData.contribution_value && Number(formData.contribution_value) > 0 
                                                            ? `Rp ${Number(formData.contribution_value).toLocaleString('id-ID')}`
                                                            : 'In-Kind / Non-Moneter'} 
                                                        <span className="text-white/60 text-xs font-normal ml-2">
                                                            ({formData.sponsor_package ? formData.sponsor_package.replace('_', ' ').toUpperCase() : '-'})
                                                        </span>
                                                    </p>
                                                </div>
                                                {formData.specific_support && (
                                                    <div>
                                                        <p className="text-white/40 text-xs">Alokasi Dukungan</p>
                                                        <p className="text-[#FDFBF7] font-medium">{formData.specific_support.replace('_', ' ')}</p>
                                                    </div>
                                                )}
                                                {formData.message && (
                                                    <div className="col-span-2">
                                                        <p className="text-white/40 text-xs">Ucapan / Keterangan</p>
                                                        <p className="text-[#FDFBF7] italic">"{formData.message}"</p>
                                                    </div>
                                                )}
                                                <div className="col-span-2 border-t border-[#D4AF37]/20 pt-4 space-y-2">
                                                    <p className="text-[#D4AF37] font-semibold text-xs flex items-center gap-1.5">
                                                        <FileText className="h-4 w-4" /> Bukti Pembayaran
                                                    </p>
                                                    {formData.payment_proof_url ? (
                                                        <div className="p-3 bg-black/40 rounded-lg border border-[#D4AF37]/20 space-y-3">
                                                            {formData.payment_proof_url.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                                                                <div className="relative group rounded-lg overflow-hidden border border-emerald-500/10 max-h-48 bg-black/60 flex justify-center items-center p-2">
                                                                    <img 
                                                                        src={formData.payment_proof_url} 
                                                                        alt="Bukti Pembayaran" 
                                                                        className="max-h-44 object-contain hover:scale-102 transition-transform duration-200"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-2.5 p-3 bg-[#022c22]/40 rounded-lg border border-[#D4AF37]/20 text-[#FDFBF7]">
                                                                    <FileText className="h-5 w-5 text-[#D4AF37] shrink-0" />
                                                                    <div className="text-xs truncate flex-1 font-medium">Dokumen Bukti Pembayaran</div>
                                                                </div>
                                                            )}
                                                            <div className="flex gap-2.5 pt-1">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => window.open(formData.payment_proof_url, '_blank')}
                                                                    className="flex-1 text-xs border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/15 h-8 rounded-full font-medium"
                                                                >
                                                                    Buka / Unduh
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={handleRemoveProof}
                                                                    disabled={uploadingProof}
                                                                    className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 rounded-full"
                                                                >
                                                                    {uploadingProof ? 'Menghapus...' : 'Hapus Bukti'}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 bg-black/30 border border-dashed border-[#D4AF37]/30 rounded-lg text-center flex flex-col items-center justify-center space-y-2">
                                                            <span className="text-xs text-white/50">Belum ada bukti pembayaran yang diunggah</span>
                                                            <Label 
                                                                htmlFor="upload_proof" 
                                                                className="cursor-pointer bg-[#D4AF37]/20 border border-[#D4AF37]/40 hover:bg-[#D4AF37]/30 text-[#D4AF37] px-3.5 py-1.5 text-xs rounded-full font-semibold transition-all inline-block hover:shadow-[0_0_8px_rgba(212,175,55,0.25)]"
                                                            >
                                                                {uploadingProof ? 'Mengunggah...' : 'Unggah Bukti (Gambar / PDF)'}
                                                            </Label>
                                                            <Input
                                                                id="upload_proof"
                                                                type="file"
                                                                accept="image/*,application/pdf"
                                                                className="hidden"
                                                                disabled={uploadingProof}
                                                                onChange={handleUploadProof}
                                                            />
                                                        </div>
                                                    )}
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
                                                            <FileText className="mr-2 h-4 w-4" />
                                                            Lihat PDF Proposal (Ter-update)
                                                        </Button>
                                                    )}
                                                    {commitmentPdfUrl && (
                                                         <div className="flex flex-col sm:flex-row gap-4 mt-2">
                                                             <Button
                                                                 type="button"
                                                                 onClick={sendCommitmentViaWA}
                                                                 disabled={isSending}
                                                                 className="bg-[#25D366] hover:bg-[#128C7E] text-white flex-1 rounded-full font-semibold transition-all shadow-[0_4px_14px_0_rgba(37,211,102,0.39)]"
                                                             >
                                                                 <Send className="mr-2 h-4 w-4" /> Kirim Bukti Komitmen via WA
                                                             </Button>
                                                             <Button
                                                                 type="button"
                                                                 variant="outline"
                                                                 onClick={() => window.open(commitmentPdfUrl, '_blank')}
                                                                 className="flex-1 rounded-full border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#022c22] transition-colors"
                                                             >
                                                                 Lihat Bukti Komitmen
                                                             </Button>
                                                         </div>
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
                                                            className="w-full rounded-full border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#022c22] transition-colors mb-2"
                                                        >
                                                            <FileText className="mr-2 h-4 w-4" />
                                                            Lihat PDF Proposal (Ter-update)
                                                        </Button>
                                                    )}
                                                    <div className="flex gap-4">
                                                        {tokenUrl && (
                                                            <>
                                                                <Button
                                                                    type="button"
                                                                    onClick={sendTokenViaWA}
                                                                    disabled={isSending}
                                                                    className="bg-[#25D366] hover:bg-[#128C7E] text-white flex-1 rounded-full font-semibold transition-all shadow-[0_4px_14px_0_rgba(37,211,102,0.39)]"
                                                                >
                                                                    <Send className="mr-2 h-4 w-4" /> Kirim Token via WA
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    onClick={() => window.open(tokenUrl, '_blank')}
                                                                    className="flex-1 rounded-full border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#022c22] transition-colors"
                                                                >
                                                                    Lihat Token
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            )
                        })()}
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
                            <Heart className="mr-2 h-6 w-6 text-[#D4AF37]" />
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
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
                                        <div className="space-y-2">
                                            <Label htmlFor="display_name" className="text-[#FDFBF7]/80">Nama untuk Buku Acara</Label>
                                            <Input
                                                id="display_name"
                                                name="display_name"
                                                value={formData.display_name}
                                                onChange={handleInputChange}
                                                placeholder="Kosongkan jika sama dengan nama lengkap"
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="company_name" className="text-[#FDFBF7]/80">Perusahaan / Kemitraan Utama (Opsional)</Label>
                                            <Input
                                                id="company_name"
                                                name="company_name"
                                                value={formData.company_name}
                                                onChange={handleInputChange}
                                                placeholder="Contoh: PT Swadaya Mandiri, CV Indah Karya"
                                                className="form-input"
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
                                            <Label htmlFor="email" className="text-[#FDFBF7]/80">Email PIC (Opsional)</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="Contoh: sponsor@email.com"
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
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
                                                <Heart className="mr-2 h-4 w-4 text-[#022c22]" />
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
                                            <FileText className="mr-2 h-4 w-4" />
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
