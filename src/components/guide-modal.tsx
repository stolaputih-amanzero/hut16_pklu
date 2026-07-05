import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

export function GuideModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/10 w-full sm:w-auto">
          <Info className="w-4 h-4 mr-2" />
          Baca Panduan Pendaftaran
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-black/90 border-[#D4AF37]/30 text-[#FDFBF7]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#D4AF37]">Tata Cara Pendaftaran</DialogTitle>
          <DialogDescription className="text-gray-400">
            Panduan untuk mendaftar secara mandiri (1 orang) maupun rombongan kolektif.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Pendaftaran Mandiri */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[#D4AF37] border-b border-[#D4AF37]/20 pb-1">
              A. Pendaftaran Mandiri (1 Orang)
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300 leading-relaxed">
              <li>Pilih <strong>Kategori</strong> dan <strong>Asal Jemaat</strong> Anda.</li>
              <li>Isi data diri Anda di bagian <strong>Pendaftar #1</strong>.</li>
              <li>Jika Anda adalah <span className="text-blue-400">Peserta</span>, Anda wajib memilih peran dan surat tugas nantinya bisa digabung dengan bukti transfer jika diminta, atau abaikan form surat tugas kolektif. (Atau unggah surat tugas pribadi Anda di kolom <em>Surat Tugas Kolektif</em> di bagian bawah).</li>
              <li>Lakukan pembayaran sesuai nominal kategori Anda (Umum: Rp 475.000, Tuan Rumah: Rp 350.000).</li>
              <li>Unggah <strong>Bukti Transfer</strong> di bagian bawah form.</li>
              <li>Klik tombol <strong>Submit Pendaftaran Kolektif</strong>.</li>
            </ol>
          </div>

          {/* Pendaftaran Rombongan */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[#D4AF37] border-b border-[#D4AF37]/20 pb-1">
              B. Pendaftaran Rombongan / Bulk (Lebih dari 1 Orang)
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300 leading-relaxed">
              <li>Pilih mode pendaftaran <strong>Jalur Cepat Rombongan</strong>.</li>
              <li>Pilih <strong>Kategori</strong> dan <strong>Asal Jemaat</strong> untuk rombongan ini (semua peserta dalam 1 form harus dari Jemaat yang sama).</li>
              <li>Isi data Penanggung Jawab (PIC).</li>
              <li>Masukkan total Jumlah Peserta dan Pendamping.</li>
              <li>Isi <strong>Kuantitas Ukuran Kaos</strong> rombongan di kotak yang disediakan. Pastikan total kaos sama dengan jumlah orang.</li>
              <li>Unggah <strong>File Daftar Nama (Excel/PDF)</strong> yang memuat nama-nama anggota rombongan.</li>
              <li>Lakukan pembayaran <span className="font-semibold text-white">secara kumulatif / total</span> untuk semua orang dalam 1 kali transfer.</li>
              <li>Unggah 1 Bukti Transfer dan 1 Surat Tugas Kolektif (jika ada *Peserta*).</li>
              <li>Klik tombol <strong>Kirim Formulir Pendaftaran</strong>.</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
