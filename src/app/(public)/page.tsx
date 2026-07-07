'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, MapPin, ArrowRight, Quote, CheckCircle2, Star, Clock, Copy, Check, MessageSquare, Loader2, X, UserCheck, ShoppingBag, HeartHandshake, Sparkles } from 'lucide-react'
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

const servicesData = [
  {
    title: "Pendaftaran Peserta",
    subtitle: "Portal Registrasi Acara",
    desc: "Daftar secara perorangan maupun rombongan utusan jemaat GPIB untuk menghadiri Ibadah Syukur Agung dan Perayaan HUT ke-16 PKLU.",
    href: "/daftar",
    badge: "Resmi",
    btnText: "Mulai Registrasi Peserta",
    specs: [
      { label: "Metode Pendaftaran", value: "Online (Mandiri / Rombongan)" },
      { label: "Sasaran Peserta", value: "Anggota Pelkat PKLU GPIB se-Indonesia" },
      { label: "Fasilitas Acara", value: "Seminar Kit, Konsumsi & ID Card" },
      { label: "Bukti Keikutsertaan", value: "E-Ticket dengan QR Code Verifikasi" }
    ]
  },
  {
    title: "Amanaura & Kit Sosmed",
    subtitle: "Kampanye & Bingkai Foto",
    desc: "Dukung perayaan dengan memasang bingkai foto mewah resmi HUT PKLU GPIB dan salin teks caption untuk dibagikan ke media sosial Anda.",
    href: "/amanaura",
    badge: "Kampanye",
    btnText: "Buat Bingkai Amanaura",
    specs: [
      { label: "Jenis Produk", value: "Amanaura Resmi Digital" },
      { label: "Kualitas Gambar", value: "High Definition (HD PNG)" },
      { label: "Teks Pendukung", value: "Caption & Hashtag Otomatis" },
      { label: "Proses Unduh", value: "Instan langsung ke perangkat Anda" }
    ]
  },
  {
    title: "Pemesanan Merchandise",
    subtitle: "Souvenir & Atribut Resmi",
    desc: "Miliki kaos edisi khusus, topi, pin logam, mug, dan goodie bag souvenir eksklusif sebagai kenang-kenangan perayaan HUT ke-16.",
    href: "/merch",
    badge: "Souvenir",
    btnText: "Pesan Merchandise",
    specs: [
      { label: "Pilihan Produk", value: "Kaos Eksklusif, Mug, Topi, Goodie Bag, Pin" },
      { label: "Bahan Pakaian", value: "Premium Cotton Combed 30s" },
      { label: "Sistem Pemesanan", value: "Pre-order online dengan konfirmasi WA" },
      { label: "Distribusi", value: "Pengambilan di lokasi acara / jasa kurir" }
    ]
  },
  {
    title: "Buku Tamu & Ucapan Doa",
    subtitle: "Gema Doa Sukacita",
    desc: "Kirim ucapan selamat, harapan, dan doa sukacita Anda untuk HUT ke-16 Pelkat PKLU GPIB agar tampil di halaman utama ini.",
    href: "/ucapan",
    badge: "Publik",
    btnText: "Tulis Ucapan Selamat",
    specs: [
      { label: "Kategori Pesan", value: "Doa, Harapan & Ucapan Syukur" },
      { label: "Sifat Akses", value: "Publik & Terbuka untuk umum" },
      { label: "Moderasi Konten", value: "Penyaringan pesan oleh panitia" },
      { label: "Penayangan", value: "Slider halaman utama & Galeri ucapan" }
    ]
  }
];

const faqData = [
  {
    question: "Bagaimana cara mendaftar sebagai peserta perayaan HUT ke-16 PKLU?",
    answer: "Pendaftaran dapat dilakukan secara online melalui halaman Pendaftaran. Anda dapat mendaftar sebagai peserta mandiri (perorangan), atau mendaftarkan rombongan utusan jemaat GPIB Anda secara kolektif dengan melampirkan berkas surat mandat jemaat."
  },
  {
    question: "Apakah perayaan ini hanya untuk anggota PKLU GPIB Mupel Bekasi?",
    answer: "Tidak. Perayaan HUT ke-16 Pelkat PKLU GPIB tingkat nasional ini terbuka untuk seluruh pengurus, anggota, jemaat, dan simpatisan Pelkat PKLU GPIB dari seluruh jemaat Mupel di Indonesia."
  },
  {
    question: "Bagaimana cara memesan merchandise resmi dan kapan pengambilannya?",
    answer: "Pemesanan dapat dilakukan melalui menu Merchandise pada website ini. Anda dapat memilih item, mengisi form pesanan, dan melakukan transfer pembayaran. Souvenir dapat diambil di lokasi acara (Bekasi Convention Center) saat registrasi ulang pada tanggal 12 Oktober 2026."
  },
  {
    question: "Bagaimana jika ingin berpartisipasi memberikan dukungan kasih (sponsorship/donasi)?",
    answer: "Kami sangat bersyukur atas setiap dukungan kasih. Anda dapat menekan tombol 'Salurkan Dukungan Kasih' di bagian bawah halaman ini, melakukan transfer ke rekening Bank BTN panitia, lalu mengisi konfirmasi data untuk dihubungi oleh tim humas kami."
  },
  {
    question: "Di mana lokasi acara puncak dan bagaimana akses ke sana?",
    answer: "Acara puncak diselenggarakan di Bekasi Convention Center (Hotel Santika Mega City Bekasi), yang berlokasi strategis di dekat Gerbang Tol Bekasi Barat dan pusat perbelanjaan Mall Mega Bekasi, memudahkan akses transportasi bagi jemaat dari luar kota."
  }
];

