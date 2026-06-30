import {
    Document, Page, Text, View, StyleSheet, Image
} from '@react-pdf/renderer'
import { formatRupiah } from '@/lib/utils'

const VERIFY_BASE_URL = 'https://hut16pklu.org/verify/'

const styles = StyleSheet.create({
    page: {
        padding: 30,
        backgroundColor: '#FFFFFF',
        fontFamily: 'Times-Roman',
        color: '#1a1a1a',
    },
    backgroundLogo: {
        position: 'absolute',
        top: '30%',
        left: '25%',
        width: '50%',
        opacity: 0.04,
        zIndex: -1,
    },
    container: {
        flex: 1,
        border: '1pt solid #D4AF37',
        padding: 35,
        position: 'relative',
    },
    header: {
        alignItems: 'center',
        marginBottom: 15,
    },
    logo: {
        width: 55,
        height: 55,
        marginBottom: 12,
    },
    headerTitle: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 10.5,
        color: '#022c22',
        letterSpacing: 1.5,
        marginBottom: 4,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontFamily: 'Helvetica',
        fontSize: 7.5,
        color: '#718096',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    divider: {
        borderBottom: '1pt solid #D4AF37',
        marginHorizontal: 30,
        marginBottom: 25,
    },
    titleSection: {
        alignItems: 'center',
        marginBottom: 25,
    },
    docTitle: {
        fontFamily: 'Times-Bold',
        fontSize: 16,
        color: '#022c22',
        textAlign: 'center',
        letterSpacing: 1,
        lineHeight: 1.3,
    },
    docSubtitle: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 8,
        color: '#D4AF37',
        marginTop: 6,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    contentWrapper: {
        paddingHorizontal: 15,
        flex: 1,
    },
    salutation: {
        fontSize: 11,
        marginBottom: 12,
        lineHeight: 1.5,
    },
    bodyParagraph: {
        fontSize: 10.5,
        lineHeight: 1.6,
        color: '#374151',
        marginBottom: 16,
        textAlign: 'justify',
    },
    detailContainer: {
        marginVertical: 12,
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FAFAFA',
        borderRadius: 4,
        border: '0.5pt solid #E5E7EB',
    },
    detailRow: {
        flexDirection: 'row',
        paddingVertical: 6,
        borderBottom: '0.5pt solid #F3F4F6',
    },
    detailLabel: {
        width: '35%',
        fontFamily: 'Helvetica-Bold',
        fontSize: 8,
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    detailValue: {
        width: '65%',
        fontFamily: 'Times-Bold',
        fontSize: 10.5,
        color: '#111827',
    },
    detailValueHighlight: {
        fontFamily: 'Times-Bold',
        fontSize: 12,
        color: '#022c22',
    },
    bankCard: {
        backgroundColor: '#F8FBF9',
        borderLeft: '3pt solid #022c22',
        padding: 15,
        marginTop: 10,
        marginBottom: 15,
    },
    bankTitle: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 8.5,
        color: '#022c22',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    bankText: {
        fontSize: 9.5,
        color: '#374151',
        lineHeight: 1.6,
    },
    footerContainer: {
        marginTop: 'auto',
        paddingTop: 30,
    },
    signatureRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 10,
    },
    signatureBox: {
        alignItems: 'center',
        width: 140,
    },
    signatureTitle: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 8.5,
        color: '#374151',
        marginBottom: 40,
        textAlign: 'center',
    },
    signatureLine: {
        width: 130,
        borderBottom: '1pt solid #111827',
        marginBottom: 6,
    },
    signatureName: {
        fontFamily: 'Times-Bold',
        fontSize: 11,
        color: '#111827',
    },
    signatureRole: {
        fontFamily: 'Helvetica',
        fontSize: 8,
        color: '#6B7280',
        marginTop: 2,
    },
    qrBox: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 90,
    },
    qrCode: {
        width: 65,
        height: 65,
        marginBottom: 6,
    },
    qrText: {
        fontFamily: 'Helvetica',
        fontSize: 5.5,
        color: '#9CA3AF',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    footerTagline: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 7.5,
        color: '#D4AF37',
        textAlign: 'center',
        marginTop: 30,
        letterSpacing: 2,
        textTransform: 'uppercase',
    }
})

interface Props {
    data: any
    lang: 'id' | 'en'
    logoUrl?: string
    gpibLogoUrl?: string
    origin?: string
}

