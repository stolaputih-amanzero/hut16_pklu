# Redesign PDF & WhatsApp Templates + QR Digital Signatures

Tujuan dari pembaruan ini adalah untuk meningkatkan eksklusivitas, profesionalitas, dan keamanan dokumen (melalui tanda tangan digital berbasis QR Code) pada sistem penggalangan dana HUT ke-16 PKLU GPIB.

## Open Questions

> [!IMPORTANT]
> **URL Verifikasi Dummy**
> Saat ini saya akan menggunakan URL dummy seperti `https://hut16pklu.org/verify/` ditambah nomor seri proposal. Apakah format URL dummy ini sudah sesuai dengan keinginan Anda?

## Proposed Changes

### 1. Desain PDF "Sangat Eksklusif" (The Royal Emerald Theme)

Saya akan merombak desain PDF (`TandaPenghargaanPDF.tsx`, `ProposalDonaturPDF.tsx`, `ProposalSponsorPDF.tsx`) agar terlihat jauh lebih mewah dan premium:
*   **Tipografi Elegan**: Menggunakan kombinasi font klasik bawaan `Times-Roman` untuk teks seremonial, dipadukan dengan `Helvetica` untuk detail data.
*   **Warna Premium**: Menerapkan palet warna Royal Emerald (`#022c22`) sebagai warna teks utama dan Gold/Emas (`#D4AF37` / `#B8860B`) untuk aksen, border, dan nama penerima.
*   **Layout & Ornamen**: Menambahkan border ganda/elegan, *watermark* tipis (jika memungkinkan), dan komposisi *whitespace* yang seimbang agar terlihat seperti sertifikat resmi berskala nasional/internasional.

### 2. Tanda Tangan Digital Berbasis QR Code

*   **Integrasi QR Code**: Menambahkan komponen `<Image>` pada PDF yang memuat QR Code. QR Code ini akan di-generate secara otomatis via API pihak ketiga (`quickchart.io` atau `qrserver.com`).
*   **Tautan Verifikasi**: QR Code akan menyimpan URL dummy (contoh: `https://hut16pklu.org/verify/DON-001-2026`).
*   **Label Keterangan**: Di sebelah QR Code akan ditambahkan keterangan *"Scan to Verify Authenticity / Pindai untuk Verifikasi Keaslian"* untuk menegaskan profesionalitas dan mencegah pemalsuan dokumen.

### 3. Peningkatan Bahasa Inggris (EN) & Profesionalitas WhatsApp

*   **WhatsApp Templates (`src/lib/whatsapp.ts`)**: Menulis ulang *copywriting* pesan WhatsApp agar lebih hangat, profesional, dan menggunakan *grammar* Bahasa Inggris (EN) setara bisnis internasional (formal & polite).
*   **PDF Translations**: Memperbaiki terjemahan dalam komponen PDF agar menggunakan padanan kata seremonial yang tepat (misal: *Token of Appreciation*, *In Recognition of*, dll).

---

### Files to Modify

#### [MODIFY] [TandaPenghargaanPDF.tsx](file:///d:/PROJECT/hut16-pklu/src/components/pdf/TandaPenghargaanPDF.tsx)
*   Mengubah struktur `StyleSheet` ke tema Premium Gold & Emerald.
*   Mengubah font utama ke `Times-Roman`.
*   Menambahkan QR Code di bagian tanda tangan panitia (bawah).

#### [MODIFY] [ProposalDonaturPDF.tsx](file:///d:/PROJECT/hut16-pklu/src/components/pdf/ProposalDonaturPDF.tsx) & [ProposalSponsorPDF.tsx](file:///d:/PROJECT/hut16-pklu/src/components/pdf/ProposalSponsorPDF.tsx)
*   Menyelaraskan tema desain premium (Border, Warna).
*   Menyempurnakan terjemahan bahasa Inggris (EN).
*   Menyisipkan QR Code digital signature pada area tanda tangan.

#### [MODIFY] [whatsapp.ts](file:///d:/PROJECT/hut16-pklu/src/lib/whatsapp.ts)
*   Mengganti *template string* untuk bahasa Indonesia (ID) agar lebih rapi.
*   Memperbaiki struktur gramatikal dan nada profesional pada *template* bahasa Inggris (EN).

## Verification Plan

1.  Mencetak ulang proposal donatur dalam format ID dan EN.
2.  Memverifikasi desain visual PDF: apakah sudah memenuhi standar "sangat-sangat eksklusif".
3.  Memindai (scan) QR Code pada PDF yang dihasilkan menggunakan kamera *smartphone* untuk memastikan QR Code terbaca dan mengarah ke URL dummy yang benar.
4.  Mengecek format pesan WhatsApp yang dihasilkan dari aplikasi.
