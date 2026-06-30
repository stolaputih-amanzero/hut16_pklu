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
    Plus,
    PieChart
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts'
import { formatRupiah } from '@/lib/utils'

export default function DashboardPage() {
    const [stats, setStats] = useState({
        donatur: 0,
        sponsorship: 0,
        confirmed: 0,
        tokens: 0
    })

    const [fundData, setFundData] = useState([
        { name: 'Donatur', amount: 0, fill: '#10b981' },
        { name: 'Sponsorship', amount: 0, fill: '#f59e0b' }
    ])

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

                // Get funds
                const { data: donaturFunds } = await supabase
                    .from('proposals')
                    .select('contribution_value')
                    .eq('type', 'donatur')
                    .not('contribution_value', 'is', null)

                const { data: sponsorFunds } = await supabase
                    .from('proposals')
                    .select('contribution_value')
                    .eq('type', 'sponsorship')
                    .not('contribution_value', 'is', null)

                const sumDonatur = donaturFunds?.reduce((acc, curr) => acc + (curr.contribution_value || 0), 0) || 0
                const sumSponsor = sponsorFunds?.reduce((acc, curr) => acc + (curr.contribution_value || 0), 0) || 0

                setFundData([
                    { name: 'Donatur', amount: sumDonatur, fill: '#10b981' },
                    { name: 'Sponsorship', amount: sumSponsor, fill: '#f59e0b' }
                ])

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
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                <motion.div variants={itemVariants} className="md:col-span-2">
                    <Card className="border-emerald shadow-emerald h-full cursor-default bg-[#033B2B]/40 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-[#FDFBF7] flex items-center">
                                <PieChart className="mr-2 h-5 w-5 text-[#D4AF37]" />
                                Perolehan Dana (Donatur & Sponsor)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={fundData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#D4AF37" opacity={0.1} vertical={false} />
                                        <XAxis 
                                            dataKey="name" 
                                            stroke="#FDFBF7" 
                                            opacity={0.6}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fill: '#FDFBF7', fontSize: 12 }}
                                        />
                                        <YAxis 
                                            stroke="#FDFBF7" 
                                            opacity={0.6}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => value >= 1000000 ? `Rp${(value / 1000000).toFixed(0)}M` : `Rp${value.toLocaleString('id-ID')}`}
                                            tick={{ fill: '#FDFBF7', fontSize: 12 }}
                                            width={80}
                                        />
                                        <Tooltip 
                                            cursor={{ fill: 'rgba(212, 175, 55, 0.1)' }}
                                            contentStyle={{ 
                                                backgroundColor: '#022c22', 
                                                borderColor: 'rgba(212, 175, 55, 0.4)', 
                                                borderRadius: '8px', 
                                                color: '#FDFBF7', 
                                                boxShadow: '0 8px 30px rgba(0,0,0,0.6)' 
                                            }}
                                            itemStyle={{ color: '#FDFBF7', fontSize: '13px', fontWeight: 500 }}
                                            labelStyle={{ color: '#D4AF37', fontSize: '14px', fontWeight: 'bold', paddingBottom: '4px', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', marginBottom: '8px' }}
                                            formatter={(value: any) => [formatRupiah(Number(value) || 0), 'Total']}
                                        />
                                        <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={60}>
                                            {
                                                fundData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))
                                            }
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants} className="md:col-span-1 flex flex-col">
                    <Card className="border-emerald shadow-emerald relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/5 to-[#D4AF37]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-[#FDFBF7] flex items-center">
                                <FileText className="mr-2 h-5 w-5 text-[#D4AF37]" />
                                Buat Proposal Baru
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-between">
                            <p className="text-[#FDFBF7]/60 mb-6 text-sm">
                                Kelola pendaftaran proposal donatur pribadi maupun sponsorship institusi dalam satu alur yang mudah dan terintegrasi.
                            </p>
                            <Button
                                asChild
                                className="emerald-button w-full justify-center px-4 py-6 whitespace-normal h-auto text-center"
                            >
                                <a href="/buat-proposal">
                                    <Plus className="mr-2 h-4 w-4 shrink-0" />
                                    <span>Buka Halaman Pembuatan Proposal</span>
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    )
}