export function CommitmentPDF({ data, lang, logoUrl = "/logo_hut16_pklu.png", gpibLogoUrl = "/logo_gpib.png", origin = "https://pklu.amanloka.com" }: Props) {
    const isId = lang === 'id'

    const formatDateLong = (dateStr: string, isId: boolean) => {
        try {
            const d = new Date(dateStr)
            if (isNaN(d.getTime())) {
                return isId ? '12 Oktober 2026' : 'October 12, 2026'
            }
            const options: Intl.DateTimeFormatOptions = {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }
            return d.toLocaleDateString(isId ? 'id-ID' : 'en-US', options)
        } catch {
            return isId ? '12 Oktober 2026' : 'October 12, 2026'
        }
    }

    const commitmentFormMap: Record<string, string> = {
        tunai: isId ? 'Uang Tunai' : 'Cash',
        transfer: isId ? 'Transfer Bank' : 'Bank Transfer',
        barang: isId ? 'Barang (In-Kind)' : 'Goods (In-Kind)',
        jasa: isId ? 'Jasa' : 'Service',
        konsumsi: isId ? 'Konsumsi' : 'Consumption'
    }

    const specificSupportMap: Record<string, string> = {
        konsumsi_lansia: isId ? 'Konsumsi Lansia' : 'Elderly Meals',
        hadiah_lomba: isId ? 'Hadiah Lomba' : 'Competition Prizes',
        souvenir_peserta: isId ? 'Souvenir Peserta' : 'Participant Souvenirs',
        dokumentasi: isId ? 'Dokumentasi' : 'Documentation',
        webinar: isId ? 'Webinar' : 'Webinar Support',
        peserta_lansia: isId ? 'Dukung Peserta Lansia' : 'Elderly Support'
    }

    const categoryMap: Record<string, string> = {
        sahabat_bakti: isId ? 'Sahabat Bakti' : 'Service Friend',
        sahabat_teladan: isId ? 'Sahabat Teladan' : 'Role Model Friend',
        sahabat_pelayanan: isId ? 'Sahabat Pelayan' : 'Servant Friend',
        sahabat_berkat: isId ? 'Sahabat Berkat' : 'Blessing Friend',
        sahabat_kasih: isId ? 'Sahabat Kasih' : 'Love Friend',
    }

    const sponsorPackageMap: Record<string, string> = {
        platinum: isId ? 'Platinum' : 'Platinum',
        gold: isId ? 'Emas (Gold)' : 'Gold',
        silver: isId ? 'Perak (Silver)' : 'Silver',
        bronze: isId ? 'Perunggu (Bronze)' : 'Bronze',
        in_kind: isId ? 'In-Kind' : 'In-Kind',
        donatur: isId ? 'Partisipasi' : 'Participation'
    }

    const isSponsorship = data.type === 'sponsorship'
    const commitmentFormLabel = commitmentFormMap[data.contribution_form] || data.contribution_form || (isId ? 'Uang Tunai / Transfer' : 'Cash / Transfer')
    const specificSupportLabel = specificSupportMap[data.specific_support as keyof typeof specificSupportMap] || data.specific_support || '-'
    const categoryLabel = categoryMap[data.donatur_category as keyof typeof categoryMap] || data.donatur_category || '-'
    const sponsorPackageLabel = sponsorPackageMap[data.sponsor_package as keyof typeof sponsorPackageMap] || data.sponsor_package || '-'

    const committeeName = data.committees?.name || 'Vrilly Rondonuwu'
    const committeeRole = data.committees?.role || (isId ? 'Ketua Panitia' : 'Committee Chairperson')

    const verifyUrl = `${origin}/verify/${data.id}`
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(verifyUrl)}`

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.container}>
                    {/* Watermark Logo */}
                    <Image src={logoUrl} style={styles.backgroundLogo} />
                    
                    {/* Centered Header */}
                    <View style={styles.header}>
                        <Image src={logoUrl} style={styles.logo} />
                        <Text style={styles.headerTitle}>
                            {isId ? 'PANITIA HUT KE-16 PELKAT PKLU' : '16TH PKLU ANNIVERSARY COMMITTEE'}
                        </Text>
                        <Text style={styles.headerSubtitle}>
                            {isId ? 'MUPEL BEKASI - GEREJA PROTESTAN di INDONESIA bagian BARAT' : 'MUPEL BEKASI - PROTESTANT CHURCH IN WESTERN INDONESIA'}
                        </Text>
                    </View>
                    
                    <View style={styles.divider} />

                    <View style={styles.contentWrapper}>
                        {/* Title Section */}
                        <View style={styles.titleSection}>
                            <Text style={styles.docTitle}>
                                {isId ? 'SURAT KONFIRMASI KOMITMEN' : 'COMMITMENT CONFIRMATION'}
                            </Text>
                            <Text style={styles.docTitle}>
                                {isId ? '& UCAPAN TERIMA KASIH' : '& THANK YOU LETTER'}
                            </Text>
                            <Text style={styles.docSubtitle}>
                                {isId ? `No. Registrasi: ${data.number}` : `Registration No: ${data.number}`}
                            </Text>
                        </View>

                        {/* Salutation */}
                        <Text style={styles.salutation}>
                            {isId 
                                ? `Yth. Bapak/Ibu/Keluarga ${data.name},\nSalam sejahtera dalam kasih Tuhan Yesus Kristus.`
                                : `Dear Mr./Ms./Family ${data.name},\nWarm greetings in the love of our Lord Jesus Christ.`}
                        </Text>

                        {/* Body Paragraph */}
                        <Text style={styles.bodyParagraph}>
                            {isId
                                ? 'Dengan penuh rasa syukur, kami dari Panitia Pelaksana menyampaikan terima kasih yang sebesar-besarnya atas kabar baik dan komitmen dukungan yang telah Bapak/Ibu berikan untuk menyukseskan Perayaan Ibadah Syukur Hari Ulang Tahun ke-16 Pelayanan Kategorial Persekutuan Kaum Lanjut Usia (Pelkat PKLU) GPIB yang akan dilaksanakan pada tanggal 12 Oktober 2026 di Bekasi Convention Center.'
                                : 'With deep gratitude, we from the Organizing Committee express our utmost appreciation for the good news and commitment of support you have provided to ensure the success of the 16th Anniversary Thanksgiving Celebration of the Categorical Fellowship of the Elderly (Pelkat PKLU) GPIB, to be held on October 12, 2026, at the Bekasi Convention Center.'}
                        </Text>

                        {/* Detail Card */}
                        <View style={styles.detailContainer}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>
                                    {isId ? (isSponsorship ? 'Nama Sponsor' : 'Nama Donatur') : (isSponsorship ? 'Sponsor Name' : 'Donor Name')}
                                </Text>
                                <Text style={styles.detailValue}>{data.name}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>
                                    {isId ? (isSponsorship ? 'Perusahaan' : 'Nama Tercantum') : (isSponsorship ? 'Company' : 'Published Name')}
                                </Text>
                                <Text style={styles.detailValue}>{isSponsorship ? (data.company_name || data.name) : (data.display_name || data.name)}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>{isId ? 'Jenis Komitmen' : 'Commitment Type'}</Text>
                                <Text style={styles.detailValue}>{commitmentFormLabel}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>{isId ? 'Nilai Komitmen' : 'Commitment Value'}</Text>
                                <View style={{ width: '65%' }}>
                                    <Text style={styles.detailValueHighlight}>
                                        {data.contribution_value && Number(data.contribution_value) > 0 
                                            ? formatRupiah(Number(data.contribution_value))
                                            : (isId ? 'In-Kind / Non-Moneter' : 'In-Kind / Non-Monetary')}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>
                                    {isId ? (isSponsorship ? 'Paket Sponsor' : 'Kategori Apresiasi') : (isSponsorship ? 'Sponsor Package' : 'Honorary Category')}
                                </Text>
                                <Text style={styles.detailValue}>{isSponsorship ? sponsorPackageLabel : categoryLabel}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>{isId ? 'Alokasi Dukungan' : 'Support Allocation'}</Text>
                                <Text style={styles.detailValue}>{specificSupportLabel}</Text>
                            </View>
                            {data.message && (
                                <View style={[styles.detailRow, { borderBottom: 'none' }]}>
                                    <Text style={styles.detailLabel}>{isId ? 'Ucapan Buku Acara' : 'Program Book Quote'}</Text>
                                    <Text style={[styles.detailValue, { fontStyle: 'italic' }]}>"{data.message}"</Text>
                                </View>
                            )}
                        </View>

                        {/* Payment instructions (only shown if monetary support is promised) */}
                        {data.contribution_value && Number(data.contribution_value) > 0 && (
                            <View style={styles.bankCard}>
                                <Text style={styles.bankTitle}>
                                    {isId ? 'Informasi Penyaluran Komitmen Dana' : 'Fund Commitment Transfer Information'}
                                </Text>
                                <Text style={styles.bankText}>
                                    {isId 
                                        ? 'Dukungan dana dapat ditransfer ke rekening panitia: PT. BANK ............................................... No. Rekening: ............................................... A.N. ...............................................\nMohon mengirimkan bukti transfer via WhatsApp ke nomor Sekretaris Panitia: +62 811-1550-543 (Vevi Mayo) untuk pencatatan kelunasan.'
                                        : 'Financial support can be transferred to the committee account: PT. BANK ............................................... Account No: ............................................... A.N. ...............................................\nPlease kindly send the transfer receipt via WhatsApp to the Committee Secretary: +62 811-1550-543 (Vevi Mayo) for reconciliation.'}
                                </Text>
                            </View>
                        )}

                        {/* Non-monetary instructions (shown if in-kind or no monetary support) */}
                        {(!data.contribution_value || Number(data.contribution_value) === 0) && (
                            <View style={[styles.bankCard, { borderLeft: '3pt solid #D4AF37' }]}>
                                <Text style={styles.bankTitle}>
                                    {isId ? 'Koordinasi Serah Terima Komitmen' : 'Commitment Handover Coordination'}
                                </Text>
                                <Text style={styles.bankText}>
                                    {isId
                                        ? 'Panitia Penanggung Jawab kami akan segera menghubungi Bapak/Ibu untuk berkoordinasi lebih lanjut mengenai mekanisme serah terima barang, jasa, atau konsumsi yang Bapak/Ibu komitmenkan.'
                                        : 'Our Committee-in-charge will contact you shortly to coordinate the handover details for the goods, services, or catering you have committed.'}
                                </Text>
                            </View>
                        )}

                        <Text style={[styles.bodyParagraph, { marginTop: 15 }]}>
                            {isId
                                ? 'Kiranya persembahan kasih ini membawa kemuliaan bagi nama Tuhan dan menjadi berkat melimpah bagi pelayanan Kaum Lanjut Usia. Atas kebaikan dan doa Bapak/Ibu, kami ucapkan terima kasih yang sedalam-dalamnya. Tuhan memberkati.'
                                : 'May this gift of love bring glory to the Lord and abundant blessings to the ministry of our Elderly. For your outstanding kindness and prayers, we express our heartfelt gratitude. God bless you.'}
                        </Text>

                        {/* Footer Signatures */}
                        <View style={styles.footerContainer}>
                            <View style={styles.signatureRow}>
                                <View style={styles.signatureBox}>
                                    <Text style={styles.signatureTitle}>
                                        {isId ? 'Ketua Panitia' : 'Committee Chairperson'}
                                    </Text>
                                    <View style={styles.signatureLine} />
                                    <Text style={styles.signatureName}>Vrilly Rondonuwu</Text>
                                    <Text style={styles.signatureRole}>{committeeRole}</Text>
                                </View>

                                {/* Verification QR Code */}
                                <View style={styles.qrBox}>
                                    <Image src={qrImageUrl} style={styles.qrCode} />
                                    <Text style={styles.qrText}>
                                        {isId ? 'PINDAI VERIFIKASI' : 'SCAN TO VERIFY'}
                                    </Text>
                                    <Text style={styles.qrText}>
                                        {isId ? 'KEASLIAN DOKUMEN' : 'AUTHENTICITY'}
                                    </Text>
                                </View>

                                <View style={styles.signatureBox}>
                                    <Text style={styles.signatureTitle}>
                                        {isId ? 'Sekretaris' : 'Secretary'}
                                    </Text>
                                    <View style={styles.signatureLine} />
                                    <Text style={styles.signatureName}>Vevi Mayo</Text>
                                    <Text style={styles.signatureRole}>{isId ? 'Sekretaris Panitia' : 'Committee Secretary'}</Text>
                                </View>
                            </View>

                            <Text style={styles.footerTagline}>
                                {isId ? 'Untuk Lansia • Oleh Lansia • Bersama PKLU GPIB' : 'For the Elderly • By the Elderly • With PKLU GPIB'}
                            </Text>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    )
}
