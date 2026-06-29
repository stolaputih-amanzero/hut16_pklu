'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut, LayoutDashboard, FileText, Users, User, Home, Archive } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [userName, setUserName] = useState('')
    const [userRole, setUserRole] = useState('')
    const [activePath, setActivePath] = useState('')

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
        { name: 'Donatur', path: '/proposal-donatur', icon: FileText },
        { name: 'Sponsor', path: '/proposal-sponsorship', icon: Users },
        { name: 'Daftar', path: '/daftar-proposal', icon: Archive },
    ]

    return (
        <div className="min-h-screen bg-[#022c22] text-[#FDFBF7] relative overflow-x-hidden selection:bg-[#D4AF37] selection:text-[#022c22] pb-24 md:pb-6">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] bg-[#D4AF37]/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-[#047857]/20 rounded-full blur-[150px]" />
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
            </div>

            {/* Navbar (Desktop only navigation links) */}
            <nav className="bg-[#022c22]/70 backdrop-blur-xl border-b border-[#D4AF37]/20 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all">
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

                    {/* Navigation (Desktop) */}
                    <div className="hidden md:flex items-center gap-2">
                        {navItems.slice(1).map((item) => {
                            const Icon = item.icon
                            const isActive = activePath === item.path
                            return (
                                <Button 
                                    key={item.path}
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleNavigation(item.path)} 
                                    className={`text-[#FDFBF7] transition-all ${isActive ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30' : 'hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]'}`}
                                >
                                    <Icon className="h-4 w-4 mr-2" /> {item.name}
                                </Button>
                            )
                        })}
                        <Button variant="outline" size="sm" onClick={handleLogout} className="border-[#D4AF37]/50 text-[#FDFBF7] hover:bg-[#D4AF37] hover:text-[#022c22] ml-2">
                            <LogOut className="h-4 w-4 mr-1" /> Keluar
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="p-4 md:p-6 relative z-10">{children}</main>

            {/* Mobile Floating Bottom Nav */}
            <div className="fixed bottom-6 left-4 right-4 z-50 md:hidden flex justify-around items-center bg-black/60 backdrop-blur-lg border border-[#D4AF37]/30 rounded-2xl py-3 px-2 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = activePath === item.path
                    return (
                        <button
                            key={item.path}
                            onClick={() => handleNavigation(item.path)}
                            className="flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-90 relative"
                        >
                            <Icon className={`h-5 w-5 mb-1 transition-colors ${isActive ? 'text-[#D4AF37]' : 'text-[#FDFBF7]/60'}`} />
                            <span className={`text-[10px] tracking-wide font-medium transition-colors ${isActive ? 'text-[#D4AF37]' : 'text-[#FDFBF7]/50'}`}>
                                {item.name}
                            </span>
                            {isActive && (
                                <motion.div 
                                    layoutId="bottomTabMarker"
                                    className="absolute bottom-[-6px] w-1 h-1 bg-[#D4AF37] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]"
                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                />
                            )}
                        </button>
                    )
                })}
                <button
                    onClick={handleLogout}
                    className="flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-90"
                >
                    <LogOut className="h-5 w-5 mb-1 text-red-400" />
                    <span className="text-[10px] tracking-wide font-medium text-red-400/80">Keluar</span>
                </button>
            </div>
        </div>
    )
}