export default function Home() {
  const [copied, setCopied] = useState(false)
  const [activeRundown, setActiveRundown] = useState<'puncak' | 'pra'>('pra')
  const [wishes, setWishes] = useState<any[]>([])
  const [loadingWishes, setLoadingWishes] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [activeServiceTab, setActiveServiceTab] = useState<number>(0)
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null)

  // Scroll-Spy sections definition
  const sections = [
    { id: 'hero', label: 'Beranda' },
    { id: 'pendahuluan', label: 'Introduksi' },
    { id: 'layanan', label: 'Ekosistem Layanan' },
    { id: 'tujuan', label: 'Visi & Misi' },
    { id: 'tuan-rumah', label: 'Tuan Rumah' },
    { id: 'kegiatan', label: 'Rangkaian Kegiatan' },
    { id: 'waktu-tempat', label: 'Waktu & Lokasi' },
    { id: 'rundown', label: 'Rundown Acara' },
    { id: 'ucapan-selamat', label: 'Buku Tamu' },
    { id: 'faq', label: 'FAQ' },
    { id: 'dukungan', label: 'Saluran Berkat' }
  ]

  const [activeSection, setActiveSection] = useState('hero')
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      // 1. Calculate scroll progress
      const winScroll = window.scrollY
      const height = document.documentElement.scrollHeight - window.innerHeight
      if (height > 0) {
        setScrollProgress((winScroll / height) * 100)
      }

      // 2. Detect active section
      // We offset the check line slightly (1/3 of the viewport height) to transition early
      const scrollPosition = winScroll + window.innerHeight / 3

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        const el = document.getElementById(section.id)
        if (el) {
          const offsetTop = el.offsetTop
          if (scrollPosition >= offsetTop) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    // Initial call to set active section
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const fetchWishes = async () => {
      try {
        const { data, error } = await supabase
          .from('guestbook_messages')
          .select('*')
          .eq('is_approved', true)
          .order('created_at', { ascending: false })
          .limit(8)

        if (!error && data) {
          setWishes(data)
        }
      } catch (err) {
        console.error('Error fetching wishes on home:', err)
      } finally {
        setLoadingWishes(false)
      }
    }
    fetchWishes()
  }, [])

  // Autoplay slider logic
  useEffect(() => {
    if (wishes.length <= 1) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % wishes.length)
    }, 7000)
    return () => clearInterval(interval)
  }, [wishes])

  const handleNextSlide = () => {
    if (wishes.length === 0) return
    setCurrentSlide((prev) => (prev + 1) % wishes.length)
  }

  const handlePrevSlide = () => {
    if (wishes.length === 0) return
    setCurrentSlide((prev) => (prev - 1 + wishes.length) % wishes.length)
  }

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
    <div id="hero" className="relative w-full">
      {/* Ambient Background & Grid/Noise */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#022c22]" />

        {/* Animated Gold light orb */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.12, 0.18, 0.12],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#D4AF37] rounded-full blur-[150px] md:blur-[220px] gpu-accelerated will-change-transform"
        />

        {/* Animated Emerald light orb */}
        <motion.div
          animate={{
            scale: [1.1, 0.95, 1.1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-[-15%] left-[-10%] w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] bg-[#047857] rounded-full blur-[150px] md:blur-[220px] gpu-accelerated will-change-transform"
        />

        {/* Minimal Thin Grid Lines Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60" />

        {/* Noise overlay */}
        <div
          className="absolute inset-0 opacity-[0.025] mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
        />
      </div>

      {/* Decorative vertical lines on sides */}
      <div className="absolute left-[5%] right-[5%] top-0 bottom-0 pointer-events-none z-10 hidden lg:block">
        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#D4AF37]/0 via-[#D4AF37]/10 to-[#D4AF37]/0" />
        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-[#D4AF37]/0 via-[#D4AF37]/10 to-[#D4AF37]/0" />
      </div>

      {/* Sticky Mobile Sub-header & Progress Tracker */}
      <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-[#022c22]/90 backdrop-blur-md border-b border-[#D4AF37]/15 py-2 px-6 flex items-center justify-between transition-all duration-300">
        <span className="text-[10px] font-bold text-[#D4AF37] tracking-[0.2em] uppercase truncate pr-4">
          {sections.find(s => s.id === activeSection)?.label || 'Beranda'}
        </span>
        <span className="text-[9px] font-mono text-gray-400 select-none shrink-0">
          {sections.findIndex(s => s.id === activeSection) + 1} / {sections.length}
        </span>
        <div
          className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#B8860B] transition-all duration-100"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Desktop Vertical Dot Navigation */}
      <div className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 flex-col gap-3.5 z-45 select-none">
        {sections.map((section) => {
          const isActive = activeSection === section.id
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="group relative flex items-center justify-end"
            >
              <span className={`absolute right-6 text-[10px] tracking-wider uppercase bg-[#022c22]/95 border border-[#D4AF37]/35 text-[#D4AF37] px-2 py-1 rounded backdrop-blur-md opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap font-medium font-sans ${isActive ? 'opacity-100 translate-x-0 border-[#D4AF37]' : ''}`}>
                {section.label}
              </span>
              <div className={`w-2.5 h-2.5 rounded-full border transition-all duration-300 ${isActive
                  ? 'bg-[#D4AF37] border-[#D4AF37] scale-125 shadow-[0_0_8px_#D4AF37]'
                  : 'border-gray-500 bg-transparent group-hover:border-[#D4AF37] group-hover:scale-110'
                }`} />
            </a>
          )
        })}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-24 flex flex-col items-center">

        {/* Floating Token Image */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-48 h-48 xs:w-64 xs:h-64 sm:w-72 sm:h-72 md:w-96 md:h-96 mb-8 sm:mb-12 gpu-accelerated will-change-transform"
        >
          {/* Subtle gold glow behind the token */}
          <div className="absolute inset-0 bg-radial-gradient from-[#D4AF37]/25 to-transparent blur-2xl rounded-full scale-75 opacity-80" />

          <motion.div
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full relative gpu-accelerated will-change-transform"
          >
            <Image
              src="/logo_hut16_pklu.png"
              alt="Logo Resmi HUT 16 PKLU GPIB"
              fill
              sizes="(max-width: 768px) 192px, 384px"
              className="object-contain relative z-10 drop-shadow-[0_25px_35px_rgba(0,0,0,0.6)]"
              priority
            />
          </motion.div>
        </motion.div>

        {/* Typography Hero Titles */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="w-full text-center space-y-6 sm:space-y-8 mb-12 sm:mb-16 max-w-4xl px-2"
        >
          <motion.p variants={fadeIn} className="text-[#D4AF37] font-bold tracking-[0.15em] sm:tracking-[0.25em] uppercase text-[10px] sm:text-xs md:text-sm">
            Perayaan & Ibadah Syukur Nasional
          </motion.p>

          <motion.h1
            variants={fadeIn}
            className={`text-4xl xs:text-5xl md:text-7xl lg:text-8xl text-transparent bg-clip-text bg-gradient-to-b from-[#FDFBF7] to-[#FDFBF7]/60 leading-[1.1] md:leading-tight tracking-tight ${playfair.className}`}
          >
            HUT ke-16 <br />
            <span className="bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#B8860B] bg-clip-text text-transparent font-bold">
              Pelkat PKLU GPIB
            </span>
          </motion.h1>

          <motion.div variants={fadeIn} className="flex items-center justify-center gap-3 sm:gap-6 py-2 sm:py-4 opacity-90">
            <div className="h-[1px] w-8 xs:w-12 md:w-24 bg-gradient-to-r from-transparent to-[#D4AF37]" />
            <span className={`text-xl sm:text-2xl md:text-4xl text-[#D4AF37] ${playfair.className} italic font-light whitespace-nowrap`}>
              "Teruskan Baktimu!"
            </span>
            <div className="h-[1px] w-8 xs:w-12 md:w-24 bg-gradient-to-l from-transparent to-[#D4AF37]" />
          </motion.div>

          <motion.div variants={fadeIn} className="space-y-3 px-4">
            <p className="text-[#FDFBF7]/90 text-base sm:text-lg md:text-2xl font-light tracking-wide">
              Bertumbuh Dalam Keselamatan
              <span className="block xs:inline-block text-[#D4AF37] text-xs sm:text-sm md:text-base opacity-75 xs:ml-2 font-medium tracking-normal italic mt-1 xs:mt-0">
                (1 Petrus 2:2)
              </span>
            </p>
            <p className={`text-[#FDFBF7]/70 text-sm sm:text-base md:text-xl max-w-2xl mx-auto ${playfair.className} italic leading-relaxed`}>
              Lansia Teladan dalam Iman, Karya, dan Pelayanan
            </p>
          </motion.div>

          {/* Tagline Ribbon */}
          <motion.div variants={fadeIn} className="mt-6 sm:mt-8 py-3 sm:py-4 border-y border-[#D4AF37]/20 w-[90%] sm:w-3/4 mx-auto backdrop-blur-sm bg-[#022c22]/10 rounded-lg">
            <p className="text-[#FDFBF7]/95 text-[9px] sm:text-[10px] md:text-xs tracking-[0.15em] sm:tracking-[0.3em] uppercase text-center font-semibold flex flex-wrap justify-center items-center gap-y-1">
              <span>Untuk Lansia</span>
              <span className="text-[#D4AF37] mx-2 sm:mx-3">•</span>
              <span>Oleh Lansia</span>
              <span className="text-[#D4AF37] mx-2 sm:mx-3">•</span>
              <span>Bersama PKLU GPIB</span>
            </p>
          </motion.div>
        </motion.div>

        {/* Scroll Down Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 2, duration: 1 }}
          className="flex flex-col items-center gap-2 mb-16 select-none"
        >
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-medium font-sans">JELAJAHI</span>
          <div className="w-[18px] h-[30px] rounded-full border border-[#D4AF37]/45 flex justify-center p-1">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"
            />
          </div>
        </motion.div>

        {/* Pendahuluan Section */}
        <motion.div
          id="pendahuluan"
          initial={{ opacity: 0, y: 45 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl mb-16 md:mb-24 text-center space-y-6 sm:space-y-8 px-4"
        >
          <div className="flex justify-center mb-4">
            <Quote className="w-10 h-10 text-[#D4AF37] opacity-65" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold block">01. INTRODUKSI</span>
            <h2 className={`text-2xl sm:text-3xl md:text-5xl text-[#FDFBF7] tracking-tight font-medium italic ${playfair.className}`}>Pendahuluan</h2>
          </div>

          <div className="relative p-5 sm:p-12 rounded-[2rem] bg-black/40 backdrop-blur-md border border-[#D4AF37]/20 shadow-2xl">
            <p className={`text-lg sm:text-xl md:text-2xl text-[#FDFBF7] font-light italic leading-relaxed mb-6 sm:mb-8 px-2 ${playfair.className}`}>
              "Hiasan orang muda ialah kekuatannya, dan keindahan orang tua ialah uban."
              <br /><span className="text-xs sm:text-sm not-italic font-sans text-[#D4AF37] mt-4 block uppercase tracking-widest font-bold">Amsal 20:29</span>
            </p>

            <div className="space-y-4 sm:space-y-6 text-[#FDFBF7]/85 text-sm sm:text-base md:text-lg leading-relaxed text-center sm:text-justify md:text-center font-light px-2 sm:px-4">
              <p>
                Uban di kepala adalah mahkota kemuliaan; tanda kesetiaan, pengalaman hidup, dan kasih Tuhan yang terus menyertai. Usia lanjut bukanlah akhir dari karya dan pelayanan, melainkan kesempatan untuk tetap menjadi berkat, menghadirkan hikmat, keteduhan, dan teladan iman bagi keluarga, gereja, dan masyarakat.
              </p>
              <p>
                Pelkat PKLU GPIB merupakan wadah pembinaan, persekutuan, dan pelayanan bagi warga jemaat GPIB berusia 60 tahun ke atas. Mereka bukan hanya hadir sebagai peserta, tetapi juga sebagai saksi iman, sumber hikmat, dan teladan dalam ketekunan serta kasih. Perayaan HUT ke-16 ini menjadi momen syukur atas penyertaan Tuhan dalam pelayanan kami.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Showcase Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-5xl mb-16 md:mb-24 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-4"
        >
          {[
            { value: "16", label: "Tahun Syukur", desc: "Berkarya & Melayani" },
            { value: "15", label: "Jemaat Mupel", desc: "Se-Bekasi Raya" },
            { value: "600+", label: "Peserta & Undangan", desc: "Tingkat Nasional" },
            { value: "4", label: "Layanan Utama", desc: "Akses Partisipasi" }
          ].map((stat, idx) => (
            <div key={idx} className="bg-black/30 backdrop-blur-md border border-white/5 hover:border-[#D4AF37]/35 transition-all duration-500 p-4 sm:p-6 rounded-2xl text-center group">
              <div className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#FDFBF7] to-[#D4AF37] bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-500">
                {stat.value}
              </div>
              <div className="text-[#D4AF37] text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest mt-2">{stat.label}</div>
              <div className="text-gray-400 text-[9px] md:text-xs mt-1 font-light leading-snug">{stat.desc}</div>
            </div>
          ))}
        </motion.div>

        {/* Interactive Feature Ecosystem Section */}
        <motion.div
          id="layanan"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-5xl mb-20 md:mb-28 space-y-8 sm:space-y-10"
        >
          <div className="text-center space-y-2 px-4">
            <span className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" /> 02. EKOSISTEM LAYANAN
            </span>
            <h2 className={`text-2xl sm:text-3xl md:text-5xl text-white ${playfair.className} font-medium italic leading-tight`}>
              Pintu Gerbang Partisipasi Acara
            </h2>
            <p className="text-xs md:text-sm text-gray-300 max-w-lg mx-auto font-light">
              Pilih portal layanan publik di bawah untuk mendaftar, membuat foto Amanaura, memesan merchandise, atau mengirim doa ucapan.
            </p>
          </div>

          {/* Tabbed Explorer layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start px-4">
            {/* Left Column Tabs Selector */}
            <div className="lg:col-span-4 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 pb-2 lg:pb-0 border-b lg:border-b-0 lg:border-l border-white/5 scrollbar-thin scrollbar-thumb-[#D4AF37]/30">
              {servicesData.map((service, idx) => {
                const isActive = activeServiceTab === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveServiceTab(idx)}
                    className={`flex items-center gap-3 sm:gap-4 text-left px-4 sm:px-5 py-3 sm:py-4 rounded-xl transition-all duration-300 w-auto lg:w-full shrink-0 lg:shrink whitespace-nowrap lg:whitespace-normal cursor-pointer select-none group border lg:border-0 ${isActive
                        ? 'bg-[#D4AF37]/15 border-[#D4AF37]/40 lg:border-l-2 lg:border-[#D4AF37] lg:rounded-l-none text-[#D4AF37]'
                        : 'border-white/5 text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <div className={`p-2.5 rounded-lg border transition-all ${isActive ? 'border-[#D4AF37]/50 bg-[#D4AF37]/20 text-[#D4AF37]' : 'border-white/10 bg-black/40 text-gray-400 group-hover:text-white'
                      }`}>
                      {idx === 0 && <UserCheck className="w-5 h-5" />}
                      {idx === 1 && <Sparkles className="w-5 h-5" />}
                      {idx === 2 && <ShoppingBag className="w-5 h-5" />}
                      {idx === 3 && <HeartHandshake className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="font-bold text-xs uppercase tracking-wider">{service.title}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5 font-light group-hover:text-gray-400">{service.subtitle}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Column Content Panel */}
            <div className="lg:col-span-8 bg-black/40 border border-white/10 backdrop-blur-xl rounded-[2rem] p-5 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl relative overflow-hidden">
              {/* Subtle visual glow inside card */}
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] bg-[#D4AF37]/10 border border-[#D4AF37]/35 text-[#D4AF37] px-2.5 py-0.5 rounded-full animate-pulse">
                    {servicesData[activeServiceTab].badge}
                  </span>
                  <h3 className={`text-2xl font-bold text-white mt-2 ${playfair.className}`}>
                    {servicesData[activeServiceTab].title}
                  </h3>
                </div>
                <div className="text-[10px] text-gray-500 uppercase font-mono tracking-widest hidden sm:block">
                  PORTAL SPECIFICATIONS
                </div>
              </div>

              <p className="text-[#FDFBF7]/80 text-sm leading-relaxed font-light">
                {servicesData[activeServiceTab].desc}
              </p>

              {/* Specs Table like Amanloka specifications */}
              <div className="bg-black/30 border border-white/5 rounded-xl overflow-hidden text-xs">
                <div className="flex bg-white/5 px-4 py-2 text-gray-400 font-bold border-b border-white/5 uppercase tracking-wider text-[9px]">
                  <div className="w-[40%] sm:w-[35%]">Ketentuan/Fitur</div>
                  <div className="w-[60%] sm:w-[65%]">Detail Spesifikasi</div>
                </div>
                <div className="divide-y divide-white/5">
                  {servicesData[activeServiceTab].specs.map((spec, specIdx) => (
                    <div key={specIdx} className="flex px-4 py-3 items-start sm:items-center hover:bg-white-[0.02] transition-colors text-[11px] sm:text-xs">
                      <div className="w-[40%] sm:w-[35%] text-[#D4AF37] font-semibold pr-2 shrink-0">{spec.label}</div>
                      <div className="w-[60%] sm:w-[65%] text-[#FDFBF7]/90 font-light leading-normal">{spec.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Link
                  href={servicesData[activeServiceTab].href}
                  className="group relative inline-flex overflow-hidden rounded-full px-6 py-3 transition-all hover:scale-102 active:scale-98 shadow-[0_0_20px_rgba(212,175,55,0.15)] cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] opacity-90 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
                  <div className="relative flex items-center justify-center gap-2">
                    <span className="font-bold text-[#022c22] text-xs tracking-wider uppercase">
                      {servicesData[activeServiceTab].btnText}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#022c22] transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </Link>
              </div>
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
          className="w-full max-w-4xl mb-16 md:mb-24 px-4"
        >
          <div className="text-center mb-8 sm:mb-10">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold block mb-2">03. VISI &amp; MISI</span>
            <h2 className={`text-2xl sm:text-3xl md:text-4xl text-[#FDFBF7] font-medium italic ${playfair.className}`}>Maksud &amp; Tujuan</h2>
            <div className="w-16 h-0.5 bg-[#D4AF37]/30 mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {[
              "Mendukung terselenggaranya ibadah syukur dan perayaan HUT ke-16 Pelkat PKLU GPIB.",
              "Mempererat kebersamaan Pelkat PKLU GPIB dari berbagai jemaat di Indonesia.",
              "Mendukung kebutuhan peserta, khususnya kaum lanjut usia.",
              "Mendukung pra-kegiatan berupa lomba dan webinar inspiratif.",
              "Mengapresiasi karya, talenta, pengalaman, dan kesaksian kaum lansia.",
              "Menguatkan semangat lansia teladan dalam iman, karya, dan pelayanan."
            ].map((tujuan, index) => (
              <div key={index} className="flex gap-4 items-center bg-black/40 backdrop-blur-sm border border-[#D4AF37]/20 rounded-2xl p-4 sm:p-5 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/40 transition-all duration-300 group shadow-lg">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#022c22] border border-[#D4AF37]/35 flex items-center justify-center text-[#D4AF37] text-xs font-bold flex-shrink-0 group-hover:border-[#D4AF37] transition-all">
                  {index + 1}
                </div>
                <p className="text-[#FDFBF7]/90 text-xs sm:text-sm leading-relaxed font-light group-hover:text-white transition-colors">
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
          className="w-full max-w-4xl mb-16 md:mb-24 px-4"
        >
          <div className="text-center mb-8 sm:mb-10 px-4">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold block mb-2">04. PENYELENGGARA</span>
            <h2 className={`text-2xl sm:text-3xl md:text-4xl text-[#FDFBF7] font-medium italic ${playfair.className}`}>Tuan Rumah Kegiatan</h2>
            <p className="text-xs sm:text-sm text-[#D4AF37]/80 mt-2 font-light">Musyawarah Pelayanan (Mupel) GPIB Bekasi</p>
            <div className="w-16 h-0.5 bg-[#D4AF37]/30 mx-auto mt-4 rounded-full" />
          </div>

          <div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-[2rem] p-5 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left Side: Profile & Map */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <p className="text-[#FDFBF7]/85 text-sm md:text-base leading-relaxed font-light text-justify">
                    <strong>Musyawarah Pelayanan (Mupel) GPIB Bekasi</strong> merupakan persekutuan pelayanan, kesaksian, dan wadah misioner lintas jemaat di bawah naungan Gereja Protestan di Indonesia bagian Barat (GPIB) untuk wilayah Bekasi Kota dan Kabupaten.
                  </p>
                  <p className="text-[#FDFBF7]/85 text-sm md:text-base leading-relaxed font-light text-justify">
                    Sebagai tuan rumah perayaan dan ibadah syukur HUT ke-16 Pelkat PKLU GPIB tingkat nasional tahun 2026, Mupel Bekasi mengoordinasikan seluruh persiapan demi kelancaran dan kenyamanan para lansia teladan dari penjuru Nusantara.
                  </p>
                </div>

                {/* Map Section */}
                <div className="flex-grow flex flex-col space-y-3">
                  <h3 className={`text-lg text-[#D4AF37] font-semibold ${playfair.className} text-center md:text-left`}>
                    Peta Sebaran Jemaat Mupel Bekasi
                  </h3>
                  <div className="w-full flex-grow rounded-2xl overflow-hidden relative min-h-[300px] md:min-h-[350px] lg:h-0">
                    <MupelMap />
                  </div>
                </div>
              </div>

              {/* Right Side: Congregation List Card with Custom Gold Scrollbar */}
              <div className="lg:col-span-5 bg-black/60 border border-[#D4AF37]/25 rounded-2xl p-4 sm:p-5 space-y-4 flex flex-col justify-between max-h-[500px] lg:max-h-[600px]">
                <div className="border-b border-[#D4AF37]/20 pb-3 flex-shrink-0">
                  <h3 className={`text-lg sm:text-xl text-[#D4AF37] font-semibold ${playfair.className}`}>Mupel GPIB Bekasi</h3>
                  <p className="text-[9px] text-[#FDFBF7]/50 uppercase tracking-widest mt-1">Struktur &amp; Cakupan Wilayah</p>
                </div>

                <div className="space-y-3 text-xs flex-shrink-0">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-[#FDFBF7]/60">BP Mupel:</span>
                    <span className="font-semibold text-[#FDFBF7]">Pdt. Daniel J. C. Lumentut</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-[#FDFBF7]/60">Jumlah Jemaat:</span>
                    <span className="font-semibold text-[#D4AF37]">15 Jemaat GPIB</span>
                  </div>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 space-y-1.5 scrollbar-thin scrollbar-thumb-[#D4AF37]/35 scrollbar-track-transparent">
                  <span className="text-[#FDFBF7]/60 text-[10px] uppercase font-bold tracking-wider block mb-1">Daftar Jemaat:</span>
                  {[
                    { name: 'Anugerah', loc: 'Tambun' },
                    { name: 'Bahtera Kasih', loc: 'Jatisampurna' },
                    { name: 'Dian Kasih', loc: 'Jatisampurna' },
                    { name: 'Galilea', loc: 'Kemang Pratama / Galaxy' },
                    { name: 'Gloria', loc: 'Bekasi Barat' },
                    { name: 'Gratia', loc: 'Taman Wisma Asri' },
                    { name: 'Harapan Baru', loc: 'Harapan Baru Regency' },
                    { name: 'Harapan Indah', loc: 'Melati Indah' },
                    { name: 'Harapan Kasih', loc: 'Harapan Jaya' },
                    { name: 'Immanuel', loc: 'Jaladhapura' },
                    { name: 'Jatipon', loc: 'Jatibening / Pondok Gede' },
                    { name: 'Karang Satria', loc: 'Tambun Utara' },
                    { name: 'Menara Kasih', loc: 'Jatiasih' },
                    { name: 'Pilar Asih', loc: 'Bojong Rawalumbu' },
                    { name: 'Pondok Ungu', loc: 'Pondok Ungu Permai' }
                  ].map((j, i) => (
                    <div
                      key={i}
                      id={`jemaat-${j.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="flex gap-2 py-1.5 border-b border-white/5 last:border-b-0 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/35 border border-transparent px-3 rounded-lg transition-all duration-300"
                    >
                      <span className="text-[#D4AF37] font-bold w-4 flex-shrink-0">{i + 1}.</span>
                      <span className="text-[#FDFBF7] text-xs font-light">
                        GPIB "{j.name}" <span className="text-gray-400 font-normal">({j.loc})</span>
                      </span>
                    </div>
                  ))}
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
          className="w-full max-w-5xl mb-16 md:mb-24 px-4"
        >
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold block mb-2">05. AGENDA KERJA</span>
            <h2 className={`text-2xl sm:text-3xl md:text-5xl text-[#FDFBF7] font-medium italic ${playfair.className}`}>Rangkaian Kegiatan</h2>
            <div className="w-16 h-0.5 bg-[#D4AF37]/30 mx-auto mt-4 rounded-full" />
          </div>

          <div className="flex flex-col gap-5 sm:gap-6">
            {/* Pra-Kegiatan */}
            <div className="rounded-[2rem] p-[1px] bg-gradient-to-r from-[#D4AF37]/30 via-[#D4AF37]/10 to-transparent">
              <div className="bg-black/40 backdrop-blur-xl rounded-[calc(2rem-1px)] p-5 sm:p-10 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start text-center md:text-left">
                <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30">
                  <Star className="w-6 h-6 sm:w-8 sm:h-8 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className={`text-xl sm:text-2xl text-[#FDFBF7] mb-1 sm:mb-2 ${playfair.className}`}>Pra-Kegiatan</h3>
                  <p className="text-[#D4AF37] uppercase tracking-widest text-[10px] sm:text-xs font-bold mb-4 sm:mb-6">Beragam Lomba &amp; Webinar</p>
                  <ul className="space-y-3 sm:space-y-4 text-left">
                    <li className="flex items-start gap-3 sm:gap-4">
                      <CheckCircle2 className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#D4AF37]/75 flex-shrink-0 mt-0.5 sm:mt-1" />
                      <p className="text-[#FDFBF7]/80 text-xs sm:text-sm font-light leading-relaxed"><strong className="text-[#FDFBF7] font-medium block md:inline mr-2">Lomba Puisi:</strong> Kategori ulasan iman dan ekspresi hidup kaum lanjut usia.</p>
                    </li>
                    <li className="flex items-start gap-3 sm:gap-4">
                      <CheckCircle2 className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#D4AF37]/75 flex-shrink-0 mt-0.5 sm:mt-1" />
                      <p className="text-[#FDFBF7]/80 text-xs sm:text-sm font-light leading-relaxed"><strong className="text-[#FDFBF7] font-medium block md:inline mr-2">Lomba Artikel &amp; Video Singkat:</strong> Tema: Lansia Teladan dalam pelayanan dan karya inspiratif.</p>
                    </li>
                    <li className="flex items-start gap-3 sm:gap-4">
                      <CheckCircle2 className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#D4AF37]/75 flex-shrink-0 mt-0.5 sm:mt-1" />
                      <p className="text-[#FDFBF7]/80 text-xs sm:text-sm font-light leading-relaxed"><strong className="text-[#FDFBF7] font-medium block md:inline mr-2">Webinar Lansia:</strong> Persiapan finansial di usia emas dan bijak mengelola berkat.</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Puncak Acara */}
            <div className="rounded-[2rem] p-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-[#D4AF37]/30">
              <div className="bg-black/40 backdrop-blur-xl rounded-[calc(2rem-1px)] p-5 sm:p-10 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start text-center md:text-left">
                <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30">
                  <Star className="w-6 h-6 sm:w-8 sm:h-8 text-[#D4AF37] fill-[#D4AF37]/20" />
                </div>
                <div>
                  <h3 className={`text-xl sm:text-2xl text-[#FDFBF7] mb-1 sm:mb-2 ${playfair.className}`}>Puncak Acara (12 Okt 2026)</h3>
                  <p className="text-[#D4AF37] uppercase tracking-widest text-[10px] sm:text-xs font-bold mb-4 sm:mb-6">Ibadah Syukur &amp; Seremonial</p>
                  <ul className="space-y-3 sm:space-y-4 text-left">
                    <li className="flex items-start gap-3 sm:gap-4">
                      <CheckCircle2 className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#D4AF37]/75 flex-shrink-0 mt-0.5 sm:mt-1" />
                      <p className="text-[#FDFBF7]/80 text-xs sm:text-sm font-light leading-relaxed"><strong className="text-[#FDFBF7] font-medium block md:inline mr-2">Ibadah Syukur Agung:</strong> Pusat perayaan rohani dan ungkapan syukur nasional.</p>
                    </li>
                    <li className="flex items-start gap-3 sm:gap-4">
                      <CheckCircle2 className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#D4AF37]/75 flex-shrink-0 mt-0.5 sm:mt-1" />
                      <p className="text-[#FDFBF7]/80 text-xs sm:text-sm font-light leading-relaxed"><strong className="text-[#FDFBF7] font-medium block md:inline mr-2">Apresiasi &amp; Seni:</strong> Pagelaran seni lansia nusantara, lilin syukur, dan pemenang lomba.</p>
                    </li>
                    <li className="flex items-start gap-3 sm:gap-4">
                      <CheckCircle2 className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#D4AF37]/75 flex-shrink-0 mt-0.5 sm:mt-1" />
                      <p className="text-[#FDFBF7]/80 text-xs sm:text-sm font-light leading-relaxed"><strong className="text-[#FDFBF7] font-medium block md:inline mr-2">Estimasi Kehadiran:</strong> ±600 orang utusan pengurus dan jemaat PKLU dari seluruh Indonesia.</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Glassmorphism Event Details */}
        <motion.div
          id="waktu-tempat"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl rounded-[2rem] p-[1px] bg-gradient-to-b from-[#D4AF37]/45 via-[#D4AF37]/10 to-transparent mb-12 px-4"
        >
          <div className="w-full bg-black/40 backdrop-blur-3xl rounded-[calc(2rem-1px)] p-5 sm:p-12 overflow-hidden">

            <div className="text-center mb-8 sm:mb-10">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold block mb-2">06. LOKASI ACARA</span>
              <h2 className={`text-2xl sm:text-3xl md:text-4xl text-[#FDFBF7] font-medium italic ${playfair.className}`}>Waktu &amp; Tempat</h2>
              <div className="w-16 h-0.5 bg-[#D4AF37]/30 mx-auto mt-4 rounded-full" />
            </div>

            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">

              <div className="flex gap-6 items-start">
                <div className="w-14 h-14 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/30">
                  <Calendar className="w-6 h-6 text-[#D4AF37]" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className={`font-semibold text-[#FDFBF7] text-2xl md:text-3xl mb-1 ${playfair.className}`}>12 Oktober 2026</h3>
                  <p className="text-[#D4AF37] font-semibold uppercase tracking-widest text-xs mb-2">Senin</p>
                  <p className="text-[#FDFBF7]/60 font-light text-xs flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Ibadah Syukur & Perayaan
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-14 h-14 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/30">
                  <MapPin className="w-6 h-6 text-[#D4AF37]" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className={`font-semibold text-[#FDFBF7] text-xl md:text-2xl mb-2 ${playfair.className}`}>Bekasi Convention Center</h3>
                  <p className="text-[#FDFBF7]/85 tracking-wide font-light leading-relaxed mb-4 text-sm md:text-base">
                    Hotel Santika Mega Mall Bekasi <br />
                    <span className="opacity-70 text-xs md:text-sm">Jl. Ahmad Yani No.1, Marga Jaya, Kec. Bekasi Selatan, Kota Bekasi, Jawa Barat 17141</span>
                  </p>
                  <a href="https://www.google.com/maps/search/?api=1&query=Bekasi+Convention+Center" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#F3E5AB] transition-colors text-xs md:text-sm font-semibold border-b border-transparent hover:border-[#F3E5AB] pb-0.5">
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
          className="w-full max-w-4xl mb-16 md:mb-24 mt-8 sm:mt-12 px-4"
        >
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold block mb-2">07. RUNDOWN HARIAN</span>
            <h2 className={`text-2xl sm:text-3xl md:text-5xl text-[#FDFBF7] font-medium italic ${playfair.className}`}>Rundown Acara</h2>
            <div className="w-16 h-0.5 bg-[#D4AF37]/30 mx-auto mt-4 rounded-full" />
          </div>

          {/* Tabs Selector */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mb-12 px-4">
            <button
              onClick={() => setActiveRundown('pra')}
              className={`relative w-full sm:w-auto text-center px-6 py-3 rounded-full text-xs md:text-sm font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer ${activeRundown === 'pra'
                  ? 'text-[#022c22] bg-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.4)]'
                  : 'text-gray-400 border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:text-white'
                }`}
            >
              Pra-Kegiatan (Lomba & Webinar)
            </button>
            <button
              onClick={() => setActiveRundown('puncak')}
              className={`relative w-full sm:w-auto text-center px-6 py-3 rounded-full text-xs md:text-sm font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer ${activeRundown === 'puncak'
                  ? 'text-[#022c22] bg-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.4)]'
                  : 'text-gray-400 border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:text-white'
                }`}
            >
              Acara Puncak (12 Okt)
            </button>
          </div>

          <div className="relative border-l border-[#D4AF37]/35 ml-4 md:ml-40 pl-6 md:pl-10 space-y-10">
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
                      <div className="p-5 sm:p-6 rounded-2xl bg-black/40 backdrop-blur-sm border border-white/5 hover:border-[#D4AF37]/45 hover:bg-[#D4AF37]/5 transition-all duration-300 shadow-md">
                        <div className="md:hidden text-xs text-[#D4AF37] font-semibold mb-2 flex items-center gap-2">
                          <span>{item.time}</span>
                          <span className="opacity-40">•</span>
                          <span>Durasi: {item.duration}</span>
                        </div>
                        <h3 className={`text-lg md:text-xl text-[#FDFBF7] font-semibold mb-2 ${playfair.className}`}>
                          {item.title}
                        </h3>
                        <p className="text-gray-300 text-sm font-light leading-relaxed">
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
                      <div className="p-5 sm:p-6 rounded-2xl bg-black/40 backdrop-blur-sm border border-white/5 hover:border-[#D4AF37]/45 hover:bg-[#D4AF37]/5 transition-all duration-300 shadow-md">
                        <div className="md:hidden text-xs text-[#D4AF37] font-semibold mb-2 leading-tight">
                          {item.period}
                        </div>
                        <h3 className={`text-lg md:text-xl text-[#FDFBF7] font-semibold mb-2 ${playfair.className}`}>
                          {item.title}
                        </h3>
                        <p className="text-gray-300 text-sm font-light leading-relaxed">
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

        {/* Doa & Ucapan Selamat Section */}
        <motion.div
          id="ucapan-selamat"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1 }}
          className="w-full max-w-5xl mb-16 md:mb-24 mt-8 sm:mt-12 px-4"
        >
          <div className="text-center mb-8 sm:mb-12 space-y-2 select-none">
            <span className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold flex items-center justify-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#D4AF37]" /> 08. BUKU TAMU DIGITAL
            </span>
            <h2 className={`text-2xl sm:text-3xl md:text-5xl text-[#FDFBF7] font-medium italic ${playfair.className}`}>
              Gema Doa &amp; Ucapan Selamat
            </h2>
          </div>

          {loadingWishes ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
              <p className="text-xs text-gray-400 font-sans">Memuat ucapan selamat...</p>
            </div>
          ) : wishes.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-8 text-center text-[#FDFBF7] shadow-lg max-w-md mx-auto space-y-3">
              <p className="text-xs text-gray-400">Belum ada ucapan yang terverifikasi.</p>
              <Link
                href="/ucapan"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#D4AF37] hover:underline"
              >
                Kirim Ucapan Pertama Anda <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Premium Slider Container */}
              <div className="relative min-h-[260px] sm:min-h-[280px] flex flex-col items-center justify-center text-center px-5 sm:px-16 py-8 sm:py-10 bg-black/40 border border-white/10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl overflow-hidden">
                {/* Visual glow backdrop decoration */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#D4AF37]/5 rounded-full blur-[90px] pointer-events-none" />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-6 sm:space-y-8 max-w-3xl w-full relative z-10"
                  >
                    {/* Badge Category Tag */}
                    <div className="flex items-center justify-center gap-2 text-[10px] tracking-[0.2em] font-bold text-[#D4AF37] uppercase select-none">
                      <span className="w-1.5 h-1.5 rounded-full border border-[#D4AF37]/75 bg-transparent shrink-0" />
                      <span>DOA JEMAAT</span>
                    </div>

                    {/* Testimonial Quote text */}
                    <p className={`text-base sm:text-xl md:text-2xl lg:text-3xl text-white font-light leading-relaxed select-text italic ${playfair.className}`}>
                      "{wishes[currentSlide].message}"
                    </p>

                    {/* Author block details */}
                    <div className="space-y-1 select-none">
                      <h4 className="font-extrabold text-sm md:text-base text-[#D4AF37] tracking-wider uppercase font-sans">
                        {wishes[currentSlide].name}
                      </h4>
                      <p className="text-[10px] md:text-xs text-gray-400 tracking-[0.2em] uppercase font-mono">
                        {wishes[currentSlide].church_city}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation arrows & pagination indicators */}
                <div className="flex items-center justify-center gap-6 mt-8 pt-4 select-none relative z-10">
                  {/* Left Button */}
                  <button
                    onClick={handlePrevSlide}
                    aria-label="Previous Slide"
                    className="w-10 h-10 rounded-full border border-[#D4AF37]/35 hover:border-[#D4AF37] text-[#D4AF37] hover:text-white flex items-center justify-center transition-all active:scale-90 hover:bg-[#D4AF37]/15 cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Dot Indicators */}
                  <div className="flex items-center gap-2">
                    {wishes.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${currentSlide === index ? "w-6 bg-[#D4AF37]" : "w-2 bg-[#D4AF37]/30 hover:bg-[#D4AF37]/60"
                          }`}
                      />
                    ))}
                  </div>

                  {/* Right Button */}
                  <button
                    onClick={handleNextSlide}
                    aria-label="Next Slide"
                    className="w-10 h-10 rounded-full border border-[#D4AF37]/35 hover:border-[#D4AF37] text-[#D4AF37] hover:text-white flex items-center justify-center transition-all active:scale-90 hover:bg-[#D4AF37]/15 cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Call to action navigation buttons */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 select-none">
                <Link
                  href="/ucapan"
                  className="w-full sm:w-auto text-center px-6 py-3 bg-[#D4AF37] hover:bg-[#B3932D] text-[#022c22] rounded-full text-xs font-bold shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_20px_rgba(212,175,55,0.45)] transition-all cursor-pointer"
                >
                  Tulis Ucapan Selamat Anda
                </Link>
                <Link
                  href="/ucapan"
                  className="w-full sm:w-auto text-center px-6 py-3 border border-[#D4AF37]/45 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-white rounded-full text-xs font-bold tracking-wide transition-all cursor-pointer"
                >
                  Lihat Semua Ucapan
                </Link>
              </div>
            </div>
          )}
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          id="faq"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1 }}
          className="w-full max-w-4xl mb-16 md:mb-24 mt-8 sm:mt-12 px-4"
        >
          <div className="text-center mb-8 sm:mb-12 space-y-2">
            <span className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold block">
              09. INFORMASI TAMBAHAN
            </span>
            <h2 className={`text-2xl sm:text-3xl md:text-5xl text-[#FDFBF7] font-medium italic ${playfair.className}`}>
              Pertanyaan Umum (FAQ)
            </h2>
            <div className="w-16 h-0.5 bg-[#D4AF37]/30 mx-auto mt-4 rounded-full" />
          </div>

          <div className="bg-black/40 border border-white/5 rounded-3xl p-5 sm:p-10 shadow-2xl divide-y divide-white/5">
            {faqData.map((faq, idx) => {
              const isOpen = activeFaqIndex === idx;
              return (
                <div key={idx} className="first:pt-0 last:pb-0 py-5">
                  <button
                    onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left focus:outline-none group cursor-pointer"
                  >
                    <span className="text-sm sm:text-base md:text-lg font-light text-white group-hover:text-[#D4AF37] transition-colors pr-4">
                      {faq.question}
                    </span>
                    <span className="text-[#D4AF37]/60 group-hover:text-[#D4AF37] transition-all flex-shrink-0">
                      {isOpen ? (
                        <span className="text-lg font-bold select-none">&minus;</span>
                      ) : (
                        <span className="text-lg font-bold select-none">&#43;</span>
                      )}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pt-4 text-gray-300 font-light text-sm leading-relaxed">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Dukungan Kasih Section */}
        <motion.div
          id="dukungan"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1 }}
          className="w-full max-w-4xl mb-16 md:mb-24 mt-8 sm:mt-12 text-center px-4"
        >
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold block mb-2">10. SALURAN BERKAT</span>
            <h2 className={`text-2xl sm:text-3xl md:text-5xl text-[#FDFBF7] font-medium italic ${playfair.className}`}>Dukungan Kasih</h2>
            <div className="w-16 h-0.5 bg-[#D4AF37]/30 mx-auto mt-4 rounded-full" />
          </div>

          <div className="relative p-5 sm:p-12 rounded-[2rem] bg-gradient-to-br from-[#033B2B]/60 to-[#022c22]/40 backdrop-blur-md border border-[#D4AF37]/35 shadow-2xl">
            {/* Soft background glow */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-[#047857]/10 rounded-full blur-3xl pointer-events-none" />

            <h2 className={`text-xl sm:text-3xl md:text-4xl text-[#D4AF37] mb-4 sm:mb-6 ${playfair.className} font-semibold`}>
              Mari Menjadi Saluran Berkat
            </h2>

            <div className="space-y-6 text-[#FDFBF7]/90 text-sm sm:text-base md:text-lg leading-relaxed text-center font-light max-w-3xl mx-auto mb-10 px-2">
              <p>
                Setiap dukungan dan persembahan kasih yang Anda salurkan merupakan wujud nyata kepedulian bagi pelayanan kaum lanjut usia Pelkat PKLU GPIB. Mari bersama-sama kita sokong perayaan syukur HUT ke-16 ini agar para orang tua kita senantiasa dikuatkan untuk terus berkarya, menjadi teladan iman, serta saksi kasih Kristus yang hidup.
              </p>
              <p className={`text-[#D4AF37] ${playfair.className} italic font-medium text-base sm:text-lg md:text-xl leading-relaxed`}>
                "Sampai masa tuamu Aku tetap Dia dan sampai masa putih rambutmu Aku menggendong kamu." <br />
                <span className="text-[10px] sm:text-xs not-italic font-sans text-[#FDFBF7]/60 block mt-2 uppercase tracking-widest font-semibold">— Yesaya 46:4</span>
              </p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setIsOpenModal(true)}
                className="group relative overflow-hidden rounded-full px-6 py-3 transition-all hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(212,175,55,0.25)] cursor-pointer bg-transparent"
              >
                {/* Button Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] opacity-90 transition-opacity group-hover:opacity-100" />

                {/* Shimmer Effect */}
                <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-[#FDFBF7]/40 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />

                <div className="relative flex items-center justify-center gap-2">
                  <span className="font-bold text-[#022c22] text-xs md:text-sm tracking-wider uppercase">
                    Salurkan Dukungan Kasih
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#022c22] transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </button>
            </div>
          </div>
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
              className="relative w-full max-w-md bg-[#022c22] border border-[#D4AF37]/35 rounded-2xl p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
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
                      className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${modalForm.type === 'donatur'
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
                      className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${modalForm.type === 'sponsorship'
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
                  className="w-full bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] hover:opacity-90 disabled:opacity-50 text-[#022c22] py-3.5 text-sm font-bold rounded-lg mt-6 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(212,175,55,0.25)]"
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
    </div>
  )
}
