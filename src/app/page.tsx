'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, MapPin, ArrowRight, Quote, CheckCircle2, Star, Clock, Copy, Check, MessageSquare, Loader2, X, ShieldCheck, ChevronRight, ChevronDown, Home as HomeIcon, UserCheck, ShoppingBag, HeartHandshake, Sparkles, Search } from 'lucide-react'
import { Playfair_Display } from 'next/font/google'
import { supabase } from '@/lib/supabase/client'
import { getNextNumber } from '@/lib/numbering'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'

const MupelMap = dynamic(() => import('@/components/MupelMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full min-h-[380px] rounded-2xl border border-[#D4AF37]/30 bg-[#022c22]/60 flex items-center justify-center text-[#D4AF37] font-light text-sm">
      Memuat Peta Lokasi Jemaat...
    </div>
  )
})

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '600', '700'], style: ['normal', 'italic'] })

const praKegiatanRundown = [
  { period: 'Juni – Juli 2026', title: 'Sosialisasi Lomba', desc: 'Publikasi kepada jemaat-jemaat GPIB.' },
  { period: 'Juli – Agustus 2026', title: 'Penerimaan Karya Lomba Puisi', desc: 'Karya dikirim kepada panitia. (Ekspresi iman dan pengalaman hidup kaum lanjut usia).' },
  { period: 'Juli – Agustus 2026', title: 'Penerimaan Karya Artikel', desc: 'Tema: Lansia Teladan dalam Iman, Karya, dan Pelayanan.' },
  { period: 'Agustus – September 2026', title: 'Penerimaan Video Singkat/ Shorts/ Reel', desc: 'Tema: Lansia Teladan; karya inspiratif dari kaum lansia.' },
  { period: 'September 2026', title: 'Penjurian Lomba', desc: 'Dilakukan oleh tim juri.' },
  { period: 'September/ Oktober 2026', title: 'Webinar', desc: 'Lansia Teladan dari Kacamata Keuangan. (Bijak Mengelola Berkat: Persiapan Keuangan Menuju Masa Lanjut Usia yang Bermakna / Siap Finansial di Usia Emas / Lansia Teladan, Keuangan Terencana: Bijak Mengelola Berkat di Masa Lanjut Usia).' },
  { period: '12 Oktober 2026', title: 'Pengumuman Pemenang Lomba', desc: 'Diumumkan pada acara puncak.' }
]

const puncakRundown = [
  { time: '08:00 – 09:00', duration: "60'", title: 'Registrasi Peserta & Tamu Undangan', desc: 'Registrasi ulang, pembagian kit dan merchandise, serta penyambutan hangat.' },
  { time: '09:00 – 10:30', duration: "90'", title: 'Ibadah Syukur Agung HUT Ke-16', desc: 'Ibadah syukur bersama memperingati pertambahan usia Pelkat PKLU GPIB.' },
  { time: '10:30 – 10:50', duration: "20'", title: 'Snack Break & Hiburan Musik', desc: 'Istirahat singkat sembari menikmati hidangan ringan dan selingan musik syahdu.' },
  { time: '10:50 – 11:15', duration: "25'", title: 'Opening Ceremony', desc: 'Tarian pembuka, prosesi, dan penyambutan resmi unsur pemerintahan serta pimpinan gereja.' },
  { time: '11:15 – 12:00', duration: "45'", title: 'Sambutan & Keynote Speech', desc: 'Kata sambutan dari Ketua Panitia, BP Mupel Bekasi, serta pimpinan sinode.' },
  { time: '12:00 – 13:50', duration: "110'", title: 'Makan Siang & Istirahat', desc: 'Makan siang bersama seluruh undangan dan waktu istirahat/ganti kostum bagi peserta penampil.' },
  { time: '13:50 – 16:00', duration: "130'", title: 'Acara Perayaan & Apresiasi Pemenang Lomba', desc: 'Panggung gembira (penampilan seni lansia), pengumuman pemenang lomba, peniupan lilin HUT, dan snack break.' },
  { time: '16:00 – 17:00', duration: "60'", title: 'Sesi Foto Bersama & Doa Penutup', desc: 'Kebersamaan menyanyikan lagu tema, dokumentasi foto bersama per Mupel/jemaat, dan diakhiri doa berkat.' }
]

const sections = [
  { id: 'pendahuluan', label: 'Pendahuluan' },
  { id: 'tujuan', label: 'Maksud & Tujuan' },
  { id: 'tuan-rumah', label: 'Tuan Rumah' },
  { id: 'kegiatan', label: 'Rangkaian Kegiatan' },
  { id: 'waktu-tempat', label: 'Waktu & Tempat' },
  { id: 'rundown', label: 'Rundown Acara' },
  { id: 'dukungan', label: 'Dukungan Kasih' },
]

import { PublicHeader } from '@/components/PublicHeader'

