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
    PieChart,
    TrendingUp
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
    Cell,
    AreaChart,
    Area
} from 'recharts'
import { formatRupiah } from '@/lib/utils'

export default function DashboardPage() {
    const [stats, setStats] = useState({
        donatur: 0,
        sponsorship: 0,
        confirmed: 0,
        tokens: 0,
        totalConfirmedFunds: 0,
        donaturConfirmedFunds: 0,
        sponsorConfirmedFunds: 0
    })

    const [fundData, setFundData] = useState([
        { name: 'Donatur', amount: 0, fill: '#10b981' },
        { name: 'Sponsorship', amount: 0, fill: '#f59e0b' }
    ])

    const [trendData, setTrendData] = useState<any[]>([])
    const [filterType, setFilterType] = useState<'all' | 'donatur' | 'sponsorship'>('all')
    const [rawTrendData, setRawTrendData] = useState<any[]>([])

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

                // Get confirmed funds
                const { data: donaturConfirmedFunds } = await supabase
                    .from('proposals')
                    .select('contribution_value')
                    .eq('type', 'donatur')
                    .eq('payment_status', 'confirmed')
                    .not('contribution_value', 'is', null)

                const { data: sponsorConfirmedFunds } = await supabase
                    .from('proposals')
                    .select('contribution_value')
                    .eq('type', 'sponsorship')
                    .eq('payment_status', 'confirmed')
                    .not('contribution_value', 'is', null)

                const sumDonaturConfirmed = donaturConfirmedFunds?.reduce((acc, curr) => acc + (curr.contribution_value || 0), 0) || 0
                const sumSponsorConfirmed = sponsorConfirmedFunds?.reduce((acc, curr) => acc + (curr.contribution_value || 0), 0) || 0
                const totalConfirmed = sumDonaturConfirmed + sumSponsorConfirmed

                setStats({
                    donatur: donaturCount || 0,
                    sponsorship: sponsorshipCount || 0,
                    confirmed: confirmedCount || 0,
                    tokens: tokensCount || 0,
                    totalConfirmedFunds: totalConfirmed,
                    donaturConfirmedFunds: sumDonaturConfirmed,
                    sponsorConfirmedFunds: sumSponsorConfirmed
                })

                // Get trend data (confirmed contributions grouped by date)
                const { data: trendRaw } = await supabase
                    .from('proposals')
                    .select('created_at, confirmed_at, confirmed_date, paid_date, contribution_value, type')
                    .eq('payment_status', 'confirmed')
                    .not('contribution_value', 'is', null)
                    .order('created_at', { ascending: true })

                setRawTrendData(trendRaw || [])
            } catch (error) {
                console.error('Error fetching stats:', error)
            }
        }

        fetchStats()
    }, [])

    useEffect(() => {
        if (rawTrendData.length === 0) {
            setTrendData([])
            return
        }

        const filtered = rawTrendData.filter(item => {
            if (filterType === 'all') return true
            return item.type === filterType
        })

        const trendMapDb: { [key: string]: number } = {}
        filtered.forEach(item => {
            let targetDate = ''
            if (item.paid_date) {
                targetDate = item.paid_date
            } else if (item.confirmed_date) {
                targetDate = item.confirmed_date
            } else if (item.confirmed_at) {
                targetDate = item.confirmed_at.split('T')[0]
            } else if (item.created_at) {
                targetDate = item.created_at.split('T')[0]
            }
            if (!targetDate) return
            trendMapDb[targetDate] = (trendMapDb[targetDate] || 0) + (item.contribution_value || 0)
        })

        const sortedDates = Object.keys(trendMapDb).sort()
        let runningTotal = 0
        const formattedTrend = sortedDates.map(dateKey => {
            const dailyAmount = trendMapDb[dateKey]
            runningTotal += dailyAmount
            
            const parts = dateKey.split('-')
            let displayDate = dateKey
            if (parts.length === 3) {
                const day = parseInt(parts[2], 10)
                const monthIdx = parseInt(parts[1], 10) - 1
                const monthsId = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
                displayDate = `${day} ${monthsId[monthIdx] || parts[1]}`
            }
            return {
                date: displayDate,
                amount: dailyAmount,
                cumulative: runningTotal
            }
        })

        setTrendData(formattedTrend)
    }, [rawTrendData, filterType])

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

            {/* Financial Summary Cards */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
                <motion.div variants={itemVariants}>
                    <Card className="border-emerald shadow-emerald bg-[#033B2B]/40 backdrop-blur-xl h-full transition-transform hover:scale-105 duration-300 cursor-default">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-semibold text-[#FDFBF7]/90 uppercase tracking-wider">Total Lunas (Terkonfirmasi)</CardTitle>
                            <TrendingUp className="h-5 w-5 text-[#D4AF37]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl md:text-3xl font-black text-[#D4AF37] font-mono">
                                {formatRupiah(stats.totalConfirmedFunds)}
                            </div>
                            <p className="text-xs text-[#FDFBF7]/55 mt-1.5">
                                Akumulasi dana masuk terkonfirmasi
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="border-emerald shadow-emerald bg-[#033B2B]/40 backdrop-blur-xl h-full transition-transform hover:scale-105 duration-300 cursor-default">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-semibold text-[#FDFBF7]/90 uppercase tracking-wider">Lunas - Donor</CardTitle>
                            <Heart className="h-5 w-5 text-emerald-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl md:text-3xl font-black text-emerald-400 font-mono">
                                {formatRupiah(stats.donaturConfirmedFunds)}
                            </div>
                            <p className="text-xs text-[#FDFBF7]/55 mt-1.5">
                                Total dana lunas dari kategori Donatur
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="border-emerald shadow-emerald bg-[#033B2B]/40 backdrop-blur-xl h-full transition-transform hover:scale-105 duration-300 cursor-default">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-sm font-semibold text-[#FDFBF7]/90 uppercase tracking-wider">Lunas - Sponsor</CardTitle>
                            <Users className="h-5 w-5 text-amber-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl md:text-3xl font-black text-amber-400 font-mono">
                                {formatRupiah(stats.sponsorConfirmedFunds)}
                            </div>
                            <p className="text-xs text-[#FDFBF7]/55 mt-1.5">
                                Total dana lunas dari kategori Sponsor
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 gap-6"
            >
                <motion.div variants={itemVariants}>
                    <Card className="border-emerald shadow-emerald h-full cursor-default bg-[#033B2B]/40 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-[#FDFBF7] flex items-center">
                                <PieChart className="mr-2 h-5 w-5 text-[#D4AF37]" />
                                Perolehan Dana (Donatur & Sponsor)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px] md:h-[250px] w-full">
                                <ResponsiveContainer width="99%" height="100%">
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
            </motion.div>

            {/* Trend Perolehan Section */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="mt-6"
            >
                <motion.div variants={itemVariants}>
                    <Card className="border-emerald shadow-emerald bg-[#033B2B]/40 backdrop-blur-xl cursor-default">
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <CardTitle className="text-xl font-bold text-[#FDFBF7] flex items-center">
                                <TrendingUp className="mr-2 h-5 w-5 text-[#D4AF37]" />
                                Tren Akumulasi Perolehan Dana (Terkonfirmasi Lunas)
                            </CardTitle>
                            <div className="flex gap-2 bg-[#022c22]/80 p-1 rounded-lg border border-[#D4AF37]/20 select-none self-start sm:self-auto relative z-10">
                                {[
                                    { id: 'all', label: 'Keduanya' },
                                    { id: 'donatur', label: 'Donor' },
                                    { id: 'sponsorship', label: 'Sponsor' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setFilterType(tab.id as any)}
                                        className={`px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                                            filterType === tab.id
                                                ? 'bg-[#D4AF37] text-[#022c22] shadow-[0_2px_8px_rgba(212,175,55,0.3)]'
                                                : 'text-[#FDFBF7]/60 hover:text-[#FDFBF7] hover:bg-[#D4AF37]/10'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {trendData.length === 0 ? (
                                <div className="h-[250px] flex items-center justify-center text-[#FDFBF7]/40 text-sm">
                                    Belum ada data perolehan terkonfirmasi untuk menampilkan tren.
                                </div>
                            ) : (
                                <div className="h-[220px] md:h-[280px] w-full">
                                    <ResponsiveContainer width="99%" height="100%" key={filterType}>
                                        <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <defs>
                                                <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4}/>
                                                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#D4AF37" opacity={0.1} vertical={false} />
                                            <XAxis 
                                                dataKey="date" 
                                                stroke="#FDFBF7" 
                                                opacity={0.6}
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fill: '#FDFBF7', fontSize: 11 }}
                                            />
                                            <YAxis 
                                                stroke="#FDFBF7" 
                                                opacity={0.6}
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(value) => value >= 1000000 ? `Rp ${(value / 1000000).toFixed(1)}M` : `Rp ${value.toLocaleString('id-ID')}`}
                                                tick={{ fill: '#FDFBF7', fontSize: 11 }}
                                                width={80}
                                            />
                                            <Tooltip 
                                                cursor={{ stroke: '#D4AF37', strokeWidth: 1, strokeDasharray: '3 3' }}
                                                contentStyle={{ 
                                                    backgroundColor: '#022c22', 
                                                    borderColor: 'rgba(212, 175, 55, 0.4)', 
                                                    borderRadius: '8px', 
                                                    color: '#FDFBF7', 
                                                    boxShadow: '0 8px 30px rgba(0,0,0,0.6)' 
                                                }}
                                                itemStyle={{ color: '#FDFBF7', fontSize: '13px', fontWeight: 500 }}
                                                labelStyle={{ color: '#D4AF37', fontSize: '14px', fontWeight: 'bold', paddingBottom: '4px', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', marginBottom: '8px' }}
                                                formatter={(value: any) => [formatRupiah(Number(value) || 0), 'Akumulasi']}
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="cumulative" 
                                                stroke="#D4AF37" 
                                                strokeWidth={2}
                                                fillOpacity={1} 
                                                fill="url(#colorCumulative)" 
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </div>
    )
}