'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Heart,
    Users,
    FileText,
    Trophy,
    CheckCircle,
    Send,
    Plus
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

import { motion } from 'framer-motion'

export default function DashboardPage() {
    const [stats, setStats] = useState({
        donatur: 0,
        sponsorship: 0,
        confirmed: 0,
        tokens: 0
    })

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Get count of donatur
                const { count: donaturCount } = await supabase
                    .from('proposals')
                    .select('*', { count: 'exact', head: true })
                    .eq('type', 'donatur')

                // Get count of sponsorship
                const { count: sponsorshipCount } = await supabase
                    .from('proposals')
                    .select('*', { count: 'exact', head: true })
                    .eq('type', 'sponsorship')

                // Get count of confirmed payments
                const { count: confirmedCount } = await supabase
                    .from('proposals')
                    .select('*', { count: 'exact', head: true })
                    .eq('payment_status', 'confirmed')

                // Get count of tokens
                const { count: tokensCount } = await supabase
                    .from('proposals')
                    .select('*', { count: 'exact', head: true })
                    .neq('token_pdf_url', null)

                setStats({
                    donatur: donaturCount || 0,
                    sponsorship: sponsorshipCount || 0,
                    confirmed: confirmedCount || 0,
                    tokens: tokensCount || 0
                })
            } catch (error) {
                console.error('Error fetching stats:', error)
            }
        }

        fetchStats()
    }, [])

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
    }

    return (
        <div className="container mx-auto max-w-7xl">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center mb-8"
            >
                <h1 className="text-3xl font-bold text-[#FDFBF7] tracking-wide">
                    Dashboard Panitia
                </h1>
            </motion.div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
                <motion.div variants={itemVariants}>
                    <Card className="border-emerald shadow-emerald h-full transition-transform hover:scale-105 duration-300 cursor-default">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-[#FDFBF7]/80 uppercase tracking-wider">Proposal Donatur</CardTitle>
                            <Heart className="h-4 w-4 text-[#D4AF37]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-[#D4AF37]">{stats.donatur}</div>
                            <p className="text-xs text-[#FDFBF7]/50 mt-1">
                                Terdaftar di sistem
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="border-emerald shadow-emerald h-full transition-transform hover:scale-105 duration-300 cursor-default">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-[#FDFBF7]/80 uppercase tracking-wider">Sponsorship</CardTitle>
                            <Users className="h-4 w-4 text-[#D4AF37]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-[#D4AF37]">{stats.sponsorship}</div>
                            <p className="text-xs text-[#FDFBF7]/50 mt-1">
                                Terdaftar di sistem
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="border-emerald shadow-emerald h-full transition-transform hover:scale-105 duration-300 cursor-default">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-[#FDFBF7]/80 uppercase tracking-wider">Terkonfirmasi</CardTitle>
                            <CheckCircle className="h-4 w-4 text-[#D4AF37]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-[#D4AF37]">{stats.confirmed}</div>
                            <p className="text-xs text-[#FDFBF7]/50 mt-1">
                                Pembayaran lunas
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="border-emerald shadow-emerald h-full transition-transform hover:scale-105 duration-300 cursor-default">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-[#FDFBF7]/80 uppercase tracking-wider">Token</CardTitle>
                            <Trophy className="h-4 w-4 text-[#D4AF37]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-[#D4AF37]">{stats.tokens}</div>
                            <p className="text-xs text-[#FDFBF7]/50 mt-1">
                                Penghargaan dibuat
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
                <motion.div variants={itemVariants}>
                    <Card className="border-emerald shadow-emerald relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/5 to-[#D4AF37]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-[#FDFBF7] flex items-center">
                                <FileText className="mr-2 h-5 w-5 text-[#D4AF37]" />
                                Proposal Donatur
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-[#FDFBF7]/60 mb-6 text-sm">
                                Kelola pendaftaran proposal donatur baru dan verifikasi pembayaran.
                            </p>
                            <Button
                                asChild
                                className="emerald-button w-full justify-center"
                            >
                                <a href="/proposal-donatur">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Buat Proposal Donatur Baru
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="border-emerald shadow-emerald relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/5 to-[#D4AF37]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-[#FDFBF7] flex items-center">
                                <FileText className="mr-2 h-5 w-5 text-[#D4AF37]" />
                                Proposal Sponsorship
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-[#FDFBF7]/60 mb-6 text-sm">
                                Kelola dukungan sponsorship dari perusahaan dan mitra gereja.
                            </p>
                            <Button
                                asChild
                                className="emerald-button w-full justify-center"
                            >
                                <a href="/proposal-sponsorship">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Buat Proposal Sponsorship
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    )
}