'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut, LayoutDashboard, FileText, Users, User, Home, FileSpreadsheet, Plus, MessageSquareQuote, ShoppingBag, ChevronRight, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [userName, setUserName] = useState('')
    const [userRole, setUserRole] = useState('')
    const [activePath, setActivePath] = useState('')
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setActivePath(window.location.pathname)
        }
        
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                setUserName('Guest')
                setUserRole('admin')
                setLoading(false)
                return
            }

            // Ambil data profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, role')
                .eq('id', session.user.id)
                .single()

            if (profile) {
                setUserName(profile.full_name)
                setUserRole(profile.role)
            } else {
                setUserName('Guest')
                setUserRole('admin')
            }

            setLoading(false)
        }

        checkAuth()
    }, [router])

    const handleNavigation = (path: string) => {
        setActivePath(path)
        router.push(path)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#022c22]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#D4AF37]" />
            </div>
        )
    }

    const navItems = [
        { name: 'Beranda', path: '/', icon: Home },
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Data Registrasi', path: '/rekap-registrasi', icon: Users },
        { name: 'Buku Tamu', path: '/admin-ucapan', icon: MessageSquareQuote },
        { name: 'Merchandise', path: '/admin-merch', icon: ShoppingBag },
        { name: 'Proposal', path: '/buat-proposal', icon: Plus },
        { name: 'Laporan', path: '/daftar-proposal', icon: FileSpreadsheet },
    ]

    return (
        <div className="min-h-screen bg-[#022c22] text-[#FDFBF7] print:bg-white print:text-black relative overflow-x-hidden selection:bg-[#D4AF37] selection:text-[#022c22] pb-8 md:pb-6">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none -z-10 print:hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] bg-[#D4AF37]/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-[#047857]/20 rounded-full blur-[150px]" />
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
            </div>

            {/* Navbar (Desktop only navigation links) */}
            <nav className="bg-[#022c22]/70 backdrop-blur-xl border-b border-[#D4AF37]/20 px-6 py-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all print:hidden">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigation('/')}>
                        <img src="/logo_hut16_pklu.png" alt="Logo" className="h-10 w-10 object-contain drop-shadow-[0_2px_10px_rgba(212,175,55,0.3)]" />
                        <div>
                            <h1 className="font-bold text-[#FDFBF7] text-sm tracking-widest uppercase">HUT ke-16 PKLU</h1>
                            <p className="text-xs text-[#D4AF37]">Sistem Proposal & Sponsorship</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* User Info */}
                    <div className="flex items-center gap-2 text-sm mr-2">
                        <User className="h-4 w-4 text-[#D4AF37]" />
                        <div className="text-right">
                            <p className="font-medium text-[#FDFBF7] text-xs md:text-sm">{userName}</p>
                            <p className="text-[10px] md:text-xs text-[#D4AF37]/80 capitalize">{userRole.replace('_', ' ')}</p>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-[#D4AF37]/30 hidden md:block" />

                    {/* Logout Button (Desktop only) */}
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleLogout} 
                        className="hidden md:flex border-[#D4AF37]/50 text-[#FDFBF7] hover:bg-[#D4AF37] hover:text-[#022c22] ml-2"
                    >
                        <LogOut className="h-4 w-4 mr-1" /> Keluar
                    </Button>
                </div>
            </nav>

            {/* Sidebar (Desktop only) */}
            <aside className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 w-64 bg-[#022c22]/95 backdrop-blur-xl border-r border-[#D4AF37]/20 pt-24 pb-6 px-4 z-40 shadow-[4px_0_30px_rgba(0,0,0,0.5)]">
                <div className="flex-1 flex flex-col justify-between">
                    {/* Navigation items stacked vertically */}
                    <div className="space-y-1.5">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = activePath === item.path
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => handleNavigation(item.path)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
                                        isActive
                                            ? 'bg-[#D4AF37] text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.25)] border border-[#D4AF37]/40'
                                            : 'text-[#FDFBF7]/70 hover:text-white hover:bg-white/5 border border-transparent'
                                    }`}
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    <span>{item.name}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </aside>

            {/* Content */}
            <main className="p-4 md:p-6 pt-24 md:pt-28 md:pl-72 relative">
                {/* Mobile Breadcrumb Navigation (replacing bottom nav) */}
                <div className="relative z-40 md:hidden mb-6 flex items-center justify-between bg-black/40 backdrop-blur-md border border-[#D4AF37]/20 rounded-xl px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.3)] select-none print:hidden">
                    <div className="flex items-center gap-1.5 text-xs text-[#FDFBF7]/60 font-medium overflow-hidden">
                        <Home className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                        <button 
                            onClick={() => handleNavigation('/')}
                            className="hover:text-[#D4AF37] transition-colors duration-200"
                        >
                            Beranda
                        </button>
                        <ChevronRight className="w-3 h-3 text-[#D4AF37]/40 shrink-0" />
                        <span className="text-[#D4AF37] font-semibold truncate">
                            {navItems.find(item => item.path === activePath)?.name || 'Admin'}
                        </span>
                    </div>

                    {/* Dropdown Navigation Menu */}
                    <div className="relative shrink-0">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-[#022c22]/80 hover:bg-[#D4AF37]/10 border border-[#D4AF37]/35 hover:border-[#D4AF37] text-[#FDFBF7] text-xs font-semibold rounded-full cursor-pointer transition-all duration-300 active:scale-95 shadow-[0_0_8px_rgba(212,175,55,0.1)]"
                        >
                            <span>Navigasi</span>
                            <ChevronDown className={`w-3.5 h-3.5 text-[#D4AF37] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="absolute right-0 mt-3 w-56 bg-[#022c22]/95 backdrop-blur-xl border border-[#D4AF37]/30 rounded-2xl p-2.5 shadow-2xl z-50 overflow-hidden"
                                >
                                    {/* Golden subtle ambient light inside dropdown */}
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#D4AF37]/5 rounded-full blur-xl pointer-events-none" />
                                    
                                    <div className="space-y-1 relative z-10">
                                        <p className="text-[9px] uppercase tracking-widest text-[#D4AF37]/50 font-semibold px-2 pb-1.5 border-b border-[#D4AF37]/10 mb-1">
                                            Menu Admin
                                        </p>
                                        {navItems.map((item) => {
                                            const Icon = item.icon
                                            const isActive = activePath === item.path
                                            return (
                                                <button
                                                    key={item.path}
                                                    onClick={() => {
                                                        handleNavigation(item.path)
                                                        setIsDropdownOpen(false)
                                                    }}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer flex items-center justify-between ${
                                                        isActive
                                                            ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/20 shadow-[0_0_10px_rgba(212,175,55,0.05)]'
                                                            : 'text-[#FDFBF7]/80 hover:bg-[#D4AF37]/5 hover:text-[#FDFBF7]'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Icon className="w-3.5 h-3.5" />
                                                        <span>{item.name}</span>
                                                    </div>
                                                    {isActive && (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                                                    )}
                                                </button>
                                            )
                                        })}
                                        
                                        <div className="h-px bg-[#D4AF37]/10 my-1.5" />
                                        
                                        <button
                                            onClick={() => {
                                                handleLogout()
                                                setIsDropdownOpen(false)
                                            }}
                                            className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer flex items-center gap-2"
                                        >
                                            <LogOut className="w-3.5 h-3.5" />
                                            <span>Keluar</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                {children}
            </main>
        </div>
    )
}