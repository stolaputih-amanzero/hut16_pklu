'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, MapPin, ArrowRight, Quote, CheckCircle2, Star, Clock } from 'lucide-react'
import { Playfair_Display } from 'next/font/google'

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '600', '700'], style: ['normal', 'italic'] })

export default function Home() {
  const [mapLoaded, setMapLoaded] = useState(false)
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
          className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[#D4AF37] rounded-full blur-[120px] md:blur-[200px]"
        />
        
        {/* Soft Emerald Orb */}
        <motion.div 
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-20%] left-[-10%] w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] bg-[#047857] rounded-full blur-[120px] md:blur-[200px]"
        />

        {/* Subtle noise texture for material feel */}
        <div 
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center">
        
        {/* Floating Token Image */}
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-72 h-72 md:w-96 md:h-96 mb-12"
        >
          {/* Very subtle glow exactly behind the token, no boxy shape */}
          <div className="absolute inset-0 bg-radial-gradient from-[#D4AF37]/30 to-transparent blur-2xl rounded-full scale-75 opacity-70" />
          
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full relative"
          >
            <Image
              src="/logo_hut16_pklu.png"
              alt="Logo Resmi HUT 16 PKLU GPIB"
              fill
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

          {/* New Tagline */}
          <motion.div variants={fadeIn} className="mt-10 py-6 border-y border-[#D4AF37]/20 w-3/4 mx-auto">
            <p className="text-[#FDFBF7]/90 text-xs md:text-sm tracking-[0.3em] uppercase text-center font-medium">
              Untuk Lansia <span className="text-[#D4AF37] mx-3">•</span> Oleh Lansia <span className="text-[#D4AF37] mx-3">•</span> Bersama PKLU GPIB
            </p>
          </motion.div>
        </motion.div>

        {/* Premium Call To Action - Main Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="w-full flex justify-center gap-6 mb-24 relative z-20"
        >
          <Link href="/buat-proposal">
            <button className="group relative overflow-hidden rounded-full bg-transparent px-10 py-5 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(212,175,55,0.2)]">
              {/* Button Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] opacity-90 transition-opacity group-hover:opacity-100" />
              
              {/* Shimmer Effect */}
              <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-[#FDFBF7]/40 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
              
              <div className="relative flex items-center justify-center gap-4">
                <span className="font-semibold text-[#022c22] text-sm md:text-base tracking-widest uppercase">
                  Dukung Pelayanan Ini
                </span>
                <ArrowRight className="w-5 h-5 text-[#022c22] transition-transform duration-300 group-hover:translate-x-2" />
              </div>
            </button>
          </Link>
        </motion.div>


        {/* Pendahuluan Section */}
        <motion.div
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
          
          <div className="relative p-8 md:p-12 rounded-[2rem] bg-[#022c22]/40 backdrop-blur-md border border-[#D4AF37]/20">
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
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1 }}
          className="w-full max-w-5xl mb-24"
        >
          <div className="text-center mb-12">
            <h2 className={`text-4xl md:text-5xl text-[#D4AF37] ${playfair.className}`}>Maksud & Tujuan</h2>
            <div className="w-24 h-1 bg-[#D4AF37]/50 mx-auto mt-6 rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Mendukung terselenggaranya ibadah syukur dan perayaan HUT ke-16 Pelkat PKLU GPIB.",
              "Mempererat kebersamaan Pelkat PKLU GPIB dari berbagai jemaat di Indonesia.",
              "Mendukung kebutuhan peserta, khususnya kaum lanjut usia.",
              "Mendukung pra-kegiatan berupa lomba dan webinar inspiratif.",
              "Mengapresiasi karya, talenta, pengalaman, dan kesaksian kaum lansia.",
              "Menguatkan semangat lansia teladan dalam iman, karya, dan pelayanan."
            ].map((tujuan, index) => (
              <div key={index} className="bg-[#022c22]/40 backdrop-blur-sm border border-[#D4AF37]/20 rounded-2xl p-6 hover:bg-[#D4AF37]/10 transition-colors group shadow-lg">
                <div className="w-10 h-10 rounded-full bg-[#022c22] border border-[#D4AF37]/30 flex items-center justify-center mb-4 text-[#D4AF37] font-semibold">
                  {index + 1}
                </div>
                <p className="text-[#FDFBF7]/90 leading-relaxed font-light group-hover:text-[#FDFBF7] transition-colors">
                  {tujuan}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bentuk dan Rangkaian Kegiatan Section */}
        <motion.div
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
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl rounded-[2rem] p-[1px] bg-gradient-to-b from-[#D4AF37]/40 via-[#D4AF37]/10 to-transparent mb-12"
        >
          <div className="w-full bg-[#022c22]/80 backdrop-blur-3xl rounded-[calc(2rem-1px)] p-8 md:p-12 overflow-hidden">
            
            <div className="text-center mb-10">
              <h2 className={`text-4xl text-[#D4AF37] ${playfair.className}`}>Waktu & Tempat</h2>
              <div className="w-24 h-1 bg-[#D4AF37]/50 mx-auto mt-6 rounded-full" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              <div className="space-y-10">
                <div className="flex gap-6 items-start">
                  <div className="w-14 h-14 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/20">
                    <Calendar className="w-6 h-6 text-[#D4AF37]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className={`font-semibold text-[#FDFBF7] text-3xl mb-1 ${playfair.className}`}>12 Oktober 2026</h3>
                    <p className="text-[#D4AF37] font-medium uppercase tracking-widest text-sm mb-2">Senin</p>
                    <p className="text-[#FDFBF7]/60 font-light text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Ibadah Syukur & Perayaan
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-6 items-start">
                  <div className="w-14 h-14 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/20">
                    <MapPin className="w-6 h-6 text-[#D4AF37]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className={`font-semibold text-[#FDFBF7] text-2xl mb-2 ${playfair.className}`}>Bekasi Convention Center</h3>
                    <p className="text-[#FDFBF7]/80 tracking-wide font-light leading-relaxed mb-4">
                      Hotel Santika Mega Mall Bekasi <br/>
                      <span className="opacity-70 text-sm">Jl. Ahmad Yani No.1, Marga Jaya, Kec. Bekasi Selatan, Kota Bekasi, Jawa Barat 17141</span>
                    </p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Bekasi+Convention+Center" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#F3E5AB] transition-colors text-sm font-medium border-b border-transparent hover:border-[#F3E5AB] pb-1">
                      Buka di Google Maps <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Peta Interaktif */}
              <div className="relative h-[300px] lg:h-[400px] w-full rounded-2xl overflow-hidden border border-[#D4AF37]/20 group shadow-2xl">
                <div className={`absolute inset-0 bg-[#022c22] flex items-center justify-center transition-opacity duration-500 z-10 ${mapLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                  <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                </div>
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.0520261394336!2d106.99238317585523!3d-6.250284793739777!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e698dd26cd7d463%3A0x133da8fcb359f4f4!2sBekasi%20Convention%20Center!5e0!3m2!1sen!2sid!4v1715694295325!5m2!1sen!2sid" 
                  className="absolute inset-0 w-full h-full border-0 transition-all duration-700"
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  onLoad={() => setMapLoaded(true)}
                ></iframe>
              </div>

            </div>
          </div>
        </motion.div>

        {/* Footer Admin Link */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 mb-8 w-full max-w-5xl border-t border-[#D4AF37]/20 pt-8 flex justify-center"
        >
          <Link 
            href="/dashboard" 
            className="group relative flex items-center gap-3 px-6 py-2.5 rounded-full overflow-hidden transition-all duration-500 hover:scale-105"
          >
            <div className="absolute inset-0 bg-[#022c22] border border-[#D4AF37]/30 rounded-full transition-colors group-hover:border-[#D4AF37]/60" />
            
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] ease-out" />

            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/50 group-hover:bg-[#D4AF37] group-hover:shadow-[0_0_10px_#D4AF37] transition-all duration-300 relative z-10" />
            
            <span className="text-[10px] md:text-xs text-[#FDFBF7]/50 group-hover:text-[#D4AF37] tracking-[0.3em] uppercase font-semibold transition-colors duration-300 relative z-10">
              Akses Kepanitiaan
            </span>
          </Link>
        </motion.div>

      </div>
    </div>
  )
}