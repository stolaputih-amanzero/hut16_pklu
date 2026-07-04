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
 
Panitia HUT ke-16 Pelayanan Kategorial Persekutuan Kaum Lanjut Usia (Pelkat PKLU) GPIB mengharapkan kesediaan Bapak/Ibu untuk berpartisipasi dalam perayaan syukur:
 
*HUT Ke-16 Pelkat PKLU GPIB*
• Hari, Tanggal: Senin, 12 Oktober 2026
• Lokasi: Bekasi Convention Center, Hotel Santika Mega Mall
• Tema Utama: "Teruskan Baktimu!" (Lansia Teladan dalam Iman, Karya, dan Pelayanan)
 
*Dokumen Terlampir:*
Proposal Dukungan (Reg. No: ${d.number})
 
Dukungan kasih yang Bapak/Ibu berikan adalah wujud nyata pelayanan bersama demi kaum lanjut usia. Kiranya kasih karunia Tuhan Yesus Kristus senantiasa menyertai Bapak/Ibu beserta keluarga.
 
Hormat kami,
*Panitia Pelaksana HUT 16 PKLU GPIB*`,
 
        token: (d) =>
            `*Yth. Bapak/Ibu ${d.display_name}*
 
Salam sejahtera dalam kasih Kristus,
 
Panitia Pelaksana HUT ke-16 Pelkat PKLU GPIB menyampaikan terima kasih yang tulus atas partisipasi dan dukungan kasih yang telah Bapak/Ibu berikan.
 
Sebagai wujud apresiasi mendalam kami, berikut dilampirkan dokumen penghargaan resmi dari Panitia:
 
• *Tanda Penghargaan Resmi* (Terlampir)
 
Kiranya Tuhan Yesus Kristus senantiasa memberkati pelayanan dan kebaikan Bapak/Ibu beserta keluarga.
 
Hormat kami,
*Panitia Pelaksana HUT 16 PKLU GPIB*`,
 
        confirmation: (d) =>
            `*Yth. Bapak/Ibu ${d.name}*
 
Salam sejahtera,
 
Kami mengonfirmasi bahwa dukungan kasih dari Bapak/Ibu sebesar *${formatRupiah(d.value)}* telah kami terima dengan baik.
 
Dokumen Tanda Penghargaan resmi saat ini sedang dalam proses penerbitan oleh Panitia dan akan segera kami sampaikan kepada Bapak/Ibu.
 
Apresiasi setinggi-tingginya kami haturkan atas kepedulian Bapak/Ibu dalam menyukseskan Perayaan HUT ke-16 Pelkat PKLU GPIB.
 
Hormat kami,
*Panitia Pelaksana HUT 16 PKLU GPIB*`,
 
        commitment: (d) =>
            `*Yth. Bapak/Ibu ${d.name}*
 
Salam sejahtera dalam kasih Kristus,
 
Panitia Pelaksana HUT ke-16 Pelkat PKLU GPIB menyampaikan apresiasi mendalam atas pernyataan komitmen dukungan yang telah Bapak/Ibu berikan.
 
Berikut kami lampirkan dokumen konfirmasi resmi atas partisipasi Bapak/Ibu:
 
• *Surat Konfirmasi Komitmen & Ucapan Terima Kasih* (Terlampir)
 
Kiranya Tuhan Yesus Kristus memberkati kebaikan serta pelayanan Bapak/Ibu beserta keluarga.
 
Hormat kami,
*Panitia Pelaksana HUT 16 PKLU GPIB*`,
     },
 
     en: {
        proposal: (d) =>
            `*Dear Mr./Ms. ${d.name},*
 
Warm greetings in the love of Christ,
 
The Organizing Committee of the 16th Anniversary of the Categorical Fellowship of the Elderly (Pelkat PKLU) GPIB humbly requests your support and participation in our upcoming celebration:
 
*16th Anniversary of Pelkat PKLU GPIB*
• Date: Monday, October 12, 2026
• Venue: Bekasi Convention Center, Hotel Santika Mega Mall
• Theme: "Continue Your Service!" (Elderly Role Models in Faith, Work, and Service)
 
*Attached Document:*
Support Proposal (Reg. No: ${d.number})
 
Your support is a profound blessing to our senior members' ministry. May the grace of our Lord Jesus Christ be with you and your family.
 
Sincerely,
*The 16th PKLU GPIB Anniversary Committee*`,
 
        token: (d) =>
            `*Dear Mr./Ms. ${d.display_name},*
 
Warm greetings in the love of Christ,
 
The Organizing Committee of the 16th Anniversary of Pelkat PKLU GPIB expresses our deepest gratitude for your generous support.
 
In recognition of your contribution, we are pleased to attach your official token of appreciation:
 
• *Token of Appreciation* (Attached)
 
May the Lord Jesus Christ continuously bless you, your family, and your ministries.
 
Sincerely,
*The 16th PKLU GPIB Anniversary Committee*`,
 
        confirmation: (d) =>
            `*Dear Mr./Ms. ${d.name},*
 
Warm greetings,
 
We are pleased to confirm that your generous contribution of *${formatRupiah(d.value)}* has been successfully received.
 
Your official Token of Appreciation is being processed and will be delivered to you shortly.
 
Thank you for your outstanding generosity in supporting the 16th Anniversary of Pelkat PKLU GPIB.
 
Sincerely,
*The 16th PKLU GPIB Anniversary Committee*`,
 
        commitment: (d) =>
            `*Dear Mr./Ms. ${d.name},*
 
Warm greetings in the love of Christ,
 
The Organizing Committee of the 16th Anniversary of Pelkat PKLU GPIB expresses our sincere appreciation for your commitment of support.
 
Please find the official confirmation of your participation attached below:
 
• *Commitment Confirmation & Thank You Letter* (Attached)
 
May the Lord Jesus Christ bless your kindness and ministries.
 
Sincerely,
*The 16th PKLU GPIB Anniversary Committee*`,
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
    // Replace non-breaking spaces (generated by Intl.NumberFormat) and zero-width chars that cause '?' in WA
    const cleanMessage = message.replace(/[\u00A0\u200B\u200C\u200D\uFEFF]/g, ' ')
    const encoded = encodeURIComponent(cleanMessage)
    return `https://api.whatsapp.com/send?phone=${normalized}&text=${encoded}`
}