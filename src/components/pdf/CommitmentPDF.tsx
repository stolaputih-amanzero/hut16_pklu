import {
    Document, Page, Text, View, StyleSheet, Image
} from '@react-pdf/renderer'
import { formatRupiah } from '@/lib/utils'

const VERIFY_BASE_URL = 'https://hut16pklu.org/verify/'

const styles = StyleSheet.create({
    page: {
        padding: 50,
        backgroundColor: '#FCFAF5', // Elegant soft ivory
        fontFamily: 'Helvetica',
        color: '#1f2937',
    },
    outerBorder: {
        border: '1.5pt solid #D4AF37', // Gold outer border
        padding: 10,
        height: '100%',
    },
    innerBorder: {
        border: '0.5pt solid #022c22', // Emerald inner border
        padding: 25,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1pt solid #D4AF37',
        paddingBottom: 15,
        marginBottom: 20,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    logo: {
        width: 45,
        height: 45,
    },
    headerTitle: {
        fontFamily: 'Times-Bold',
        fontSize: 12,
        color: '#022c22',
        letterSpacing: 0.5,
    },
    headerSubtitle: {
        fontSize: 7,
        color: '#718096',
        marginTop: 2,
        textTransform: 'uppercase',
    },
    headerRight: {
        fontSize: 8,
        color: '#D4AF37',
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    titleSection: {
        alignItems: 'center',
        marginVertical: 15,
    },
    docTitle: {
        fontFamily: 'Times-Bold',
        fontSize: 16,
        color: '#022c22',
        textAlign: 'center',
        letterSpacing: 1,
    },
    docSubtitle: {
        fontSize: 8,
        color: '#D4AF37',
        marginTop: 4,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    salutation: {
        fontSize: 10,
        marginBottom: 10,
        lineHeight: 1.4,
    },
    bodyParagraph: {
        fontSize: 9.5,
        lineHeight: 1.5,
        color: '#4b5563',
        marginBottom: 15,
        textAlign: 'justify',
    },
    detailCard: {
        backgroundColor: '#ffffff',
        border: '1pt solid #E2E8F0',
        borderRadius: 6,
        padding: 15,
        marginVertical: 15,
    },
    detailRow: {
        flexDirection: 'row',
        paddingVertical: 5,
        borderBottom: '0.5pt solid #F7FAFC',
    },
    detailLabel: {
        width: '35%',
        fontSize: 8.5,
        color: '#718096',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    detailValue: {
        width: '65%',
        fontSize: 9.5,
        color: '#1f2937',
        fontFamily: 'Times-Roman',
    },
    detailValueHighlight: {
        width: '65%',
        fontSize: 10.5,
        color: '#D4AF37',
        fontFamily: 'Times-Bold',
    },
    bankCard: {
        backgroundColor: '#022c22',
        borderLeft: '3pt solid #D4AF37',
        padding: 12,
        marginVertical: 10,
    },
    bankTitle: {
        fontSize: 8.5,
        color: '#D4AF37',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    bankText: {
        fontSize: 9,
        color: '#FDFBF7',
        lineHeight: 1.4,
    },
    footerContainer: {
        marginTop: 'auto',
        borderTop: '0.5pt solid rgba(2, 44, 34, 0.1)',
        paddingTop: 15,
    },
    signatureRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    signatureBox: {
        alignItems: 'center',
        width: 140,
    },
    signatureTitle: {
        fontSize: 8,
        color: '#022c22',
        fontWeight: 'bold',
        marginBottom: 35,
        textAlign: 'center',
    },
    signatureLine: {
        width: 120,
        borderBottom: '1pt solid #022c22',
        marginBottom: 4,
    },
    signatureName: {
        fontFamily: 'Times-Bold',
        fontSize: 10,
        color: '#022c22',
    },
    signatureRole: {
        fontSize: 7.5,
        color: '#718096',
    },
    qrBox: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 90,
    },
    qrCode: {
        width: 50,
        height: 50,
        marginBottom: 4,
    },
    qrText: {
        fontSize: 5,
        color: '#718096',
        textAlign: 'center',
    },
    footerTagline: {
        fontSize: 7,
        color: '#A0AEC0',
        textAlign: 'center',
        marginTop: 15,
        letterSpacing: 1,
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

    const commitmentFormLabel = commitmentFormMap[data.contribution_form] || data.contribution_form || (isId ? 'Uang Tunai / Transfer' : 'Cash / Transfer')
    const specificSupportLabel = specificSupportMap[data.specific_support as keyof typeof specificSupportMap] || data.specific_support || '-'
    const categoryLabel = categoryMap[data.donatur_category as keyof typeof categoryMap] || data.donatur_category || '-'

    const committeeName = data.committees?.name || 'Vrilly Rondonuwu'
    const committeeRole = data.committees?.role || (isId ? 'Ketua Panitia' : 'Committee Chairperson')

    const verifyUrl = `${origin}/verify/${data.id}`
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(verifyUrl)}`

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.outerBorder}>
                    <View style={styles.innerBorder}>
                        
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerLeft}>
                                <Image src={logoUrl} style={styles.logo} />
                                <View>
                                    <Text style={styles.headerTitle}>
                                        {isId ? 'PANITIA HUT KE-16 PELKAT PKLU' : '16TH PKLU ANNIVERSARY COMMITTEE'}
                                    </Text>
                                    <Text style={styles.headerSubtitle}>
                                        {isId ? 'MUPEL BEKASI - GEREJA PROTESTAN di INDONESIA bagian BARAT' : 'MUPEL BEKASI - PROTESTANT CHURCH IN WESTERN INDONESIA'}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.headerRight}>2026</Text>
                        </View>

                        {/* Title Section */}
                        <View style={styles.titleSection}>
                            <Text style={styles.docTitle}>
                                {isId ? 'SURAT KONFIRMASI KOMITMEN & UCAPAN TERIMA KASIH' : 'COMMITMENT CONFIRMATION & THANK YOU LETTER'}
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
                                ? 'Dengan penuh rasa syukur, kami dari Panitia Pelaksana menyampaikan terima kasih yang sebesar-besarnya atas kabar baik dan komitmen dukungan yang telah Bapak/Ibu berikan untuk mensukseskan Perayaan Ibadah Syukur Hari Ulang Tahun ke-16 Pelayanan Kategorial Persekutuan Kaum Lanjut Usia (Pelkat PKLU) GPIB yang akan dilaksanakan pada tanggal 12 Oktober 2026 di Bekasi Convention Center.'
                                : 'With deep gratitude, we from the Organizing Committee express our utmost appreciation for the good news and commitment of support you have provided to ensure the success of the 16th Anniversary Thanksgiving Celebration of the Categorical Fellowship of the Elderly (Pelkat PKLU) GPIB, to be held on October 12, 2026, at the Bekasi Convention Center.'}
                        </Text>

                        {/* Detail Card */}
                        <View style={styles.detailCard}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>{isId ? 'Nama Donatur' : 'Donor Name'}</Text>
                                <Text style={styles.detailValue}>{data.name}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>{isId ? 'Nama Tercantum' : 'Published Name'}</Text>
                                <Text style={styles.detailValue}>{data.display_name || data.name}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>{isId ? 'Jenis Komitmen' : 'Commitment Type'}</Text>
                                <Text style={styles.detailValue}>{commitmentFormLabel}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>{isId ? 'Nilai Komitmen' : 'Commitment Value'}</Text>
                                <Text style={styles.detailValueHighlight}>
                                    {data.contribution_value && Number(data.contribution_value) > 0 
                                        ? `Rp ${formatRupiah(Number(data.contribution_value))}`
                                        : (isId ? 'In-Kind / Non-Moneter' : 'In-Kind / Non-Monetary')}
                                </Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>{isId ? 'Kategori Apresiasi' : 'Honorary Category'}</Text>
                                <Text style={styles.detailValue}>{categoryLabel}</Text>
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
                                        ? 'Dukungan dana dapat ditransfer ke rekening panitia: PT. BANK ............................................... No. Rekening: ............................................... A.N. ...............................................\nMohon mengirimkan bukti transfer via WhatsApp ke nomor Sekretaris Panitia: 628111550543 (Vevi Mayo) untuk pencatatan kelunasan.'
                                        : 'Financial support can be transferred to the committee account: PT. BANK ............................................... Account No: ............................................... A.N. ...............................................\nPlease kindly send the transfer receipt via WhatsApp to the Committee Secretary: +62 811-1550-543 (Vevi Mayo) for reconciliation.'}
                                </Text>
                            </View>
                        )}

                        {/* Non-monetary instructions (shown if in-kind or no monetary support) */}
                        {(!data.contribution_value || Number(data.contribution_value) === 0) && (
                            <View style={[styles.bankCard, { backgroundColor: '#105b44' }]}>
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

                        <Text style={[styles.bodyParagraph, { marginTop: 10, marginBottom: 25 }]}>
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
                                    <Text style={styles.signatureRole}>{isId ? 'Panitia HUT ke-16 PKLU' : '16th PKLU Committee'}</Text>
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
                                        {isId ? 'Sekretaris I' : 'Secretary I'}
                                    </Text>
                                    <View style={styles.signatureLine} />
                                    <Text style={styles.signatureName}>Vevi Mayo</Text>
                                    <Text style={styles.signatureRole}>{isId ? 'Panitia HUT ke-16 PKLU' : '16th PKLU Committee'}</Text>
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
