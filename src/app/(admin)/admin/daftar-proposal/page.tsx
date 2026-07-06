'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, FileText, ExternalLink, Calendar, CheckCircle, Clock, Edit2, Trash2, Plus, X, Loader2, Users, MessageCircle, Printer, Download, ArrowUp, ArrowDown } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import { toast } from 'sonner'
import { getNextNumber } from '@/lib/numbering'
import { buildWhatsAppLink } from '@/lib/whatsapp'

export default function DaftarProposalPage() {
    const [proposals, setProposals] = useState<any[]>([])
    const [committees, setCommittees] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [isMounted, setIsMounted] = useState(false)
    
    // Modal states
    const [isOpen, setIsOpen] = useState(false)
    const [selectedProposal, setSelectedProposal] = useState<any | null>(null)
    const [isEditMode, setIsEditMode] = useState(false)
    const [modalSubmitting, setModalSubmitting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [uploadingProof, setUploadingProof] = useState(false)

    const [statusFilter, setStatusFilter] = useState('all')
    const [typeFilter, setTypeFilter] = useState<'all' | 'donatur' | 'sponsorship'>('all')
    const [sortField, setSortField] = useState<'number' | 'date' | 'name' | 'type' | 'status'>('date')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

    const handleSort = (field: 'number' | 'date' | 'name' | 'type' | 'status') => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('desc')
        }
    }

    // Form states
    const [formData, setFormData] = useState({
        id: '',
        type: 'donatur',
        number: '',
        name: '',
        display_name: '',
        company_name: '',
        pic_name: '',
        pic_position: '',
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
        commitment_pdf_url: '',
        proposal_date: '',
        confirmed_date: '',
        paid_date: ''
    })

    useEffect(() => {
        setIsMounted(true)
        fetchProposals()
        fetchCommittees()
    }, [])

    const fetchProposals = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('proposals')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching proposals:', error)
                toast.error('Gagal mengambil data proposal: ' + error.message)
            } else {
                setProposals(data || [])
            }
        } catch (error: any) {
            console.error('Unexpected error fetching proposals:', error)
            toast.error('Terjadi kesalahan koneksi database: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const fetchCommittees = async () => {
        try {
            const { data, error } = await supabase
                .from('committees')
                .select('*')
                .eq('is_active', true)
                .order('name', { ascending: true })
            
            if (error) {
                console.error('Error fetching committees:', error)
            } else if (data) {
                setCommittees(data)
            }
        } catch (error: any) {
            console.error('Unexpected error fetching committees:', error)
        }
    }

    const handleDownloadLpj = async () => {
        const loadingToast = toast.loading('Sedang menyiapkan Laporan LPJ...')
        try {
            const queryParams = new URLSearchParams()
            if (statusFilter !== 'all') queryParams.append('status', statusFilter)
            if (searchQuery) queryParams.append('q', searchQuery)
            
            const res = await fetch(`/api/generate-lpj?${queryParams.toString()}`)
            if (!res.ok) throw new Error('Gagal mengunduh file')
            
            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `Laporan_LPJ_HUT16_PKLU_${new Date().toISOString().split('T')[0]}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            toast.dismiss(loadingToast)
            toast.success('Laporan LPJ berhasil diunduh!')
        } catch (err: any) {
            toast.dismiss(loadingToast)
            toast.error('Gagal mengunduh Laporan LPJ: ' + err.message)
        }
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
            pic_name: proposal.pic_name || '',
            pic_position: proposal.pic_position || '',
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
            commitment_pdf_url: proposal.commitment_pdf_url || '',
            proposal_date: proposal.proposal_date || '',
            confirmed_date: proposal.confirmed_date || '',
            paid_date: proposal.paid_date || ''
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
            pic_name: '',
            pic_position: '',
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
            commitment_pdf_url: '',
            proposal_date: new Date().toISOString().split('T')[0],
            confirmed_date: '',
            paid_date: ''
        })
        setIsOpen(true)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
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

        if (formData.payment_status === 'confirmed') {
            toast.error('Bukti pembayaran tidak dapat dihapus saat status Lunas. Silakan ubah status pembayaran terlebih dahulu.')
            return
        }

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

    const handleDownloadProposal = async () => {
        if (!selectedProposal) return
        try {
            toast.loading('Menyiapkan file unduhan...', { id: 'download-proposal' })
            const response = await fetch('/api/generate-proposal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedProposal.id, lang: formData.lang })
            })
            if (!response.ok) {
                const errJson = await response.json().catch(() => ({}))
                throw new Error(errJson.error || 'Gagal mengunduh proposal')
            }
            const blob = await response.blob()
            const blobUrl = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = blobUrl
            a.download = `Proposal_${selectedProposal.type}_${selectedProposal.number.replace(/\//g, '_')}.pdf`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(blobUrl)
            toast.success('Berhasil mengunduh proposal', { id: 'download-proposal' })
        } catch (error: any) {
            toast.error('Gagal mengunduh proposal: ' + error.message, { id: 'download-proposal' })
        }
    }

    const handleDownloadToken = async () => {
        if (!selectedProposal) return
        try {
            toast.loading('Menyiapkan file unduhan...', { id: 'download-token' })
            const response = await fetch('/api/generate-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedProposal.id, lang: formData.lang })
            })
            if (!response.ok) {
                const errJson = await response.json().catch(() => ({}))
                throw new Error(errJson.error || 'Gagal mengunduh tanda penghargaan')
            }
            const blob = await response.blob()
            const blobUrl = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = blobUrl
            a.download = `TandaPenghargaan_${selectedProposal.type}_${selectedProposal.number.replace(/\//g, '_')}_${formData.lang}.pdf`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(blobUrl)
            toast.success('Berhasil mengunduh tanda penghargaan', { id: 'download-token' })
        } catch (error: any) {
            toast.error('Gagal mengunduh tanda penghargaan: ' + error.message, { id: 'download-token' })
        }
    }

    const handleDownloadCommitment = async () => {
        if (!selectedProposal) return
        try {
            toast.loading('Menyiapkan file unduhan...', { id: 'download-commitment' })
            const response = await fetch('/api/generate-commitment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedProposal.id, lang: formData.lang })
            })
            if (!response.ok) {
                const errJson = await response.json().catch(() => ({}))
                throw new Error(errJson.error || 'Gagal mengunduh surat komitmen')
            }
            const blob = await response.blob()
            const blobUrl = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = blobUrl
            a.download = `Commitment_${selectedProposal.type}_${selectedProposal.number.replace(/\//g, '_')}_${formData.lang}.pdf`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(blobUrl)
            toast.success('Berhasil mengunduh surat komitmen', { id: 'download-commitment' })
        } catch (error: any) {
            toast.error('Gagal mengunduh surat komitmen: ' + error.message, { id: 'download-commitment' })
        }
    }

    const sendProposalViaWA = () => {
        if (!selectedProposal) return
        
        const waLink = buildWhatsAppLink(
            formData.phone,
            'proposal',
            formData.lang as 'id' | 'en',
            {
                number: formData.number,
                name: formData.name,
                type: formData.type,
                pdfUrl: null
            }
        )
        window.open(waLink, '_blank', 'noopener,noreferrer')
        toast.success('Membuka WhatsApp...')
    }

    const sendCommitmentViaWA = () => {
        if (!selectedProposal) return
        
        const waLink = buildWhatsAppLink(
            formData.phone,
            'commitment',
            formData.lang as 'id' | 'en',
            {
                name: formData.name,
                commitment_url: null
            }
        )
        window.open(waLink, '_blank', 'noopener,noreferrer')
        toast.success('Membuka WhatsApp...')
    }

    const sendTokenViaWA = () => {
        if (!selectedProposal) return
        
        const waLink = buildWhatsAppLink(
            formData.phone,
            'token',
            formData.lang as 'id' | 'en',
            {
                display_name: formData.display_name || formData.name,
                token_url: null
            }
        )
        window.open(waLink, '_blank', 'noopener,noreferrer')
        toast.success('Membuka WhatsApp...')
    }

    const handleSave = async () => {
        if (!formData.name || !formData.phone || !formData.committee_id) {
            toast.error('Silakan lengkapi data wajib (Nama, WhatsApp, Penanggung Jawab)')
            return
        }

        // Date constraints validation
        if (formData.confirmed_date && formData.proposal_date && formData.confirmed_date < formData.proposal_date) {
            toast.error('Tanggal Konfirmasi tidak boleh sebelum Tanggal Dibuat')
            return
        }

        if (formData.paid_date) {
            if (formData.proposal_date && formData.paid_date < formData.proposal_date) {
                toast.error('Tanggal Lunas tidak boleh sebelum Tanggal Dibuat')
                return
            }
            if (formData.confirmed_date && formData.paid_date < formData.confirmed_date) {
                toast.error('Tanggal Lunas tidak boleh sebelum Tanggal Konfirmasi')
                return
            }
        }

        // Check if confirming payment status as Lunas
        if (formData.payment_status === 'confirmed' && !formData.payment_proof_url) {
            toast.error('Status Lunas wajib melampirkan Bukti Pembayaran terlebih dahulu')
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
                        display_name: formData.type === 'donatur' ? (formData.display_name || formData.name) : null,
                        company_name: formData.company_name || null,
                        pic_name: formData.type === 'sponsorship' ? (formData.pic_name || null) : null,
                        pic_position: formData.type === 'sponsorship' ? (formData.pic_position || null) : null,
                        phone: formData.phone,
                        email: formData.email || null,
                        congregation: formData.type === 'donatur' ? (formData.congregation || null) : null,
                        contribution_value: formData.contribution_value ? Number(formData.contribution_value) : null,
                        contribution_form: formData.contribution_form || null,
                        specific_support: formData.specific_support || null,
                        message: formData.message || null,
                        donatur_category: formData.type === 'donatur' ? (formData.donatur_category || null) : null,
                        sponsor_package: formData.type === 'sponsorship' ? (formData.sponsor_package || null) : null,
                        lang: formData.lang,
                        payment_status: formData.payment_status,
                        confirmed_at: formData.payment_status === 'confirmed' ? (selectedProposal?.confirmed_at || new Date().toISOString()) : null,
                        committee_id: formData.committee_id,
                        proposal_date: formData.proposal_date || null,
                        confirmed_date: formData.confirmed_date || null,
                        paid_date: formData.paid_date || null
                    })
                    .eq('id', formData.id)

                if (updateError) throw updateError



                toast.success('Proposal berhasil diperbarui!')
            } else {
                // Create
                const number = await getNextNumber(formData.type as 'donatur' | 'sponsorship', 2026)
                
                const { data: newProp, error: insertError } = await supabase
                    .from('proposals')
                    .insert({
                        type: formData.type,
                        number: number,
                        name: formData.name,
                        display_name: formData.type === 'donatur' ? (formData.display_name || formData.name) : null,
                        company_name: formData.company_name || null,
                        pic_name: formData.type === 'sponsorship' ? (formData.pic_name || null) : null,
                        pic_position: formData.type === 'sponsorship' ? (formData.pic_position || null) : null,
                        phone: formData.phone,
                        email: formData.email || null,
                        congregation: formData.type === 'donatur' ? (formData.congregation || null) : null,
                        contribution_value: formData.contribution_value ? Number(formData.contribution_value) : null,
                        contribution_form: formData.contribution_form || null,
                        specific_support: formData.specific_support || null,
                        message: formData.message || null,
                        donatur_category: formData.type === 'donatur' ? (formData.donatur_category || null) : null,
                        sponsor_package: formData.type === 'sponsorship' ? (formData.sponsor_package || null) : null,
                        lang: formData.lang,
                        payment_status: formData.payment_status || 'pending',
                        confirmed_at: formData.payment_status === 'confirmed' ? new Date().toISOString() : null,
                        committee_id: formData.committee_id,
                        proposal_date: formData.proposal_date || null,
                        confirmed_date: formData.confirmed_date || null,
                        paid_date: formData.paid_date || null
                    })
                    .select()
                    .single()

                if (insertError) throw insertError


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
        if (!selectedProposal.payment_proof_url && !formData.payment_proof_url) {
            toast.error('Status Lunas wajib melampirkan Bukti Pembayaran terlebih dahulu')
            return
        }
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

            toast.success('Pembayaran berhasil diverifikasi!')
            setIsOpen(false)
            fetchProposals()
        } catch (error: any) {
            toast.error('Gagal memverifikasi pembayaran: ' + error.message)
        } finally {
            setModalSubmitting(false)
        }
    }

    const isPendingRequest = (p: any) => 
        p.specific_support === 'request' && 
        p.payment_status === 'pending' && 
        !p.contribution_value && 
        !p.contribution_form

    const filteredProposals = proposals
        .filter(p => {
            const matchesSearch = p.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.company_name && p.company_name.toLowerCase().includes(searchQuery.toLowerCase()))

            if (!matchesSearch) return false

            // Filter by proposal type
            if (typeFilter !== 'all' && p.type !== typeFilter) {
                return false
            }

            const isLunas = p.payment_status === 'confirmed'
            const isBatal = p.payment_status === 'cancelled'
            const isRequest = p.specific_support === 'request'
            const isKomitmen = p.payment_status === 'pending' && !isRequest && (p.contribution_value > 0 || p.contribution_form)
            const isTerkirim = p.payment_status === 'pending' && !isRequest && !p.contribution_value && !p.contribution_form

            if (statusFilter === 'request') return isRequest
            if (statusFilter === 'terkirim') return isTerkirim
            if (statusFilter === 'komitmen') return isKomitmen
            if (statusFilter === 'lunas') return isLunas
            if (statusFilter === 'batal') return isBatal

            return true
        })
        .sort((a, b) => {
            const aReq = isPendingRequest(a) ? 1 : 0
            const bReq = isPendingRequest(b) ? 1 : 0
            
            // Put pending requests at the top
            if (aReq !== bReq) {
                return bReq - aReq
            }
            
            // Otherwise apply sorting logic
            let comparison = 0
            if (sortField === 'number') {
                comparison = (a.number || '').localeCompare(b.number || '')
            } else if (sortField === 'date') {
                const aTime = new Date(a.proposal_date || a.created_at || 0).getTime()
                const bTime = new Date(b.proposal_date || b.created_at || 0).getTime()
                comparison = aTime - bTime
            } else if (sortField === 'name') {
                comparison = (a.name || '').localeCompare(b.name || '')
            } else if (sortField === 'type') {
                comparison = (a.type || '').localeCompare(b.type || '')
            } else if (sortField === 'status') {
                const getStatusWeight = (p: any) => {
                    if (p.payment_status === 'confirmed') return 4
                    if (p.payment_status === 'cancelled') return 0
                    if (p.specific_support === 'request') return 1
                    if (p.contribution_value > 0 || p.contribution_form) return 3
                    return 2
                }
                comparison = getStatusWeight(a) - getStatusWeight(b)
            }

            return sortDirection === 'asc' ? comparison : -comparison
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
                        Laporan
                    </h1>
                    <p className="text-sm text-[#D4AF37] mt-1 font-montserrat">
                        Seluruh riwayat proposal dukungan yang telah diterbitkan
                    </p>
                </div>
                <div className="flex justify-between items-center w-full md:w-auto gap-3 mt-4 md:mt-0">
                    <Button 
                        variant="outline"
                        onClick={handleDownloadLpj}
                        className="rounded-full border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#022c22] font-semibold transition-all shadow-lg gap-2 cursor-pointer"
                    >
                        <Download className="h-4 w-4" />
                        Laporan
                    </Button>
                    <Link href="/buat-proposal" passHref>
                        <Button 
                            className="rounded-full bg-[#D4AF37] hover:bg-[#D4AF37]/80 text-[#022c22] font-semibold transition-all shadow-lg hover:shadow-[#D4AF37]/25 gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Proposal
                        </Button>
                    </Link>
                </div>
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
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                            {/* Filter Tipe (Radio Buttons Segmented Control) */}
                            <div className="flex items-center h-8 bg-[#022c22]/50 border border-[#D4AF37]/35 rounded-lg p-0.5 gap-1 w-full sm:w-auto justify-around sm:justify-start">
                                {[
                                    { value: 'all', label: 'Semua' },
                                    { value: 'donatur', label: 'Donatur' },
                                    { value: 'sponsorship', label: 'Sponsor' },
                                ].map((type) => (
                                    <button
                                        key={type.value}
                                        onClick={() => setTypeFilter(type.value as any)}
                                        className={`h-full px-3 rounded-md text-xs font-semibold tracking-wider transition-all duration-300 cursor-pointer flex-1 sm:flex-initial text-center flex items-center justify-center ${
                                            typeFilter === type.value
                                                ? 'bg-[#D4AF37] text-[#022c22] shadow-[0_0_10px_rgba(212,175,55,0.25)]'
                                                : 'text-[#FDFBF7]/60 hover:text-[#D4AF37]'
                                        }`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>

                            {/* Filter Status */}
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-44 h-8 bg-[#022c22]/50 border-[#D4AF37]/30 text-[#FDFBF7] focus:border-[#D4AF37]">
                                    <SelectValue placeholder="Filter Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#022c22] border-[#D4AF37]/30 text-[#FDFBF7]">
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="request">Request (Calon Donatur/Sponsor)</SelectItem>
                                    <SelectItem value="terkirim">Terkirim (Belum Follow Up)</SelectItem>
                                    <SelectItem value="komitmen">Komitmen Dicatat</SelectItem>
                                    <SelectItem value="lunas">Lunas</SelectItem>
                                    <SelectItem value="batal">Batal</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Sort Select (Only visible on Mobile View) */}
                            <div className="md:hidden w-full sm:w-auto">
                                <Select 
                                    value={sortField + '_' + sortDirection} 
                                    onValueChange={(val: string) => {
                                        const [field, dir] = val.split('_') as [any, any]
                                        setSortField(field)
                                        setSortDirection(dir)
                                    }}
                                >
                                    <SelectTrigger className="w-full h-8 bg-[#022c22]/50 border-[#D4AF37]/30 text-[#FDFBF7] focus:border-[#D4AF37]">
                                        <SelectValue placeholder="Urutkan" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#022c22] border-[#D4AF37]/30 text-[#FDFBF7]">
                                        <SelectItem value="date_desc">Urutan: Terbaru</SelectItem>
                                        <SelectItem value="date_asc">Urutan: Terlama</SelectItem>
                                        <SelectItem value="name_asc">Nama: A - Z</SelectItem>
                                        <SelectItem value="name_desc">Nama: Z - A</SelectItem>
                                        <SelectItem value="number_asc">No. Proposal: A - Z</SelectItem>
                                        <SelectItem value="number_desc">No. Proposal: Z - A</SelectItem>
                                        <SelectItem value="type_asc">Jenis: A - Z</SelectItem>
                                        <SelectItem value="type_desc">Jenis: Z - A</SelectItem>
                                        <SelectItem value="status_desc">Status: Tinggi - Rendah</SelectItem>
                                        <SelectItem value="status_asc">Status: Rendah - Tinggi</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>



                            <div className="relative w-full sm:w-64 h-8">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#718096]" />
                                <Input
                                    placeholder="Cari nomor atau nama..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-8 bg-[#022c22]/50 border-[#D4AF37]/30 text-[#FDFBF7] placeholder:text-[#718096] focus:border-[#D4AF37] focus:ring-[#D4AF37]/20"
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
                                    <thead className="text-xs text-[#D4AF37] uppercase bg-[#022c22]/60 border-y border-[#D4AF37]/20 select-none">
                                        <tr>
                                            <th 
                                                onClick={() => handleSort('number')}
                                                className="px-4 py-4 font-montserrat tracking-wider cursor-pointer hover:bg-[#022c22]/80 transition-colors group"
                                            >
                                                <div className="flex items-center gap-1">
                                                    <span>No. Proposal</span>
                                                    {sortField === 'number' ? (
                                                        sortDirection === 'asc' ? (
                                                            <ArrowUp className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                                                        ) : (
                                                            <ArrowDown className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                                                        )
                                                    ) : (
                                                        <ArrowDown className="h-3.5 w-3.5 opacity-0 group-hover:opacity-30 transition-opacity text-[#FDFBF7] shrink-0" />
                                                    )}
                                                </div>
                                            </th>
                                            <th 
                                                onClick={() => handleSort('date')}
                                                className="px-4 py-4 font-montserrat tracking-wider cursor-pointer hover:bg-[#022c22]/80 transition-colors group"
                                            >
                                                <div className="flex items-center gap-1">
                                                    <span>Tanggal</span>
                                                    {sortField === 'date' ? (
                                                        sortDirection === 'asc' ? (
                                                            <ArrowUp className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                                                        ) : (
                                                            <ArrowDown className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                                                        )
                                                    ) : (
                                                        <ArrowDown className="h-3.5 w-3.5 opacity-0 group-hover:opacity-30 transition-opacity text-[#FDFBF7] shrink-0" />
                                                    )}
                                                </div>
                                            </th>
                                            <th 
                                                onClick={() => handleSort('name')}
                                                className="px-4 py-4 font-montserrat tracking-wider cursor-pointer hover:bg-[#022c22]/80 transition-colors group"
                                            >
                                                <div className="flex items-center gap-1">
                                                    <span>Nama Donatur / Sponsor</span>
                                                    {sortField === 'name' ? (
                                                        sortDirection === 'asc' ? (
                                                            <ArrowUp className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                                                        ) : (
                                                            <ArrowDown className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                                                        )
                                                    ) : (
                                                        <ArrowDown className="h-3.5 w-3.5 opacity-0 group-hover:opacity-30 transition-opacity text-[#FDFBF7] shrink-0" />
                                                    )}
                                                </div>
                                            </th>
                                            <th 
                                                onClick={() => handleSort('type')}
                                                className="px-4 py-4 font-montserrat tracking-wider cursor-pointer hover:bg-[#022c22]/80 transition-colors group"
                                            >
                                                <div className="flex items-center gap-1">
                                                    <span>Jenis</span>
                                                    {sortField === 'type' ? (
                                                        sortDirection === 'asc' ? (
                                                            <ArrowUp className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                                                        ) : (
                                                            <ArrowDown className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                                                        )
                                                    ) : (
                                                        <ArrowDown className="h-3.5 w-3.5 opacity-0 group-hover:opacity-30 transition-opacity text-[#FDFBF7] shrink-0" />
                                                    )}
                                                </div>
                                            </th>
                                            <th 
                                                onClick={() => handleSort('status')}
                                                className="px-4 py-4 font-montserrat tracking-wider cursor-pointer hover:bg-[#022c22]/80 transition-colors group"
                                            >
                                                <div className="flex items-center gap-1">
                                                    <span>Status</span>
                                                    {sortField === 'status' ? (
                                                        sortDirection === 'asc' ? (
                                                            <ArrowUp className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                                                        ) : (
                                                            <ArrowDown className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                                                        )
                                                    ) : (
                                                        <ArrowDown className="h-3.5 w-3.5 opacity-0 group-hover:opacity-30 transition-opacity text-[#FDFBF7] shrink-0" />
                                                    )}
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#D4AF37]/10">
                                        {filteredProposals.map((p, idx) => (
                                            <motion.tr 
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.3), ease: 'easeOut' }}
                                                key={p.id} 
                                                onClick={() => handleOpenView(p)}
                                                className={`transition-colors cursor-pointer border-l-2 ${
                                                    isPendingRequest(p) 
                                                        ? 'bg-red-500/5 hover:bg-red-500/10 border-l-red-500/30' 
                                                        : 'hover:bg-[#022c22]/40 border-l-transparent'
                                                }`}
                                            >
                                                <td className="px-4 py-4 font-mono text-[#FDFBF7]/90 font-medium whitespace-nowrap">
                                                    {p.number}
                                                </td>
                                                <td className="px-4 py-4 text-[#A0AEC0] whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(p.proposal_date || p.created_at)}
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
                                                    ) : isPendingRequest(p) ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/25 animate-pulse">
                                                            Butuh Follow Up
                                                        </span>
                                                    ) : p.specific_support === 'request' ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                            Request
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
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
 
                             {/* Mobile View Cards */}
                             <div className="block md:hidden space-y-4">
                                 {filteredProposals.map((p, idx) => (
                                     <motion.div 
                                         initial={{ opacity: 0, y: 12 }}
                                         animate={{ opacity: 1, y: 0 }}
                                         transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.3), ease: 'easeOut' }}
                                         key={p.id}
                                         onClick={() => handleOpenView(p)}
                                         className={`p-4 rounded-xl transition-colors cursor-pointer space-y-3 border ${
                                             isPendingRequest(p) 
                                                 ? 'bg-red-500/5 border-red-500/25 hover:bg-red-500/10' 
                                                 : 'bg-[#022c22]/40 border-[#D4AF37]/20 hover:bg-[#022c22]/60 active:bg-[#022c22]/70'
                                         }`}
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
                                                 {formatDate(p.proposal_date || p.created_at)}
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
                                                 ) : isPendingRequest(p) ? (
                                                     <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/25 animate-pulse">
                                                         Butuh Follow Up
                                                     </span>
                                                 ) : p.specific_support === 'request' ? (
                                                     <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                         Request
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
                                     </motion.div>
                                 ))}
                             </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Custom Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 pb-20 md:pb-0">
                    <div className="relative w-full max-w-2xl bg-[#022c22] border-t md:border border-[#D4AF37]/30 rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] md:max-h-[90vh] mt-auto md:mt-0">
                        {/* Header */}
                        <div className="flex flex-col gap-3 px-6 py-4 border-b border-[#D4AF37]/20 bg-[#033B2B]/40">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-bold font-playfair text-[#FDFBF7]">
                                        {formData.id ? (isEditMode ? 'Edit Proposal' : 'Detail Proposal') : 'Tambah Proposal Baru'}
                                    </h2>
                                    <p className="text-xs text-[#D4AF37] mt-0.5">
                                        {formData.number || 'Draft Proposal'}
                                    </p>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => setIsOpen(false)}
                                    className="text-[#FDFBF7]/60 hover:text-[#FDFBF7] hover:bg-[#D4AF37]/10"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* Document Actions Row */}
                            {formData.id && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#D4AF37]/10">
                                    <div className="flex items-center justify-between bg-black/20 p-2 rounded-lg border border-[#D4AF37]/20">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37]">
                                            <FileText className="h-4 w-4" />
                                            Proposal
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleDownloadProposal}
                                                className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#022c22] h-7 px-2 text-xs rounded-l-full rounded-r-none"
                                            >
                                                Unduh
                                            </Button>
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={sendProposalViaWA}
                                                className="border-[#D4AF37]/50 text-[#022c22] bg-[#D4AF37] hover:bg-[#D4AF37]/80 h-7 px-2 text-xs rounded-r-full rounded-l-none"
                                            >
                                                <MessageCircle className="h-3 w-3 mr-1" /> WA
                                            </Button>
                                        </div>
                                    </div>

                                    {(formData.contribution_form || (formData.contribution_value && Number(formData.contribution_value) > 0)) && (
                                        <div className="flex items-center justify-between bg-black/20 p-2 rounded-lg border border-blue-500/20">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                                                <FileText className="h-4 w-4" />
                                                Konfirmasi & Thank You
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleDownloadCommitment}
                                                    className="border-blue-400/50 text-blue-400 hover:bg-blue-400 hover:text-[#022c22] h-7 px-2 text-xs rounded-l-full rounded-r-none"
                                                >
                                                    Unduh
                                                </Button>
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={sendCommitmentViaWA}
                                                    className="border-blue-400/50 text-[#022c22] bg-blue-400 hover:bg-blue-400/80 h-7 px-2 text-xs rounded-r-full rounded-l-none"
                                                >
                                                    <MessageCircle className="h-3 w-3 mr-1" /> WA
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {formData.payment_status === 'confirmed' && (
                                        <div className="flex items-center justify-between bg-black/20 p-2 rounded-lg border border-emerald-500/20">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                                                <FileText className="h-4 w-4" />
                                                Tanda Penghargaan
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleDownloadToken}
                                                    className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-[#022c22] h-7 px-2 text-xs rounded-l-full rounded-r-none"
                                                >
                                                    Unduh
                                                </Button>
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={sendTokenViaWA}
                                                    className="border-emerald-500/50 text-[#022c22] bg-emerald-500 hover:bg-emerald-500/80 h-7 px-2 text-xs rounded-r-full rounded-l-none"
                                                >
                                                    <MessageCircle className="h-3 w-3 mr-1" /> WA
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {!formData.id && (
                                <div className="space-y-4">
                                    <h3 className="text-[#D4AF37] font-semibold text-sm border-b border-[#D4AF37]/20 pb-2 flex items-center gap-2">
                                        Pilih Jenis Proposal
                                    </h3>
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
                                </div>
                            )}

                            {/* Section 1: Pengaturan Proposal */}
                            <div className="space-y-4">
                                <h3 className="text-[#D4AF37] font-semibold text-sm border-b border-[#D4AF37]/20 pb-2 flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-xs">1</span>
                                    Pengaturan & Status
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    {formData.id && (
                                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#D4AF37]/10 text-xs text-[#FDFBF7]">
                                            <div>
                                                <Label className="text-[10px] text-[#D4AF37]/80 uppercase tracking-wide">Tanggal Dibuat</Label>
                                                <Input
                                                    type="date"
                                                    name="proposal_date"
                                                    value={formData.proposal_date}
                                                    onChange={(e) => setFormData({ ...formData, proposal_date: e.target.value })}
                                                    disabled={!isEditMode}
                                                    className="bg-[#033B2B]/40 border-[#D4AF37]/20 text-[#FDFBF7] mt-1 [color-scheme:dark]"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-[10px] text-[#D4AF37]/80 uppercase tracking-wide">Tanggal Dikonfirmasi</Label>
                                                <Input
                                                    type="date"
                                                    name="confirmed_date"
                                                    value={formData.confirmed_date}
                                                    onChange={(e) => setFormData({ ...formData, confirmed_date: e.target.value })}
                                                    disabled={!isEditMode}
                                                    className="bg-[#033B2B]/40 border-[#D4AF37]/20 text-[#FDFBF7] mt-1 [color-scheme:dark]"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-[10px] text-[#D4AF37]/80 uppercase tracking-wide">Tanggal Lunas</Label>
                                                <Input
                                                    type="date"
                                                    name="paid_date"
                                                    value={formData.paid_date}
                                                    onChange={(e) => setFormData({ ...formData, paid_date: e.target.value })}
                                                    disabled={!isEditMode}
                                                    className="bg-[#033B2B]/40 border-[#D4AF37]/20 text-[#FDFBF7] mt-1 [color-scheme:dark]"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section 2: Informasi Target */}
                            <div className="space-y-4">
                                <h3 className="text-[#D4AF37] font-semibold text-sm border-b border-[#D4AF37]/20 pb-2 flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-xs">2</span>
                                    Informasi Target Dukungan
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs text-[#D4AF37]">
                                            {formData.type === 'donatur' ? 'Nama Lengkap Donatur' : 'Nama Sponsor / Perusahaan / Lembaga'}
                                        </Label>
                                        <Input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            disabled={!isEditMode}
                                            placeholder={formData.type === 'donatur' ? 'Cth: Bpk Budi Santoso' : 'Cth: PT Bank Mandiri'}
                                            className="bg-[#033B2B]/40 border-[#D4AF37]/20 text-[#FDFBF7]"
                                        />
                                    </div>
                                    {formData.type === 'donatur' ? (
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
                                                <Label className="text-xs text-[#D4AF37]">Perusahaan / Komunitas (Opsional)</Label>
                                                <Input
                                                    name="company_name"
                                                    value={formData.company_name}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditMode}
                                                    placeholder="Contoh: Keluarga Bpk. Santoso, PT Aman Berkat"
                                                    className="bg-[#033B2B]/40 border-[#D4AF37]/20 text-[#FDFBF7]"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <Label className="text-xs text-[#D4AF37]">Nama Penanggung Jawab (PIC)</Label>
                                                <Input
                                                    name="pic_name"
                                                    value={formData.pic_name || ''}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditMode}
                                                    placeholder="Cth: Ibu Rina Wijaya"
                                                    className="bg-[#033B2B]/40 border-[#D4AF37]/20 text-[#FDFBF7]"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <Label className="text-xs text-[#D4AF37]">Jabatan PIC</Label>
                                                <Input
                                                    name="pic_position"
                                                    value={formData.pic_position || ''}
                                                    onChange={handleInputChange}
                                                    disabled={!isEditMode}
                                                    placeholder="Cth: Manager CSR / Humas"
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
                                    {formData.type === 'donatur' && (
                                        <div className="md:col-span-2">
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
                                    )}
                                </div>
                            </div>

                            {/* Section 3: Data Komitmen */}
                            <div className="space-y-4">
                                <h3 className="text-[#D4AF37] font-semibold text-sm border-b border-[#D4AF37]/20 pb-2 flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-xs">3</span>
                                    Rincian Dukungan
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                </div>
                            </div>

                            {/* Section 4: Bukti Pembayaran */}
                            {formData.id && (
                                <div className="space-y-4">
                                    <h3 className="text-[#D4AF37] font-semibold text-sm border-b border-[#D4AF37]/20 pb-2 flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-xs">4</span>
                                        Dokumen & Bukti
                                    </h3>
                                    <div className="space-y-2">
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
                                </div>
                            )}
                        </div>

                        {/* Footer / Action buttons */}
                        <div className="px-6 py-4 bg-[#033B2B]/40 border-t border-[#D4AF37]/20 flex flex-wrap justify-between items-center gap-4 md:rounded-b-2xl">
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