export default function Home() {
  const [copied, setCopied] = useState(false)
  const [activeRundown, setActiveRundown] = useState<'puncak' | 'pra'>('pra')
  const [activeSection, setActiveSection] = useState<string>('Pendahuluan')
  const [showBreadcrumb, setShowBreadcrumb] = useState<boolean>(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBreadcrumb(true)
      } else {
        setShowBreadcrumb(false)
        setIsDropdownOpen(false)
      }
    }
    window.addEventListener('scroll', handleScroll)

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    }

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const section = sections.find(s => s.id === entry.target.id)
          if (section) {
            setActiveSection(section.label)
          }
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)
    sections.forEach(section => {
      const el = document.getElementById(section.id)
      if (el) observer.observe(el)
    })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      observer.disconnect()
    }
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText('00179-01-88-000447-9')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const [isOpenModal, setIsOpenModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [modalForm, setModalForm] = useState({
    name: '',
    phone: '',
    type: 'donatur' // 'donatur' | 'sponsorship'
  })

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modalForm.name.trim() || !modalForm.phone.trim()) {
      toast.error('Silakan lengkapi nama dan nomor WhatsApp Anda')
      return
    }

    try {
      setSubmitting(true)
      
      // 1. Fetch first active committee member for database foreign key compliance
      const { data: comms } = await supabase
        .from('committees')
        .select('id')
        .eq('is_active', true)
        .limit(1)
      const committeeId = comms?.[0]?.id || null

      // 2. Insert record to database with retry logic for sequential proposal numbers
      let success = false
      let retries = 5
      let number = ''
      let saveError = null

      while (retries > 0 && !success) {
        // Get automatic next number for proposal
        number = await getNextNumber(modalForm.type as any, 2026)

        const { error } = await supabase
          .from('proposals')
          .insert({
            type: modalForm.type,
            number: number,
            name: modalForm.name,
            phone: modalForm.phone,
            payment_status: 'pending',
            committee_id: committeeId,
            proposal_date: new Date().toISOString().split('T')[0],
            specific_support: 'request'
          })

        if (!error) {
          success = true
        } else if (error.code === '23505') {
          // Unique key violation (concurrency collision), retry with next number
          retries--
          saveError = error
          // Wait briefly before retrying
          await new Promise(resolve => setTimeout(resolve, 100))
        } else {
          // Other DB errors, fail immediately
          throw error
        }
      }

      if (!success && saveError) {
        throw new Error(`Gagal mengunci nomor proposal: ${saveError.message}`)
      }

      // 4. Construct WA message and redirect
      const waMessage = `Halo Ibu Anastasia Christine Dolo,\n\nSaya tertarik untuk mendukung perayaan HUT ke-16 Pelkat PKLU GPIB sebagai *${modalForm.type === 'donatur' ? 'Donatur' : 'Sponsor'}*.\n\nBerikut identitas saya:\n- Nama: ${modalForm.name}\n- No. WhatsApp: ${modalForm.phone}\n- No. Registrasi: ${number}\n\nMohon untuk dapat difollowup lebih lanjut. Terima kasih!`
      
      const waUrl = `https://wa.me/6281291451945?text=${encodeURIComponent(waMessage)}`
      
      toast.success('Dukungan Anda berhasil dicatat! Mengalihkan ke WhatsApp...')
      
      // Open WA link
      window.open(waUrl, '_blank')

      // Reset & close modal
      setModalForm({ name: '', phone: '', type: 'donatur' })
      setIsOpenModal(false)
    } catch (err: any) {
      console.error('Error submitting support:', err)
      toast.error('Gagal mengirim dukungan: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const fadeIn = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#022c22] text-[#FDFBF7] overflow-x-hidden selection:bg-[#D4AF37] selection:text-[#022c22] relative font-sans">
      <PublicHeader />
      
      {/* Ultra Premium Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#022c22]" />
        
        {/* Soft Gold Orb */}
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#D4AF37] rounded-full blur-[120px] md:blur-[200px] gpu-accelerated will-change-transform"
        />
        
        {/* Soft Emerald Orb */}
        <motion.div 
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-20%] left-[-10%] w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] bg-[#047857] rounded-full blur-[120px] md:blur-[200px] gpu-accelerated will-change-transform"
        />

        {/* Subtle noise texture for material feel */}
        <div 
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
        />
      </div>

      {/* Sticky Dynamic Breadcrumb Bar */}
      <AnimatePresence>
        {showBreadcrumb && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            transition={{ duration: 0.3 }}
            className="fixed top-6 left-1/2 z-50 w-[90%] max-w-md bg-[#022c22]/90 backdrop-blur-md border border-[#D4AF37]/35 rounded-full px-4 py-2 shadow-[0_10px_35px_rgba(0,0,0,0.6),_0_0_15px_rgba(212,175,55,0.1)] flex items-center justify-between gap-2"
          >
            {/* Breadcrumb path */}
            <div className="flex items-center gap-1.5 md:gap-2 text-[#FDFBF7]/60 text-xs md:text-sm font-medium">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hover:text-[#D4AF37] flex items-center gap-1 cursor-pointer transition-colors duration-200"
              >
                <HomeIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Beranda</span>
              </button>
              
              <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]/40" />
              
              {/* Dynamic current location */}
              <span className="text-[#D4AF37] font-semibold tracking-wide truncate max-w-[120px] sm:max-w-[180px]">
                {activeSection}
              </span>
            </div>

            {/* Dropdown Selector Button */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#022c22] hover:bg-[#D4AF37]/10 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 text-[#FDFBF7] text-xs font-semibold rounded-full cursor-pointer transition-all duration-300 active:scale-95"
              >
                <span>Navigasi</span>
                <ChevronDown className={`w-3 h-3 text-[#D4AF37] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
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
                        Lompat ke Informasi
                      </p>
                      {sections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => {
                            const el = document.getElementById(section.id)
                            if (el) {
                              const yOffset = -80; 
                              const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
                              window.scrollTo({ top: y, behavior: 'smooth' });
                            }
                            setIsDropdownOpen(false)
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer flex items-center justify-between ${
                            activeSection === section.label
                              ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/20 shadow-[0_0_10px_rgba(212,175,55,0.05)]'
                              : 'text-[#FDFBF7]/80 hover:bg-[#D4AF37]/5 hover:text-[#FDFBF7]'
                          }`}
                        >
                          <span>{section.label}</span>
                          {activeSection === section.label && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center">
        
        {/* Floating Token Image */}
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-96 md:h-96 mb-12 gpu-accelerated will-change-transform"
        >
          {/* Very subtle glow exactly behind the token, no boxy shape */}
          <div className="absolute inset-0 bg-radial-gradient from-[#D4AF37]/30 to-transparent blur-2xl rounded-full scale-75 opacity-70" />
          
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full relative gpu-accelerated will-change-transform"
          >
            <Image
              src="/logo_hut16_pklu.png"
              alt="Logo Resmi HUT 16 PKLU GPIB"
              fill
              sizes="(max-width: 768px) 288px, 384px"
              className="object-contain relative z-10 drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]"
              priority
            />
          </motion.div>
        </motion.div>

        {/* Typography Section */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="w-full text-center space-y-8 mb-12 max-w-4xl"
        >
          <motion.p variants={fadeIn} className="text-[#D4AF37] font-semibold tracking-[0.2em] uppercase text-xs md:text-sm">
            Perayaan dan Ibadah Syukur
          </motion.p>
          
          <motion.h1 
            variants={fadeIn} 
            className={`text-5xl md:text-7xl lg:text-8xl text-transparent bg-clip-text bg-gradient-to-b from-[#FDFBF7] to-[#FDFBF7]/60 leading-tight ${playfair.className}`}
          >
            HUT ke-16 <br />
            <span className="bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#B8860B] bg-clip-text text-transparent">
              Pelkat PKLU GPIB
            </span>
          </motion.h1>

          <motion.div variants={fadeIn} className="flex items-center justify-center gap-6 py-6 opacity-90">
            <div className="h-[1px] w-12 md:w-24 bg-gradient-to-r from-transparent to-[#D4AF37]" />
            <span className={`text-2xl md:text-4xl text-[#D4AF37] ${playfair.className} italic font-light`}>
              "Teruskan Baktimu!"
            </span>
            <div className="h-[1px] w-12 md:w-24 bg-gradient-to-l from-transparent to-[#D4AF37]" />
          </motion.div>

          <motion.div variants={fadeIn} className="space-y-3">
            <p className="text-[#FDFBF7]/90 text-lg md:text-2xl font-light tracking-wide">
              Bertumbuh Dalam Keselamatan <span className="text-[#D4AF37] text-sm md:text-base opacity-70 ml-2 font-medium tracking-normal">(1 Petrus 2:2)</span>
            </p>
            <p className={`text-[#FDFBF7]/70 text-base md:text-xl max-w-2xl mx-auto ${playfair.className} italic`}>
              Lansia Teladan dalam Iman, Karya, dan Pelayanan
            </p>
          </motion.div>

          {/* Tagline */}
          <motion.div variants={fadeIn} className="mt-8 py-4 border-y border-[#D4AF37]/20 w-3/4 mx-auto">
            <p className="text-[#FDFBF7]/90 text-xs md:text-sm tracking-[0.3em] uppercase text-center font-medium">
              Untuk Lansia <span className="text-[#D4AF37] mx-3">•</span> Oleh Lansia <span className="text-[#D4AF37] mx-3">•</span> Bersama PKLU GPIB
            </p>
          </motion.div>
        </motion.div>

        {/* 🌟 PORTAL LAYANAN & PARTISIPASI PUBLIK (INTEGRATED FEATURE HUB) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-5xl mb-24 space-y-6"
        >
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Layanan &amp; Partisipasi Publik
            </span>
            <h2 className={`text-3xl md:text-5xl text-white ${playfair.className}`}>
              Pintu Gerbang Partisipasi Acara
            </h2>
            <p className="text-xs md:text-sm text-gray-300 max-w-lg mx-auto">
              Akses cepat untuk pendaftaran peserta, pasang twibbon sosmed, pesan merchandise souvenir, dan kirim ucapan doa.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Form Pendaftaran */}
            <Link href="/daftar" className="group relative overflow-hidden rounded-2xl border border-[#D4AF37]/40 bg-black/60 p-5 backdrop-blur-xl hover:border-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all duration-300 shadow-xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-[#D4AF37]/20 rounded-xl border border-[#D4AF37]/40 text-[#D4AF37] group-hover:scale-110 transition-transform">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Resmi
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-[#D4AF37] transition-colors">Pendaftaran Peserta</h3>
                  <p className="text-xs text-gray-300 mt-1 line-clamp-2">Daftar secara perorangan maupun rombongan utusan jemaat GPIB.</p>
                </div>
              </div>
              <div className="flex items-center text-xs font-bold text-[#D4AF37] pt-2 border-t border-white/10">
                Isi Form Registrasi <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 2. Twibbon & Kit Sosmed */}
            <Link href="/twibbon" className="group relative overflow-hidden rounded-2xl border border-[#D4AF37]/40 bg-black/60 p-5 backdrop-blur-xl hover:border-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all duration-300 shadow-xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-[#D4AF37]/20 rounded-xl border border-[#D4AF37]/40 text-[#D4AF37] group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                    Kampanye
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-[#D4AF37] transition-colors">Twibbon &amp; Kit Sosmed</h3>
                  <p className="text-xs text-gray-300 mt-1 line-clamp-2">Pasang bingkai foto mewah HUT PKLU &amp; copy teks caption media sosial.</p>
                </div>
              </div>
              <div className="flex items-center text-xs font-bold text-[#D4AF37] pt-2 border-t border-white/10">
                Buat Foto Twibbon <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 3. Pemesanan Merchandise */}
            <Link href="/merch" className="group relative overflow-hidden rounded-2xl border border-[#D4AF37]/40 bg-black/60 p-5 backdrop-blur-xl hover:border-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all duration-300 shadow-xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-[#D4AF37]/20 rounded-xl border border-[#D4AF37]/40 text-[#D4AF37] group-hover:scale-110 transition-transform">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                    Souvenir
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-[#D4AF37] transition-colors">Pemesanan Merchandise</h3>
                  <p className="text-xs text-gray-300 mt-1 line-clamp-2">Pesan kaos edisi khusus, topi, pin, mug, dan goodie bag souvenir.</p>
                </div>
              </div>
              <div className="flex items-center text-xs font-bold text-[#D4AF37] pt-2 border-t border-white/10">
                Pesan Souvenir <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 4. Buku Tamu & Ucapan */}
            <Link href="/ucapan" className="group relative overflow-hidden rounded-2xl border border-[#D4AF37]/40 bg-black/60 p-5 backdrop-blur-xl hover:border-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all duration-300 shadow-xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-[#D4AF37]/20 rounded-xl border border-[#D4AF37]/40 text-[#D4AF37] group-hover:scale-110 transition-transform">
                    <HeartHandshake className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                    Publik
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-[#D4AF37] transition-colors">Buku Tamu &amp; Ucapan</h3>
                  <p className="text-xs text-gray-300 mt-1 line-clamp-2">Kirim ucapan selamat dan doa sukacita untuk HUT ke-16 PKLU GPIB.</p>
                </div>
              </div>
              <div className="flex items-center text-xs font-bold text-[#D4AF37] pt-2 border-t border-white/10">
                Tulis Ucapan Selamat <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </motion.div>




        {/* Pendahuluan Section */}
        <motion.div
          id="pendahuluan"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1 }}
          className="w-full max-w-4xl mb-24 text-center space-y-8"
        >
          <div className="flex justify-center mb-6">
            <Quote className="w-12 h-12 text-[#D4AF37] opacity-50" />
          </div>
          <h2 className={`text-4xl md:text-5xl text-[#D4AF37] ${playfair.className}`}>Pendahuluan</h2>
          
          <div className="relative p-6 md:p-12 rounded-[2rem] bg-[#022c22]/40 backdrop-blur-md border border-[#D4AF37]/20">
            <p className={`text-xl md:text-2xl text-[#FDFBF7] font-light italic leading-relaxed mb-8 ${playfair.className}`}>
              "Hiasan orang muda ialah kekuatannya, dan keindahan orang tua ialah uban."
              <br/><span className="text-sm not-italic font-sans text-[#D4AF37] mt-4 block uppercase tracking-widest font-semibold">Amsal 20:29</span>
            </p>
            
            <div className="space-y-6 text-[#FDFBF7]/80 text-base md:text-lg leading-relaxed text-justify md:text-center font-light">
              <p>
                Uban di kepala adalah mahkota kemuliaan; tanda kesetiaan, pengalaman hidup, dan kasih Tuhan yang terus menyertai. Usia lanjut bukanlah akhir dari karya dan pelayanan, melainkan kesempatan untuk tetap menjadi berkat, menghadirkan hikmat, keteduhan, dan teladan iman bagi keluarga, gereja, dan masyarakat.
              </p>
              <p>
                Pelkat PKLU GPIB merupakan wadah pembinaan, persekutuan, dan pelayanan bagi warga jemaat GPIB berusia 60 tahun ke atas. Mereka bukan hanya hadir sebagai peserta, tetapi juga sebagai saksi iman, sumber hikmat, dan teladan dalam ketekunan serta kasih. Perayaan HUT ke-16 ini menjadi momen syukur atas penyertaan Tuhan dalam pelayanan kami.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Maksud dan Tujuan Section */}
        <motion.div
          id="tujuan"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1 }}
          className="w-full max-w-4xl mb-16"
        >
          <div className="text-center mb-8">
            <h2 className={`text-3xl md:text-4xl text-[#D4AF37] ${playfair.className}`}>Maksud & Tujuan</h2>
            <div className="w-16 h-0.5 bg-[#D4AF37]/50 mx-auto mt-4 rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Mendukung terselenggaranya ibadah syukur dan perayaan HUT ke-16 Pelkat PKLU GPIB.",
              "Mempererat kebersamaan Pelkat PKLU GPIB dari berbagai jemaat di Indonesia.",
              "Mendukung kebutuhan peserta, khususnya kaum lanjut usia.",
              "Mendukung pra-kegiatan berupa lomba dan webinar inspiratif.",
              "Mengapresiasi karya, talenta, pengalaman, dan kesaksian kaum lansia.",
              "Menguatkan semangat lansia teladan dalam iman, karya, dan pelayanan."
            ].map((tujuan, index) => (
              <div key={index} className="flex gap-4 items-center bg-[#022c22]/40 backdrop-blur-sm border border-[#D4AF37]/25 rounded-xl p-4 hover:bg-[#D4AF37]/10 transition-all duration-300 group shadow-lg">
                <div className="w-8 h-8 rounded-full bg-[#022c22] border border-[#D4AF37]/35 flex items-center justify-center text-[#D4AF37] text-xs font-bold flex-shrink-0 group-hover:border-[#D4AF37] transition-all">
                  {index + 1}
                </div>
                <p className="text-[#FDFBF7]/90 text-sm leading-relaxed font-light group-hover:text-[#FDFBF7] transition-colors">
                  {tujuan}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tuan Rumah Section */}
        <motion.div
          id="tuan-rumah"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1 }}
          className="w-full max-w-4xl mb-24"
        >
          <div className="text-center mb-10">
            <h2 className={`text-4xl text-[#D4AF37] ${playfair.className}`}>Tuan Rumah Kegiatan</h2>
            <p className="text-sm text-[#FDFBF7]/70 mt-2 font-light">Musyawarah Pelayanan (Mupel) GPIB Bekasi</p>
            <div className="w-24 h-1 bg-[#D4AF37]/50 mx-auto mt-6 rounded-full" />
          </div>

          <div className="bg-[#022c22]/40 backdrop-blur-md border border-[#D4AF37]/20 rounded-[2rem] p-5 md:p-12 shadow-2xl relative overflow-hidden">
            {/* Ambient gold glow */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
            
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
               {/* Left Side: Profile & Map */}
               <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                 <div className="space-y-4">
                   <p className="text-[#FDFBF7]/80 text-base md:text-lg leading-relaxed font-light text-justify">
                      <strong>Musyawarah Pelayanan (Mupel) GPIB Bekasi</strong> merupakan persekutuan pelayanan, kesaksian, dan wadah misioner lintas jemaat di bawah naungan Gereja Protestan di Indonesia bagian Barat (GPIB) untuk wilayah Bekasi Kota dan Kabupaten.
                   </p>
                   <p className="text-[#FDFBF7]/80 text-base md:text-lg leading-relaxed font-light text-justify">
                     Sebagai tuan rumah perayaan dan ibadah syukur HUT ke-16 Pelkat PKLU GPIB tingkat nasional tahun 2026, Mupel Bekasi mengoordinasikan seluruh persiapan demi kelancaran dan kenyamanan para lansia teladan dari penjuru Nusantara.
                   </p>
                 </div>
 
                 {/* Map Section - Landscape at the left bottom, stretches to align bottom border */}
                 <div className="flex-grow flex flex-col space-y-3">
                   <h3 className={`text-xl text-[#D4AF37] font-semibold ${playfair.className} text-center md:text-left`}>
                     Peta Sebaran Jemaat Mupel Bekasi
                   </h3>
                   <div className="w-full flex-grow rounded-2xl overflow-hidden relative min-h-[300px] md:min-h-[350px] lg:h-0">
                     <MupelMap />
                   </div>
                 </div>
               </div>

              {/* Right Side: Congregation List Card */}
              <div className="lg:col-span-5 bg-[#022c22]/80 border border-[#D4AF37]/30 rounded-2xl p-6 space-y-4 font-sans">
                <div className="border-b border-[#D4AF37]/20 pb-3">
                  <h3 className={`text-xl text-[#D4AF37] font-semibold ${playfair.className}`}>Mupel GPIB Bekasi</h3>
                  <p className="text-[10px] text-[#FDFBF7]/50 uppercase tracking-widest mt-1">Struktur & Cakupan Wilayah</p>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-[#FDFBF7]/60">Ketua BP Mupel:</span>
                    <span className="font-medium text-[#FDFBF7] text-right">Pdt. Daniel J. C. Lumentut</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-[#FDFBF7]/60">Jumlah Jemaat:</span>
                    <span className="font-semibold text-[#D4AF37]">15 Jemaat GPIB</span>
                  </div>
                  <div className="flex flex-col gap-2 py-1">
                    <span className="text-[#FDFBF7]/60 mb-1">Daftar Jemaat Anggota Mupel:</span>
                    <div className="space-y-1 text-xs text-[#FDFBF7]/85">
                      {[
                        { name: 'Anugerah', loc: 'Tambun' },
                        { name: 'Bahtera Kasih', loc: 'Jatisampurna' },
                        { name: 'Dian Kasih', loc: 'Jatisampurna' },
                        { name: 'Galilea', loc: 'Kemang Pratama / Villa Galaxy' },
                        { name: 'Gloria', loc: 'Jaka Sampurna / Bekasi Barat' },
                        { name: 'Gratia', loc: 'Taman Wisma Asri' },
                        { name: 'Harapan Baru', loc: 'Harapan Baru Regency' },
                        { name: 'Harapan Indah', loc: 'Melati Indah' },
                        { name: 'Harapan Kasih', loc: 'Harapan Jaya' },
                        { name: 'Immanuel', loc: 'Kompleks TNI AU Jaladhapura' },
                        { name: 'Jatipon', loc: 'Jatibening/Pondok Gede' },
                        { name: 'Karang Satria', loc: 'Tambun Utara' },
                        { name: 'Menara Kasih', loc: 'Jatiasih' },
                        { name: 'Pilar Asih', loc: 'Bojong Rawalumbu' },
                        { name: 'Pondok Ungu', loc: 'Pondok Ungu Permai' }
                      ].map((j, i) => (
                        <div 
                          key={i} 
                          id={`jemaat-${j.name.toLowerCase().replace(/\s+/g, '-')}`}
                          className="flex gap-2 py-0.5 border-b border-white/5 last:border-b-0 hover:bg-[#D4AF37]/5 px-2 rounded transition-colors duration-500"
                        >
                          <span className="text-[#D4AF37] font-semibold w-4 flex-shrink-0">{i + 1}.</span>
                          <span>
                            GPIB "{j.name}" {j.loc ? <span className="text-[#FDFBF7]/50 ml-1">({j.loc})</span> : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bentuk dan Rangkaian Kegiatan Section */}
        <motion.div
          id="kegiatan"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1 }}
          className="w-full max-w-5xl mb-24"
        >
          <div className="text-center mb-12">
            <h2 className={`text-4xl md:text-5xl text-[#D4AF37] ${playfair.className}`}>Rangkaian Kegiatan</h2>
            <div className="w-24 h-1 bg-[#D4AF37]/50 mx-auto mt-6 rounded-full" />
          </div>
          
          <div className="flex flex-col gap-6">
            {/* Pra-Kegiatan */}
            <div className="rounded-[2rem] p-[1px] bg-gradient-to-r from-[#D4AF37]/30 via-[#D4AF37]/10 to-transparent">
              <div className="bg-[#022c22]/90 backdrop-blur-xl rounded-[calc(2rem-1px)] p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30">
                  <Star className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className={`text-2xl text-[#FDFBF7] mb-2 ${playfair.className}`}>Pra-Kegiatan</h3>
                  <p className="text-[#D4AF37] uppercase tracking-widest text-xs font-semibold mb-6">Beragam Lomba & Webinar</p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-4">
                      <CheckCircle2 className="w-5 h-5 text-[#D4AF37]/70 flex-shrink-0 mt-1" />
                      <p className="text-[#FDFBF7]/80 font-light leading-relaxed"><strong className="text-[#FDFBF7] font-medium block md:inline mr-2">Lomba Puisi:</strong> Ekspresi iman dan pengalaman hidup kaum lanjut usia.</p>
                    </li>
                    <li className="flex items-start gap-4">
                      <CheckCircle2 className="w-5 h-5 text-[#D4AF37]/70 flex-shrink-0 mt-1" />
                      <p className="text-[#FDFBF7]/80 font-light leading-relaxed"><strong className="text-[#FDFBF7] font-medium block md:inline mr-2">Lomba Artikel & Video Singkat:</strong> Lansia Teladan; karya inspiratif dari kaum lansia.</p>
                    </li>
                    <li className="flex items-start gap-4">
                      <CheckCircle2 className="w-5 h-5 text-[#D4AF37]/70 flex-shrink-0 mt-1" />
                      <p className="text-[#FDFBF7]/80 font-light leading-relaxed"><strong className="text-[#FDFBF7] font-medium block md:inline mr-2">Webinar:</strong> Bijak Mengelola Berkat & Persiapan Finansial di Usia Emas.</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Puncak Acara */}
            <div className="rounded-[2rem] p-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-[#D4AF37]/30">
              <div className="bg-[#022c22]/90 backdrop-blur-xl rounded-[calc(2rem-1px)] p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30">
                  <Star className="w-8 h-8 text-[#D4AF37] fill-[#D4AF37]/20" />
                </div>
                <div>
                  <h3 className={`text-2xl text-[#FDFBF7] mb-2 ${playfair.className}`}>Puncak Acara (12 Okt 2026)</h3>
                  <p className="text-[#D4AF37] uppercase tracking-widest text-xs font-semibold mb-6">Ibadah Syukur & Seremonial</p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-4">
                      <CheckCircle2 className="w-5 h-5 text-[#D4AF37]/70 flex-shrink-0 mt-1" />
                      <p className="text-[#FDFBF7]/80 font-light leading-relaxed"><strong className="text-[#FDFBF7] font-medium block md:inline mr-2">Ibadah Syukur:</strong> Pusat perayaan dan ungkapan syukur kepada Tuhan.</p>
                    </li>
                    <li className="flex items-start gap-4">
                      <CheckCircle2 className="w-5 h-5 text-[#D4AF37]/70 flex-shrink-0 mt-1" />
                      <p className="text-[#FDFBF7]/80 font-light leading-relaxed"><strong className="text-[#FDFBF7] font-medium block md:inline mr-2">Seremonial & Keakraban:</strong> Pagelaran seni lansia, peniupan lilin, dan pengumuman lomba.</p>
                    </li>
                    <li className="flex items-start gap-4">
                      <CheckCircle2 className="w-5 h-5 text-[#D4AF37]/70 flex-shrink-0 mt-1" />
                      <p className="text-[#FDFBF7]/80 font-light leading-relaxed"><strong className="text-[#FDFBF7] font-medium block md:inline mr-2">Target Peserta:</strong> ±600 orang dari pengurus dan anggota Pelkat PKLU GPIB di Indonesia.</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Glassmorphism Event Details & Map */}
        <motion.div
          id="waktu-tempat"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl rounded-[2rem] p-[1px] bg-gradient-to-b from-[#D4AF37]/40 via-[#D4AF37]/10 to-transparent mb-12"
        >
          <div className="w-full bg-[#022c22]/80 backdrop-blur-3xl rounded-[calc(2rem-1px)] p-6 md:p-12 overflow-hidden">
            
            <div className="text-center mb-10">
              <h2 className={`text-4xl text-[#D4AF37] ${playfair.className}`}>Waktu & Tempat</h2>
              <div className="w-24 h-1 bg-[#D4AF37]/50 mx-auto mt-6 rounded-full" />
            </div>

            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
              
              <div className="flex gap-6 items-start">
                <div className="w-14 h-14 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/20">
                  <Calendar className="w-6 h-6 text-[#D4AF37]" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className={`font-semibold text-[#FDFBF7] text-2xl md:text-3xl mb-1 ${playfair.className}`}>12 Oktober 2026</h3>
                  <p className="text-[#D4AF37] font-medium uppercase tracking-widest text-xs mb-2">Senin</p>
                  <p className="text-[#FDFBF7]/60 font-light text-xs flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Ibadah Syukur & Perayaan
                  </p>
                </div>
              </div>
              
              <div className="flex gap-6 items-start">
                <div className="w-14 h-14 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/20">
                  <MapPin className="w-6 h-6 text-[#D4AF37]" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className={`font-semibold text-[#FDFBF7] text-xl md:text-2xl mb-2 ${playfair.className}`}>Bekasi Convention Center</h3>
                  <p className="text-[#FDFBF7]/85 tracking-wide font-light leading-relaxed mb-4 text-sm md:text-base">
                    Hotel Santika Mega Mall Bekasi <br/>
                    <span className="opacity-70 text-xs md:text-sm">Jl. Ahmad Yani No.1, Marga Jaya, Kec. Bekasi Selatan, Kota Bekasi, Jawa Barat 17141</span>
                  </p>
                  <a href="https://www.google.com/maps/search/?api=1&query=Bekasi+Convention+Center" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#F3E5AB] transition-colors text-xs md:text-sm font-medium border-b border-transparent hover:border-[#F3E5AB] pb-1">
                    Buka di Google Maps <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

            </div>
          </div>
        </motion.div>

        {/* Rundown Acara Section */}
        <motion.div
          id="rundown"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1 }}
          className="w-full max-w-4xl mb-24 mt-12"
        >
          <div className="text-center mb-12">
            <h2 className={`text-4xl md:text-5xl text-[#D4AF37] ${playfair.className}`}>Rundown Acara</h2>
            <div className="w-24 h-1 bg-[#D4AF37]/50 mx-auto mt-6 rounded-full" />
          </div>

          {/* Tabs Selector */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mb-12 px-4">
            <button
              onClick={() => setActiveRundown('pra')}
              className={`relative w-full sm:w-auto text-center px-6 py-3 rounded-full text-xs md:text-sm font-semibold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                activeRundown === 'pra'
                  ? 'text-[#022c22] bg-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                  : 'text-[#FDFBF7]/60 border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:text-[#FDFBF7]'
              }`}
            >
              Pra-Kegiatan (Lomba & Webinar)
            </button>
            <button
              onClick={() => setActiveRundown('puncak')}
              className={`relative w-full sm:w-auto text-center px-6 py-3 rounded-full text-xs md:text-sm font-semibold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                activeRundown === 'puncak'
                  ? 'text-[#022c22] bg-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                  : 'text-[#FDFBF7]/60 border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:text-[#FDFBF7]'
              }`}
            >
              Acara Puncak (12 Okt)
            </button>
          </div>

          <div className="relative border-l border-[#D4AF37]/30 ml-4 md:ml-40 pl-6 md:pl-10 space-y-10">
            <AnimatePresence mode="wait">
              {activeRundown === 'puncak' ? (
                <motion.div
                  key="puncak"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-10"
                >
                  {puncakRundown.map((item, idx) => (
                    <div key={idx} className="relative group">
                      {/* dot */}
                      <div className="absolute -left-[31px] md:-left-[47px] top-1.5 w-4 h-4 rounded-full bg-[#022c22] border-2 border-[#D4AF37] group-hover:bg-[#D4AF37] transition-all duration-300 shadow-[0_0_5px_rgba(212,175,55,0.4)]" />
                      
                      {/* time on left */}
                      <div className="hidden md:block md:absolute md:-left-44 md:top-1 md:w-32 md:text-right font-semibold text-[#D4AF37] text-sm md:text-base">
                        <div>{item.time}</div>
                        <div className="text-[10px] text-[#FDFBF7]/50 font-normal mt-0.5">Durasi: {item.duration}</div>
                      </div>
                      
                      {/* content */}
                      <div className="p-6 rounded-2xl bg-[#022c22]/40 backdrop-blur-sm border border-[#D4AF37]/20 hover:border-[#D4AF37]/45 hover:bg-[#D4AF37]/5 transition-all duration-300 shadow-md">
                        <div className="md:hidden text-xs text-[#D4AF37] font-semibold mb-2 flex items-center gap-2">
                          <span>{item.time}</span>
                          <span className="opacity-40">•</span>
                          <span>Durasi: {item.duration}</span>
                        </div>
                        <h3 className={`text-lg md:text-xl text-[#FDFBF7] font-semibold mb-2 ${playfair.className}`}>
                          {item.title}
                        </h3>
                        <p className="text-[#FDFBF7]/70 text-sm font-light leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="pra"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-10"
                >
                  {praKegiatanRundown.map((item, idx) => (
                    <div key={idx} className="relative group">
                      {/* dot */}
                      <div className="absolute -left-[31px] md:-left-[47px] top-1.5 w-4 h-4 rounded-full bg-[#022c22] border-2 border-[#D4AF37] group-hover:bg-[#D4AF37] transition-all duration-300 shadow-[0_0_5px_rgba(212,175,55,0.4)]" />
                      
                      {/* period on left */}
                      <div className="hidden md:block md:absolute md:-left-44 md:top-1 md:w-32 md:text-right font-semibold text-[#D4AF37] text-sm md:text-base leading-tight">
                        <div>{item.period}</div>
                      </div>
                      
                      {/* content */}
                      <div className="p-6 rounded-2xl bg-[#022c22]/40 backdrop-blur-sm border border-[#D4AF37]/20 hover:border-[#D4AF37]/45 hover:bg-[#D4AF37]/5 transition-all duration-300 shadow-md">
                        <div className="md:hidden text-xs text-[#D4AF37] font-semibold mb-2">
                          {item.period}
                        </div>
                        <h3 className={`text-lg md:text-xl text-[#FDFBF7] font-semibold mb-2 ${playfair.className}`}>
                          {item.title}
                        </h3>
                        <p className="text-[#FDFBF7]/70 text-sm font-light leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Himbauan Dukungan Pelayanan Section */}
        <motion.div
          id="dukungan"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1 }}
          className="w-full max-w-4xl mb-16 text-center space-y-8 mt-12"
        >
          <div className="w-24 h-1 bg-[#D4AF37]/50 mx-auto mt-6 rounded-full" />
          
          <div className="relative p-6 md:p-12 rounded-[2rem] bg-gradient-to-br from-[#033B2B]/60 to-[#022c22]/40 backdrop-blur-md border border-[#D4AF37]/35 shadow-2xl">
            {/* Soft background glow */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-[#047857]/10 rounded-full blur-3xl pointer-events-none" />
            
            <h2 className={`text-3xl md:text-4xl text-[#D4AF37] mb-6 ${playfair.className} font-semibold`}>
              Mari Menjadi Saluran Berkat
            </h2>
            
            <div className="space-y-6 text-[#FDFBF7]/90 text-base md:text-lg leading-relaxed text-center font-light max-w-3xl mx-auto mb-10">
              <p>
                Setiap dukungan dan persembahan kasih yang Anda salurkan merupakan wujud nyata kepedulian bagi pelayanan kaum lanjut usia Pelkat PKLU GPIB. Mari bersama-sama kita sokong perayaan syukur HUT ke-16 ini agar para orang tua kita senantiasa dikuatkan untuk terus berkarya, menjadi teladan iman, serta saksi kasih Kristus yang hidup.
              </p>
              <p className={`text-[#D4AF37] ${playfair.className} italic font-medium text-lg md:text-xl`}>
                "Sampai masa tuamu Aku tetap Dia dan sampai masa putih rambutmu Aku menggendong kamu." <br/>
                <span className="text-xs not-italic font-sans text-[#FDFBF7]/60 block mt-2 uppercase tracking-widest">— Yesaya 46:4</span>
              </p>
            </div>
            
            <div className="flex justify-center">
              <button 
                onClick={() => setIsOpenModal(true)}
                className="group relative overflow-hidden rounded-full bg-transparent px-6 py-3 transition-all hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(212,175,55,0.15)] cursor-pointer"
              >
                {/* Button Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] opacity-90 transition-opacity group-hover:opacity-100" />
                
                {/* Shimmer Effect */}
                <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-[#FDFBF7]/40 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
                
                <div className="relative flex items-center justify-center gap-2">
                  <span className="font-semibold text-[#022c22] text-xs md:text-sm tracking-wider uppercase">
                    Salurkan Dukungan Kasih
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#022c22] transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </button>
            </div>
          </div>
        </motion.div>



        {/* Footer Credits */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 mb-8 w-full max-w-5xl border-t border-[#D4AF37]/20 pt-8 flex flex-col items-center gap-2 text-center"
        >
          <p className="text-[10px] md:text-xs text-[#FDFBF7]/30 tracking-[0.2em] uppercase">
            © 2026 Pelkat PKLU GPIB Mupel Bekasi. All Rights Reserved.
          </p>
        </motion.div>

      </div>

      {/* Modal Form Calon Donatur */}
      <AnimatePresence>
        {isOpenModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md bg-[#022c22] border border-[#D4AF37]/30 rounded-2xl p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Gold light effects inside modal */}
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none" />
              
              {/* Close Button */}
              <button 
                type="button"
                onClick={() => {
                  if (!submitting) {
                    setIsOpenModal(false)
                    setModalForm({ name: '', phone: '', type: 'donatur' })
                  }
                }}
                className="absolute top-4 right-4 p-1.5 rounded-full border border-[#D4AF37]/20 text-[#D4AF37] hover:text-[#FDFBF7] hover:bg-[#D4AF37]/10 transition-all cursor-pointer"
                disabled={submitting}
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mb-6">
                <h3 className={`text-2xl font-bold text-[#FDFBF7] ${playfair.className}`}>
                  Salurkan Dukungan Kasih
                </h3>
                <p className="text-xs text-[#D4AF37] mt-1.5 font-light leading-relaxed">
                  Dukungan dana dapat ditransfer ke rekening resmi panitia di bawah ini. Setelah transfer, mohon isi data konfirmasi agar dapat kami catat &amp; tindaklanjuti.
                </p>
              </div>

              {/* Informasi Rekening Resmi inside Modal */}
              <div className="mb-6 p-4 rounded-xl bg-black/40 border border-[#D4AF37]/30 text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-2">
                  <span className="text-[#D4AF37] font-semibold uppercase tracking-wider">Rekening Transfer Panitia</span>
                  <span className="text-[10px] text-emerald-400 font-medium">Bank Resmi</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-[#FDFBF7]">
                  <div>
                    <span className="text-white/50 block text-[10px] uppercase">Bank</span>
                    <span className="font-semibold text-sm">Bank BTN</span>
                  </div>
                  <div>
                    <span className="text-white/50 block text-[10px] uppercase">Atas Nama</span>
                    <span className="font-semibold text-[11px] truncate block" title="PANITIA MUPEL GPIB BEKASI">PANITIA MUPEL GPIB BEKASI</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <span className="text-white/50 block text-[10px] uppercase">Nomor Rekening</span>
                    <span className="font-mono text-sm tracking-wider font-semibold text-[#FDFBF7] select-all">
                      00179-01-88-000447-9
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex-shrink-0 px-2.5 py-1.5 rounded bg-[#D4AF37]/20 hover:bg-[#D4AF37]/35 text-[#D4AF37] hover:text-[#FDFBF7] border border-[#D4AF37]/30 transition-all duration-300 active:scale-95 text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Tersalin" : "Salin"}
                  </button>
                </div>
              </div>

              <form onSubmit={handleModalSubmit} className="space-y-5">
                {/* Nama Input */}
                <div>
                  <label className="text-[#D4AF37] font-semibold text-xs uppercase tracking-wider">
                    Nama Lengkap / Instansi
                  </label>
                  <input
                    type="text"
                    required
                    disabled={submitting}
                    value={modalForm.name}
                    onChange={(e) => setModalForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Contoh: Bpk. John Doe / PT. Makmur"
                    className="w-full p-3 bg-black/20 border border-[#D4AF37]/30 text-[#FDFBF7] rounded-lg focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all text-sm mt-1.5 placeholder-white/20"
                  />
                </div>

                {/* No WA Input */}
                <div>
                  <label className="text-[#D4AF37] font-semibold text-xs uppercase tracking-wider">
                    Nomor WhatsApp (Aktif)
                  </label>
                  <input
                    type="tel"
                    required
                    disabled={submitting}
                    value={modalForm.phone}
                    onChange={(e) => setModalForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Contoh: 08123456789"
                    className="w-full p-3 bg-black/20 border border-[#D4AF37]/30 text-[#FDFBF7] rounded-lg focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all text-sm mt-1.5 placeholder-white/20"
                  />
                </div>

                {/* Jenis Dukungan */}
                <div>
                  <label className="text-[#D4AF37] font-semibold text-xs uppercase tracking-wider block mb-2">
                    Jenis Dukungan
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => setModalForm(prev => ({ ...prev, type: 'donatur' }))}
                      className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                        modalForm.type === 'donatur'
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#FDFBF7] font-medium shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                          : 'border-[#D4AF37]/20 bg-black/20 text-[#FDFBF7]/60 hover:border-[#D4AF37]/45'
                      }`}
                    >
                      <div className="text-xs uppercase tracking-wider">Donasi</div>
                      <div className="text-[10px] opacity-60 mt-0.5">Sebagai Donatur</div>
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => setModalForm(prev => ({ ...prev, type: 'sponsorship' }))}
                      className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                        modalForm.type === 'sponsorship'
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#FDFBF7] font-medium shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                          : 'border-[#D4AF37]/20 bg-black/20 text-[#FDFBF7]/60 hover:border-[#D4AF37]/45'
                      }`}
                    >
                      <div className="text-xs uppercase tracking-wider">Sponsor</div>
                      <div className="text-[10px] opacity-60 mt-0.5">Sponsorship Paket</div>
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] hover:opacity-90 disabled:opacity-50 text-[#022c22] py-3.5 text-sm font-semibold rounded-lg mt-6 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(212,175,55,0.2)] animate-in fade-in"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memproses Data...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      Kirim & Chat WhatsApp
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Committee Access Button */}
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <Link 
          href="/dashboard" 
          className="group relative flex items-center gap-2 px-4 py-2.5 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.5),_0_0_20px_rgba(212,175,55,0.15)] border border-[#D4AF37]/30 hover:border-[#D4AF37]/70 bg-[#022c22]/90 backdrop-blur-md cursor-pointer"
        >
          {/* Subtle Shimmer Background on Hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-gradient-to-r from-transparent via-[#D4AF37]/15 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] ease-out" />
          
          {/* Small glowing dot */}
          <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/70 group-hover:bg-[#D4AF37] group-hover:shadow-[0_0_8px_#D4AF37] transition-all duration-300" />
          
          <ShieldCheck className="w-4 h-4 text-[#D4AF37]/90 group-hover:text-[#D4AF37] transition-colors" />
          
          <span className="text-[10px] md:text-xs text-[#FDFBF7]/70 group-hover:text-[#D4AF37] tracking-[0.25em] uppercase font-semibold transition-colors duration-300">
            Akses Panitia
          </span>
        </Link>
      </motion.div>
    </div>
  )
}