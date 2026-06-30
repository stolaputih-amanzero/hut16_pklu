'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, FileText, ExternalLink, Calendar, CheckCircle, Clock, Edit2, Trash2, Plus, X, Loader2, Users } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import { toast } from 'sonner'
import { getNextNumber } from '@/lib/numbering'

export default function DaftarProposalPage() {
    const [proposals, setProposals] = useState<any[]>([])
    const [committees, setCommittees] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    
    // Modal states
    const [isOpen, setIsOpen] = useState(false)
    const [selectedProposal, setSelectedProposal] = useState<any | null>(null)
    const [isEditMode, setIsEditMode] = useState(false)
    const [modalSubmitting, setModalSubmitting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [uploadingProof, setUploadingProof] = useState(false)

    const [statusFilter, setStatusFilter] = useState('all')

    // Form states
    const [formData, setFormData] = useState({
        id: '',
        type: 'donatur',
        number: '',
        name: '',
        display_name: '',
        company_name: '',
        phone: '',
        email: '',
        congregation: '',
        contribution_value: '',
        contribution_form: '',
        specific_support: '',
        message: '',
        donatur_category: 'sahabat_bakti',
        sponsor_package: 'donatur',
        lang: 'id',
        payment_status: 'pending',
        committee_id: '',
        payment_proof_url: '',
        commitment_pdf_url: ''
    })

    useEffect(() => {
        fetchProposals()
        fetchCommittees()
    }, [])

    const fetchProposals = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('proposals')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching proposals:', error)
        } else {
            setProposals(data || [])
        }
        setLoading(false)
    }

    const fetchCommittees = async () => {
        const { data } = await supabase
            .from('committees')
            .select('*')
            .eq('is_active', true)
            .order('name', { ascending: true })
        if (data) setCommittees(data)
    }

    const handleOpenView = (proposal: any) => {
        setSelectedProposal(proposal)
        setIsEditMode(false)
        setFormData({
            id: proposal.id,
            type: proposal.type,
            number: proposal.number,
            name: proposal.name,
            display_name: proposal.display_name || proposal.name,
            company_name: proposal.company_name || '',
            phone: proposal.phone,
            email: proposal.email || '',
            congregation: proposal.congregation || '',
            contribution_value: proposal.contribution_value?.toString() || '',
            contribution_form: proposal.contribution_form || '',
            specific_support: proposal.specific_support || '',
            message: proposal.message || '',
            donatur_category: proposal.donatur_category || 'sahabat_bakti',
            sponsor_package: proposal.sponsor_package || 'donatur',
            lang: proposal.lang || 'id',
            payment_status: proposal.payment_status || 'pending',
            committee_id: proposal.committee_id || '',
            payment_proof_url: proposal.payment_proof_url || '',
            commitment_pdf_url: proposal.commitment_pdf_url || ''
        })
        setIsOpen(true)
    }

    const handleOpenCreate = () => {
        setSelectedProposal(null)
        setIsEditMode(true)
        setFormData({
            id: '',
            type: 'donatur',
            number: '',
            name: '',
            display_name: '',
            company_name: '',
            phone: '',
            email: '',
            congregation: '',
            contribution_value: '',
            contribution_form: '',
            specific_support: '',
            message: '',
            donatur_category: 'sahabat_bakti',
            sponsor_package: 'donatur',
            lang: 'id',
            payment_status: 'pending',
            committee_id: committees[0]?.id || '',
            payment_proof_url: '',
            commitment_pdf_url: ''
        })
        setIsOpen(true)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const generateCommitmentPDF = async (id: string, language: string) => {
        try {
            const response = await fetch('/api/generate-commitment', {
                method: 'POST',
                body: JSON.stringify({ id, lang: language })
            })
            const result = await response.json()
            if (result.error) throw new Error(result.error)
            return result.url
        } catch (error) {
            console.error('Gagal menghasilkan surat komitmen:', error)
        }
    }

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '')
        const val = Number(rawValue) || 0
        let category = formData.donatur_category
        let pkg = formData.sponsor_package
        if (val > 0) {
            if (val >= 10000000) category = 'sahabat_kasih'
            else if (val >= 5000000) category = 'sahabat_berkat'
            else if (val >= 2500000) category = 'sahabat_pelayanan'
            else if (val >= 1000000) category = 'sahabat_teladan'
            else category = 'sahabat_bakti'

            if (val >= 50000000) pkg = 'platinum'
            else if (val >= 25000000) pkg = 'gold'
            else if (val >= 15000000) pkg = 'silver'
            else if (val >= 5000000) pkg = 'bronze'
            else pkg = 'donatur' // Partisipasi
        }
        setFormData({ 
            ...formData, 
            [e.target.name]: rawValue,
            donatur_category: category,
            sponsor_package: pkg
        })
    }

    const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !formData.id) return

        try {
            setUploadingProof(true)

            const fileExt = file.name.split('.').pop()
            const filePath = `proofs/${formData.id}_proof.${fileExt}`
            
            const { data, error: uploadError } = await supabase.storage
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
                .eq('id', formData.id)

            if (updateError) throw updateError

            setFormData(prev => ({ ...prev, payment_proof_url: publicUrl }))
            fetchProposals()

            toast.success('Bukti pembayaran berhasil diunggah!')
        } catch (err: any) {
            console.error(err)
            toast.error('Gagal mengunggah bukti pembayaran: ' + err.message)
        } finally {
            setUploadingProof(false)
        }
    }

    const handleRemoveProof = async () => {
        if (!formData.id) return

        try {
            setUploadingProof(true)

            const { error: updateError } = await supabase
                .from('proposals')
                .update({
                    payment_proof_url: null
                })
                .eq('id', formData.id)

            if (updateError) throw updateError

            setFormData(prev => ({ ...prev, payment_proof_url: '' }))
            fetchProposals()

            toast.success('Bukti pembayaran berhasil dihapus!')
        } catch (err: any) {
            console.error(err)
            toast.error('Gagal menghapus bukti pembayaran: ' + err.message)
        } finally {
            setUploadingProof(false)
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

    const generateTokenPDF = async (id: string, lang: string) => {
        const response = await fetch('/api/generate-token', {
            method: 'POST',
            body: JSON.stringify({ id, lang })
        })
        const result = await response.json()
        if (result.error) throw new Error(result.error)
        return result.url
    }

    const handleSave = async () => {
        if (!formData.name || !formData.phone || !formData.committee_id) {
            toast.error('Silakan lengkapi data wajib (Nama, WhatsApp, Penanggung Jawab)')
            return
        }

        try {
            setModalSubmitting(true)

            if (formData.id) {
                // Update
                const { error: updateError } = await supabase
                    .from('proposals')
                    .update({
                        name: formData.name,
                        display_name: formData.display_name || formData.name,
                        company_name: formData.company_name || null,
                        phone: formData.phone,
                        email: formData.email || null,
                        congregation: formData.congregation,
                        contribution_value: formData.contribution_value ? Number(formData.contribution_value) : null,
                        contribution_form: formData.contribution_form || null,
                        specific_support: formData.specific_support || null,
                        message: formData.message || null,
                        donatur_category: formData.type === 'donatur' ? (formData.donatur_category || null) : null,
                        sponsor_package: formData.type === 'sponsorship' ? (formData.sponsor_package || null) : null,
                        lang: formData.lang,
                        payment_status: formData.payment_status,
                        confirmed_at: formData.payment_status === 'confirmed' ? (selectedProposal?.confirmed_at || new Date().toISOString()) : null,
                        committee_id: formData.committee_id
                    })
                    .eq('id', formData.id)

                if (updateError) throw updateError

                // Regenerate PDF
                await generateProposalPDF(formData.id, formData.lang)
                if (formData.contribution_form) {
                    await generateCommitmentPDF(formData.id, formData.lang)
                }
                if (formData.payment_status === 'confirmed') {
                    await generateTokenPDF(formData.id, formData.lang)
                }

                toast.success('Proposal berhasil diperbarui dan PDF dibuat ulang!')
            } else {
                // Create
                const number = await getNextNumber(formData.type as 'donatur' | 'sponsorship', 2026)
                
                const { data: newProp, error: insertError } = await supabase
                    .from('proposals')
                    .insert({
                        type: formData.type,
                        number: number,
                        name: formData.name,
                        display_name: formData.display_name || formData.name,
                        company_name: formData.company_name || null,
                        phone: formData.phone,
                        email: formData.email || null,
                        congregation: formData.congregation,
                        contribution_value: formData.contribution_value ? Number(formData.contribution_value) : null,
                        contribution_form: formData.contribution_form || null,
                        specific_support: formData.specific_support || null,
                        message: formData.message || null,
                        donatur_category: formData.type === 'donatur' ? (formData.donatur_category || null) : null,
                        sponsor_package: formData.type === 'sponsorship' ? (formData.sponsor_package || null) : null,
                        lang: formData.lang,
                        payment_status: formData.payment_status || 'pending',
                        confirmed_at: formData.payment_status === 'confirmed' ? new Date().toISOString() : null,
                        committee_id: formData.committee_id
                    })
                    .select()
                    .single()

                if (insertError) throw insertError

                // Generate PDF
                await generateProposalPDF(newProp.id, formData.lang)
                if (formData.contribution_form) {
                    await generateCommitmentPDF(newProp.id, formData.lang)
                }
                toast.success(`Proposal ${number} berhasil dibuat!`)
            }

            setIsOpen(false)
            fetchProposals()
        } catch (error: any) {
            console.error(error)
            toast.error('Gagal memproses proposal: ' + error.message)
        } finally {
            setModalSubmitting(false)
        }
    }

    const handleDelete = async (confirmed = false) => {
        if (!selectedProposal) return
        
        if (!confirmed) {
            setShowDeleteConfirm(true)
            return
        }

        try {
            setModalSubmitting(true)
            const { error } = await supabase
                .from('proposals')
                .delete()
                .eq('id', selectedProposal.id)

            if (error) throw error

            toast.success('Proposal berhasil dihapus')
            setShowDeleteConfirm(false)
            setIsOpen(false)
            fetchProposals()
        } catch (error: any) {
            toast.error('Gagal menghapus proposal: ' + error.message)
        } finally {
            setModalSubmitting(false)
        }
    }

    const handleConfirmPayment = async () => {
        if (!selectedProposal) return
        try {
            setModalSubmitting(true)
            const { error } = await supabase
                .from('proposals')
                .update({
                    payment_status: 'confirmed',
                    confirmed_at: new Date().toISOString()
                })
                .eq('id', selectedProposal.id)

            if (error) throw error

            await generateTokenPDF(selectedProposal.id, formData.lang)
            toast.success('Pembayaran terverifikasi & token dibuat!')
            setIsOpen(false)
            fetchProposals()
        } catch (error: any) {
            toast.error('Gagal memverifikasi pembayaran: ' + error.message)
        } finally {
            setModalSubmitting(false)
        }
    }

    const filteredProposals = proposals.filter(p => {
        const matchesSearch = p.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.company_name && p.company_name.toLowerCase().includes(searchQuery.toLowerCase()))

        if (!matchesSearch) return false

        if (statusFilter === 'all') return true

        const isLunas = p.payment_status === 'confirmed'
        const isBatal = p.payment_status === 'cancelled'
        const isKomitmen = p.payment_status === 'pending' && (p.contribution_value > 0 || p.contribution_form)
        const isTerkirim = p.payment_status === 'pending' && !p.contribution_value && !p.contribution_form

        if (statusFilter === 'terkirim') return isTerkirim
        if (statusFilter === 'komitmen') return isKomitmen
        if (statusFilter === 'lunas') return isLunas
        if (statusFilter === 'batal') return isBatal

        return true
    })

    const formatDate = (dateString: string) => {
        const d = new Date(dateString)
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-playfair text-[#FDFBF7] tracking-wider uppercase drop-shadow-md">
                        Daftar Proposal
                    </h1>
                    <p className="text-sm text-[#D4AF37] mt-1 font-montserrat">
                        Seluruh riwayat proposal dukungan yang telah diterbitkan
                    </p>
                </div>
                <Button 
                    onClick={handleOpenCreate}
                    className="rounded-full bg-[#D4AF37] hover:bg-[#D4AF37]/80 text-[#022c22] font-semibold transition-all shadow-lg hover:shadow-[#D4AF37]/25 gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Buat Proposal Baru
                </Button>
            </div>

            <Card className="bg-[#033B2B]/40 backdrop-blur-xl border border-[#D4AF37]/30 shadow-2xl">
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <CardTitle className="text-[#FDFBF7] font-playfair tracking-wide flex items-center gap-2">
                                <FileText className="h-5 w-5 text-[#D4AF37]" />
                                Riwayat Proposal
                            </CardTitle>
                            <CardDescription className="text-[#A0AEC0]">
                                {filteredProposals.length} proposal ditemukan
                            </CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            {/* Filter Status */}
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-44 bg-[#022c22]/50 border-[#D4AF37]/30 text-[#FDFBF7] focus:border-[#D4AF37]">
                                    <SelectValue placeholder="Filter Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#022c22] border-[#D4AF37]/30 text-[#FDFBF7]">
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="terkirim">Terkirim (Belum Follow Up)</SelectItem>
                                    <SelectItem value="komitmen">Komitmen Dicatat</SelectItem>
                                    <SelectItem value="lunas">Lunas</SelectItem>
                                    <SelectItem value="batal">Batal</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#718096]" />
                                <Input
                                    placeholder="Cari nomor atau nama..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 bg-[#022c22]/50 border-[#D4AF37]/30 text-[#FDFBF7] placeholder:text-[#718096] focus:border-[#D4AF37] focus:ring-[#D4AF37]/20"
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="py-12 flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#D4AF37]" />
                        </div>
                    ) : filteredProposals.length === 0 ? (
                        <div className="py-12 text-center text-[#718096]">
                            <FileText className="mx-auto h-12 w-12 opacity-20 mb-3" />
                            <p>Tidak ada proposal yang ditemukan.</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop View Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-[#D4AF37] uppercase bg-[#022c22]/60 border-y border-[#D4AF37]/20">
                                        <tr>
                                            <th className="px-4 py-4 font-montserrat tracking-wider">No. Proposal</th>
                                            <th className="px-4 py-4 font-montserrat tracking-wider">Tanggal</th>
                                            <th className="px-4 py-4 font-montserrat tracking-wider">Nama Donatur / Sponsor</th>
                                            <th className="px-4 py-4 font-montserrat tracking-wider">Jenis</th>
                                            <th className="px-4 py-4 font-montserrat tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#D4AF37]/10">
                                        {filteredProposals.map((p) => (
                                            <tr 
                                                key={p.id} 
                                                onClick={() => handleOpenView(p)}
                                                className="hover:bg-[#022c22]/40 transition-colors cursor-pointer"
                                            >
                                                <td className="px-4 py-4 font-mono text-[#FDFBF7]/90 font-medium whitespace-nowrap">
                                                    {p.number}
                                                </td>
                                                <td className="px-4 py-4 text-[#A0AEC0] whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(p.created_at)}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="font-semibold text-[#FDFBF7]">{p.name}</div>
                                                    <div className="text-xs text-[#D4AF37] mt-0.5">{p.phone}</div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${p.type === 'donatur' ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : 'border-amber-500/50 text-amber-400 bg-amber-500/10'}`}>
                                                        {p.type === 'donatur' ? 'Donatur' : 'Sponsorship'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    {p.payment_status === 'confirmed' ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                            <CheckCircle className="h-3 w-3 mr-1" /> Lunas
                                                        </span>
                                                    ) : p.payment_status === 'cancelled' ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                                                            Batal
                                                        </span>
                                                    ) : (p.contribution_value > 0 || p.contribution_form) ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                            Komitmen Dicatat
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                            <Clock className="h-3 w-3 mr-1" /> Terkirim
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile View Cards */}
                            <div className="block md:hidden space-y-4">
                                {filteredProposals.map((p) => (
                                    <div 
                                        key={p.id}
                                        onClick={() => handleOpenView(p)}
                                        className="p-4 bg-[#022c22]/40 border border-[#D4AF37]/20 rounded-xl hover:bg-[#022c22]/60 active:bg-[#022c22]/70 transition-colors cursor-pointer space-y-3"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-mono text-sm font-semibold text-[#FDFBF7]">
                                                {p.number}
                                            </span>
                                            <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${p.type === 'donatur' ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : 'border-amber-500/50 text-amber-400 bg-amber-500/10'}`}>
                                                {p.type === 'donatur' ? 'Donatur' : 'Sponsor'}
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-1">
                                            <div className="font-bold text-[#FDFBF7] text-base">{p.name}</div>
                                            {p.company_name && (
                                                <div className="text-xs text-white/60">{p.company_name}</div>
                                            )}
                                            <div className="text-xs text-[#D4AF37] font-medium">{p.phone}</div>
                                        </div>
                                        
                                        <div className="flex justify-between items-center pt-2 border-t border-[#D4AF37]/10 text-xs">
                                            <div className="text-[#A0AEC0] flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {formatDate(p.created_at)}
                                            </div>
                                            <div>
                                                {p.payment_status === 'confirmed' ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        <CheckCircle className="h-3 w-3 mr-1" /> Lunas
                                                    </span>
                                                ) : p.payment_status === 'cancelled' ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                                                        Batal
                                                    </span>
                                                ) : (p.contribution_value > 0 || p.contribution_form) ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                        Komitmen Dicatat
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                        <Clock className="h-3 w-3 mr-1" /> Terkirim
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Custom Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-2xl bg-[#022c22] border border-[#D4AF37]/30 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/20 bg-[#033B2B]/40">
                            <div>
                                <h2 className="text-xl font-bold font-playfair text-[#FDFBF7]">
                                    {formData.id ? (isEditMode ? 'Edit Proposal' : 'Detail Proposal') : 'Tambah Proposal Baru'}
                                </h2>
                                <p className="text-xs text-[#D4AF37] mt-0.5">
                                    {formData.number || 'Draft Proposal'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {formData.id && selectedProposal?.proposal_pdf_url && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(selectedProposal.proposal_pdf_url, '_blank')}
                                        className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#022c22] h-8 gap-1.5 rounded-full"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                        Lihat PDF
                                    </Button>
                                )}
                                {formData.id && selectedProposal?.commitment_pdf_url && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(selectedProposal.commitment_pdf_url, '_blank')}
                                        className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-[#022c22] h-8 gap-1.5 rounded-full"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                        Lihat Surat Komitmen
                                    </Button>
                                )}
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => setIsOpen(false)}
                                    className="text-[#FDFBF7]/60 hover:text-[#FDFBF7] hover:bg-[#D4AF37]/10"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {!formData.id && (
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'donatur' })}
                                        className={`p-4 rounded-xl border text-center transition-all ${formData.type === 'donatur' ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]' : 'bg-[#033B2B]/20 border-[#D4AF37]/20 text-[#FDFBF7]/60'}`}
                                    >
                                        <FileText className="mx-auto h-6 w-6 mb-2" />
                                        Donatur
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'sponsorship' })}
                                        className={`p-4 rounded-xl border text-center transition-all ${formData.type === 'sponsorship' ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]' : 'bg-[#033B2B]/20 border-[#D4AF37]/20 text-[#FDFBF7]/60'}`}
                                    >
                                        <Users className="mx-auto h-6 w-6 mb-2" />
                                        Sponsorship
                                    </button>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs text-[#D4AF37]">Nama Donatur / Sponsor</Label>
                                    <Input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        disabled={!isEditMode}
                                        className="bg-[#033B2B]/40 border-[#D4AF37]/20 text-[#FDFBF7]"
                                    />
                                </div>
                                {formData.type === 'donatur' && (
                                    <>
                                        <div>
                                            <Label className="text-xs text-[#D4AF37]">Nama untuk Buku Acara</Label>
                                            <Input
                                                name="display_name"
                                                value={formData.display_name}
                                                onChange={handleInputChange}
                                                disabled={!isEditMode}
                                                className="bg-[#033B2B]/40 border-[#D4AF37]/20 text-[#FDFBF7]"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label className="text-xs text-[#D4AF37]">Perusahaan / Komunitas / Keluarga (Opsional)</Label>
                                            <Input
                                                name="company_name"
                                                value={formData.company_name}
                                                onChange={handleInputChange}
                                                disabled={!isEditMode}
                                                placeholder="Contoh: Keluarga Rondonuwu, PT Aman Berkat"
                                                className="bg-[#033B2B]/40 border-[#D4AF37]/20 text-[#FDFBF7]"
                                            />
                                        </div>
                                    </>
                                )}
                                <div>
                                    <Label className="text-xs text-[#D4AF37]">WhatsApp (Format: 628xxx)</Label>
                                    <Input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        disabled={!isEditMode}
                                        className="bg-[#033B2B]/40 border-[#D4AF37]/20 text-[#FDFBF7]"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-[#D4AF37]">Asal Jemaat / Wilayah</Label>
                                    <Input
                                        name="congregation"
                                        value={formData.congregation}
                                        onChange={handleInputChange}
                                        disabled={!isEditMode}
                                        placeholder="GPIB Jemaat / Wilayah (Opsional)"
                                        className="bg-[#033B2B]/40 border-[#D4AF37]/20 text-[#FDFBF7]"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-[#D4AF37]">Email (Opsional)</Label>
                                    <Input
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled={!isEditMode}
                                        placeholder="donatur@email.com"
                                        className="bg-[#033B2B]/40 border-[#D4AF37]/20 text-[#FDFBF7]"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-[#D4AF37]">Nilai Kemitraan (Rp)</Label>
                                    <Input
                                        name="contribution_value"
                                        value={formData.contribution_value ? new Intl.NumberFormat('id-ID').format(Number(formData.contribution_value)) : ''}
                                        onChange={handleCurrencyChange}
                                        disabled={!isEditMode}
                                        className="bg-[#033B2B]/40 border-[#D4AF37]/20 text-[#FDFBF7] font-semibold text-amber-400"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs text-[#D4AF37]">Bahasa PDF</Label>
                                    <Select 
                                        disabled={!isEditMode}
                                        value={formData.lang} 
                                        onValueChange={(val) => setFormData({ ...formData, lang: val })}
                                    >
                                        <SelectTrigger className="bg-[#033B2B]/40 border-[#D4AF37]/20 text-[#FDFBF7]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#022c22] border-[#D4AF37]/30 text-[#FDFBF7]">
                                            <SelectItem value="id">Indonesia</SelectItem>
                                            <SelectItem value="en">English</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-xs text-[#D4AF37]">Status Pembayaran</Label>
                                    <Select 
                                        disabled={!isEditMode}
                                        value={formData.payment_status} 
                                        onValueChange={(val) => setFormData({ ...formData, payment_status: val })}
                                    >
                                        <SelectTrigger className="bg-[#033B2B]/40 border-[#D4AF37]/20 text-[#FDFBF7]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#022c22] border-[#D4AF37]/30 text-[#FDFBF7]">
                                            <SelectItem value="pending">Terkirim / Dicatat</SelectItem>
                                            <SelectItem value="confirmed">Lunas</SelectItem>
                                            <SelectItem value="cancelled">Batal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {(formData.type === 'donatur' || formData.type === 'sponsorship') && (
                                    <>
                                        <div>
                                            <Label className="text-xs text-[#D4AF37]">Jenis Komitmen</Label>
                                            <Select 
                                                disabled={!isEditMode}
                                                value={formData.contribution_form} 
                                                onValueChange={(val) => setFormData({ ...formData, contribution_form: val })}
                                            >
                                                <SelectTrigger className="bg-[#033B2B]/40 border-[#D4AF37]/20 text-[#FDFBF7]">
                                                    <SelectValue placeholder="Pilih jenis komitmen..." />
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

                                        {formData.type === 'donatur' && (
                                            <div>
                                                <Label className="text-xs text-[#D4AF37]">Kategori Donatur</Label>
                                                <Select 
                                                    disabled={!isEditMode}
                                                    value={formData.donatur_category} 
                                                    onValueChange={(val) => setFormData({ ...formData, donatur_category: val })}
                                                >
                                                    <SelectTrigger className="bg-[#033B2B]/40 border-[#D4AF37]/20 text-[#FDFBF7]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[#022c22] border-[#D4AF37]/30 text-[#FDFBF7]">
                                                        <SelectItem value="sahabat_bakti">Sahabat Bakti (Rp500Rb+)</SelectItem>
                                                        <SelectItem value="sahabat_teladan">Sahabat Teladan (Rp1Jt+)</SelectItem>
                                                        <SelectItem value="sahabat_pelayanan">Sahabat Pelayan (Rp2.5Jt+)</SelectItem>
                                                        <SelectItem value="sahabat_berkat">Sahabat Berkat (Rp5Jt+)</SelectItem>
                                                        <SelectItem value="sahabat_kasih">Sahabat Kasih (Rp10Jt+)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {formData.type === 'sponsorship' && (
                                            <div>
                                                <Label className="text-xs text-[#D4AF37]">Paket Sponsor</Label>
                                                <Select 
                                                    disabled={!isEditMode}
                                                    value={formData.sponsor_package} 
                                                    onValueChange={(val) => setFormData({ ...formData, sponsor_package: val })}
                                                >
                                                    <SelectTrigger className="bg-[#033B2B]/40 border-[#D4AF37]/20 text-[#FDFBF7]">
                                                        <SelectValue placeholder="Pilih paket..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[#022c22] border-[#D4AF37]/30 text-[#FDFBF7]">
                                                        <SelectItem value="platinum">Platinum (Rp50Jt+)</SelectItem>
                                                        <SelectItem value="gold">Emas / Gold (Rp25Jt+)</SelectItem>
                                                        <SelectItem value="silver">Perak / Silver (Rp15Jt+)</SelectItem>
                                                        <SelectItem value="bronze">Perunggu / Bronze (Rp5Jt+)</SelectItem>
                                                        <SelectItem value="in_kind">In-Kind (Barang/Jasa)</SelectItem>
                                                        <SelectItem value="donatur">Partisipasi (Bebas)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        <div className="md:col-span-2">
                                            <Label className="text-xs text-[#D4AF37]">Dukungan Spesifik</Label>
                                            <Select
                                                disabled={!isEditMode}
                                                value={formData.specific_support}
                                                onValueChange={(val) => setFormData({ ...formData, specific_support: val })}
                                            >
                                                <SelectTrigger className="bg-[#033B2B]/40 border-[#D4AF37]/20 text-[#FDFBF7]">
                                                    <SelectValue placeholder="Pilih dukungan spesifik..." />
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
                                    </>
                                )}
                                <div className="md:col-span-2">
                                    <Label className="text-xs text-[#D4AF37]">Panitia Penanggung Jawab</Label>
                                    <Select 
                                        disabled={!isEditMode}
                                        value={formData.committee_id} 
                                        onValueChange={(val) => setFormData({ ...formData, committee_id: val })}
                                    >
                                        <SelectTrigger className="bg-[#033B2B]/40 border-[#D4AF37]/20 text-[#FDFBF7]">
                                            <SelectValue placeholder="Pilih Penanggung Jawab..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#022c22] border-[#D4AF37]/30 text-[#FDFBF7]">
                                            {committees.map((comm) => (
                                                <SelectItem key={comm.id} value={comm.id}>
                                                    {comm.name} ({comm.role})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="md:col-span-2">
                                    <Label className="text-xs text-[#D4AF37]">Ucapan / Harapan untuk Buku Acara (Maks 40 Kata)</Label>
                                    <Textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        disabled={!isEditMode}
                                        rows={3}
                                        className="bg-[#033B2B]/40 border-[#D4AF37]/20 text-[#FDFBF7] focus:ring-[#D4AF37]"
                                    />
                                </div>
                                {formData.id && (
                                    <div className="md:col-span-2 border-t border-[#D4AF37]/25 pt-4 space-y-2">
                                        <Label className="text-xs text-[#D4AF37] font-semibold flex items-center gap-1.5">
                                            <FileText className="h-4 w-4" /> Bukti Pembayaran
                                        </Label>
                                        {formData.payment_proof_url ? (
                                            <div className="p-3 bg-black/40 rounded-xl border border-[#D4AF37]/20 space-y-3">
                                                {formData.payment_proof_url.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                                                    <div className="relative group rounded-lg overflow-hidden border border-emerald-500/10 max-h-48 bg-black/60 flex justify-center items-center p-2">
                                                        <img 
                                                            src={formData.payment_proof_url} 
                                                            alt="Bukti Pembayaran" 
                                                            className="max-h-44 object-contain"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2.5 p-3 bg-[#022c22]/40 rounded-lg border border-[#D4AF37]/20 text-[#FDFBF7]">
                                                        <FileText className="h-5 w-5 text-[#D4AF37] shrink-0" />
                                                        <div className="text-xs truncate flex-1 font-medium">Dokumen Bukti Pembayaran</div>
                                                    </div>
                                                )}
                                                <div className="flex gap-2.5">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => window.open(formData.payment_proof_url, '_blank')}
                                                        className="flex-1 text-xs border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/15 h-8 rounded-full font-medium"
                                                    >
                                                        Buka / Unduh
                                                    </Button>
                                                    {isEditMode && (
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
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-black/30 border border-dashed border-[#D4AF37]/30 rounded-lg text-center flex flex-col items-center justify-center space-y-2">
                                                <span className="text-xs text-white/50">Belum ada bukti pembayaran yang diunggah</span>
                                                {isEditMode ? (
                                                    <>
                                                        <Label 
                                                            htmlFor="upload_proof" 
                                                            className="cursor-pointer bg-[#D4AF37]/20 border border-[#D4AF37]/40 hover:bg-[#D4AF37]/30 text-[#D4AF37] px-3.5 py-1.5 text-xs rounded-full font-semibold transition-all inline-block"
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
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-[#D4AF37]/80">Masuk ke mode edit untuk mengunggah bukti</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer / Action buttons */}
                        <div className="px-6 py-4 bg-[#033B2B]/40 border-t border-[#D4AF37]/20 flex flex-wrap justify-between items-center gap-4 rounded-b-2xl">
                            <div>
                                {formData.id && (
                                    <Button
                                        variant="outline"
                                        onClick={() => handleDelete()}
                                        disabled={modalSubmitting}
                                        className="border-red-500/50 text-red-400 hover:bg-red-500/20 hover:text-red-400"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Hapus
                                    </Button>
                                )}
                            </div>

                            <div className="flex gap-3">
                                {formData.id && !isEditMode && formData.payment_status === 'pending' && (
                                    <Button
                                        onClick={handleConfirmPayment}
                                        disabled={modalSubmitting}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                                    >
                                        {modalSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                                        Konfirmasi Lunas
                                    </Button>
                                )}
                                
                                {isEditMode ? (
                                    <>
                                        <Button
                                            variant="ghost"
                                            onClick={() => {
                                                if (formData.id) {
                                                    setIsEditMode(false)
                                                } else {
                                                    setIsOpen(false)
                                                }
                                            }}
                                            disabled={modalSubmitting}
                                            className="text-[#FDFBF7]/60 hover:text-[#FDFBF7] hover:bg-[#D4AF37]/10"
                                        >
                                            Batal
                                        </Button>
                                        <Button
                                            onClick={handleSave}
                                            disabled={modalSubmitting}
                                            className="bg-[#D4AF37] hover:bg-[#D4AF37]/80 text-[#022c22] font-semibold"
                                        >
                                            {modalSubmitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                                            Simpan
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        onClick={() => setIsEditMode(true)}
                                        className="bg-[#D4AF37] hover:bg-[#D4AF37]/80 text-[#022c22] font-semibold"
                                    >
                                        <Edit2 className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-100">
                    <div className="relative w-full max-w-md bg-[#022c22] border border-red-500/30 rounded-2xl shadow-2xl p-6 space-y-4">
                        <div className="flex items-center gap-3 text-red-400">
                            <Trash2 className="h-6 w-6" />
                            <h3 className="text-lg font-bold font-playfair text-[#FDFBF7]">Hapus Proposal?</h3>
                        </div>
                        <p className="text-sm text-[#A0AEC0] leading-relaxed">
                            Apakah Anda yakin ingin menghapus proposal <span className="font-mono text-[#FDFBF7] font-semibold">{selectedProposal?.number}</span> secara permanen? Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                variant="ghost"
                                onClick={() => setShowDeleteConfirm(false)}
                                className="text-[#FDFBF7]/60 hover:text-[#FDFBF7] hover:bg-[#D4AF37]/10"
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={() => handleDelete(true)}
                                className="bg-red-600 hover:bg-red-500 text-white font-semibold"
                            >
                                Hapus Permanen
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
