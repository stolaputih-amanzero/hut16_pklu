"use client";

import { useState, useEffect } from "react";
import { Info, ChevronDown } from "lucide-react";

export function GuideModal() {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  }, []);

  return (
    <div className="rounded-2xl border border-[#D4AF37]/30 bg-black/60 p-4 sm:p-5 md:p-6 text-sm text-[#FDFBF7] space-y-4 shadow-inner w-full mb-6">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-[#D4AF37] text-left cursor-pointer focus:outline-none"
      >
        <h2 className="text-base font-bold flex items-center gap-2">
          <Info className="w-5 h-5 text-[#D4AF37]" />
          Tata Cara / Panduan Pendaftaran:
        </h2>
        <ChevronDown
          className={`w-5 h-5 text-[#D4AF37] transition-transform duration-300 shrink-0 ml-2 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`transition-all duration-300 overflow-hidden ${
          isOpen ? "max-h-[1200px] opacity-100 mt-4" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="space-y-6 pt-2 max-h-[70vh] overflow-y-auto pr-2">
          {/* Pendaftaran Mandiri */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-[#D4AF37] border-b border-[#D4AF37]/20 pb-1">
              A. Pendaftaran Mandiri (1 Orang)
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-xs text-gray-300 leading-relaxed">
              <li>Pilih <strong>Kategori</strong> dan <strong>Asal Jemaat</strong> Anda.</li>
              <li>Isi data diri Anda di bagian <strong>Pendaftar (Mandiri)</strong>.</li>
              <li>Jika Anda adalah <span className="text-blue-400">Peserta Kategori Umum</span>, Anda wajib memilih peran dan surat tugas. (Untuk Kategori Tuan Rumah, surat tugas bersifat opsional. Unggah surat tugas di kolom <em>Surat Tugas</em> di bagian bawah jika ada).</li>
              <li>Lakukan pembayaran sesuai nominal kategori Anda (Umum: Rp 475.000, Tuan Rumah: Rp 350.000). Untuk Kategori Umum, bukti transfer wajib diunggah; sedangkan untuk Kategori Tuan Rumah bersifat opsional.</li>
              <li>Unggah <strong>Bukti Transfer</strong> di bagian bawah form (jika ada).</li>
              <li>Klik tombol <strong>Kirim Formulir Pendaftaran</strong>.</li>
            </ol>
          </div>

          {/* Pendaftaran Rombongan */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-[#D4AF37] border-b border-[#D4AF37]/20 pb-1">
              B. Pendaftaran Rombongan / Bulk (Lebih dari 1 Orang)
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-xs text-gray-300 leading-relaxed">
              <li>Pilih mode pendaftaran <strong>Jalur Cepat Rombongan</strong>.</li>
              <li>Pilih <strong>Kategori</strong> dan <strong>Asal Jemaat</strong> untuk rombongan ini (semua peserta dalam 1 form harus dari Jemaat yang sama).</li>
              <li>Isi data Penanggung Jawab (PIC).</li>
              <li>Masukkan total Jumlah Peserta dan Pendamping.</li>
              <li>Isi <strong>Kuantitas Ukuran Kaos</strong> rombongan di kotak yang disediakan. Pastikan total kaos sama dengan jumlah orang.</li>
              <li>Unggah <strong>File Daftar Nama (Excel/PDF)</strong> yang memuat nama-nama anggota rombongan.</li>
              <li>Lakukan pembayaran <span className="font-semibold text-white">secara kumulatif / total</span> untuk semua orang dalam 1 kali transfer.</li>
              <li>Unggah 1 Bukti Transfer dan 1 Surat Tugas Kolektif (jika ada *Peserta* Kategori Umum). Untuk Kategori Tuan Rumah, kedua dokumen ini bersifat opsional.</li>
              <li>Klik tombol <strong>Kirim Formulir Pendaftaran</strong>.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
