export type WATemplateType = 'proposal' | 'token' | 'confirmation' | 'commitment'
export type Lang = 'id' | 'en'

function formatRupiah(amount?: number): string {
    if (!amount) return '-'
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount)
}

function normalizePhone(phone: string): string {
    return phone.replace(/\+/g, '').replace(/^0/, '62').replace(/[\s\-]/g, '')
}

const TEMPLATES: Record<Lang, Record<WATemplateType, (d: any) => string>> = {
    id: {
        proposal: (d) =>
            `*Yth. Bapak/Ibu ${d.name}*

Salam sejahtera dalam kasih Kristus,

Dengan penuh hormat dan sukacita, kami dari Panitia HUT ke-16 Pelkat PKLU GPIB bermaksud menyampaikan permohonan dukungan dan partisipasi Bapak/Ibu untuk kegiatan peringatan:

🎉 *HUT KE-16 PELKAT PKLU GPIB*
📅 Senin, 12 Oktober 2026
📍 Bekasi Convention Center, Hotel Santika Mega Mall
🎯 Tema: *"Teruskan Baktimu!"* (Lansia Teladan dalam Iman, Karya, dan Pelayanan)

📄 *Proposal Dukungan Terlampir* (Nomor Registrasi: ${d.number})

Setiap dukungan kasih yang Bapak/Ibu berikan sangat berarti bagi pelayanan kaum lanjut usia di lingkungan GPIB. Kiranya Tuhan Yesus Kristus senantiasa memberkati Bapak/Ibu beserta keluarga.

Hormat kami,
*Panitia HUT ke-16 PKLU GPIB*`,

        token: (d) =>
            `*Yth. Bapak/Ibu ${d.display_name}*

Salam sejahtera dalam kasih Kristus,

Kami menghaturkan limpah terima kasih atas dukungan kasih yang telah Bapak/Ibu berikan untuk perayaan HUT ke-16 Pelkat PKLU GPIB. 

Sebagai bentuk apresiasi dan penghargaan kami, bersama pesan ini kami lampirkan *Tanda Penghargaan* resmi dari panitia.

📄 *Silakan unduh dokumen Anda melalui tautan berikut:*
${d.token_url}

*(Dokumen ini dilengkapi dengan Tanda Tangan Digital berupa QR Code untuk menjamin keasliannya)*

Kiranya Tuhan Yesus Kristus senantiasa memberkati setiap kebaikan dan pelayanan Bapak/Ibu.

Hormat kami,
*Panitia HUT ke-16 PKLU GPIB*
"Teruskan Baktimu!"`,

        confirmation: (d) =>
            `*Yth. Bapak/Ibu ${d.name}*

Salam sejahtera,

Kami ingin mengonfirmasi dengan penuh syukur bahwa dukungan kasih dari Bapak/Ibu sebesar *${formatRupiah(d.value)}* telah kami terima dengan baik.

Dokumen Tanda Penghargaan resmi sedang dalam proses penerbitan dan akan segera kami kirimkan kepada Bapak/Ibu.

Terima kasih yang sebesar-besarnya atas kepedulian dan kemurahan hati Bapak/Ibu untuk mensukseskan perayaan HUT ke-16 Pelkat PKLU GPIB (12 Oktober 2026).

Hormat kami,
*Panitia HUT ke-16 PKLU GPIB*`,

        commitment: (d) =>
            `*Yth. Bapak/Ibu ${d.name}*

Salam sejahtera dalam kasih Kristus,

Kami mengucapkan terima kasih yang sebesar-besarnya atas komitmen dukungan yang telah Bapak/Ibu berikan untuk perayaan HUT ke-16 Pelkat PKLU GPIB.

Berikut kami lampirkan *Surat Konfirmasi Komitmen & Ucapan Terima Kasih* resmi yang mencatat partisipasi Bapak/Ibu.

📄 *Tautan Surat Konfirmasi Komitmen:*
${d.commitment_url}

Kiranya Tuhan Yesus Kristus senantiasa memberkati setiap kebaikan dan pelayanan Bapak/Ibu.

Hormat kami,
*Panitia HUT ke-16 PKLU GPIB*
"Teruskan Baktimu!"`,
    },

    en: {
        proposal: (d) =>
            `*Dear Mr./Ms. ${d.name},*

Warm greetings in the love of Christ,

With great respect and joy, we from the 16th Anniversary Committee of Pelkat PKLU GPIB would like to humbly invite your support and participation in our upcoming celebration:

🎉 *16th ANNIVERSARY OF PKLU GPIB*
📅 Monday, October 12, 2026
📍 Bekasi Convention Center, Hotel Santika Mega Mall
🎯 Theme: *"Continue Your Service!"* (Elderly Role Models in Faith, Work, and Service)

📄 *Support Proposal Attached* (Registration No: ${d.number})

Every act of kindness and support you provide will be a profound blessing to the ministry of our elderly members within the GPIB community. May the Lord Jesus Christ continuously bless you and your family.

Sincerely,
*The 16th PKLU GPIB Anniversary Committee*`,

        token: (d) =>
            `*Dear Mr./Ms. ${d.display_name},*

Warm greetings in the love of Christ,

We would like to express our deepest gratitude for your generous support towards the 16th Anniversary of Pelkat PKLU GPIB.

In recognition of your invaluable contribution, we are honored to present you with this official *Token of Appreciation*.

📄 *Please download your document through the link below:*
${d.token_url}

*(This document is secured with a QR Code Digital Signature to verify its authenticity)*

May the Lord Jesus Christ bless every kindness you have shown.

Sincerely,
*The 16th PKLU GPIB Anniversary Committee*
"Continue Your Service!"`,

        confirmation: (d) =>
            `*Dear Mr./Ms. ${d.name},*

Warm greetings,

We write to gratefully confirm that your generous support of *${formatRupiah(d.value)}* has been successfully received.

Your official Token of Appreciation is currently being processed and will be sent to you shortly.

Thank you very much for your outstanding care and generosity in ensuring the success of the 16th PKLU GPIB Anniversary (October 12, 2026).

Sincerely,
*The 16th PKLU GPIB Anniversary Committee*`,

        commitment: (d) =>
            `*Dear Mr./Ms. ${d.name},*

Warm greetings in the love of Christ,

We express our deepest gratitude for the commitment of support you have provided for the 16th Anniversary of Pelkat PKLU GPIB.

We have attached your official *Commitment Confirmation & Thank You Letter* below.

📄 *Commitment Confirmation Link:*
${d.commitment_url}

May the Lord Jesus Christ continuously bless you and your family.

Sincerely,
*The 16th PKLU GPIB Anniversary Committee*
"Continue Your Service!"`,
    },
}

export function buildWhatsAppLink(
    phone: string,
    templateType: WATemplateType,
    lang: Lang,
    data: any
): string {
    const normalized = normalizePhone(phone)
    const message = TEMPLATES[lang][templateType](data)
    const encoded = encodeURIComponent(message)
    return `https://api.whatsapp.com/send?phone=${normalized}&text=${encoded}`
}