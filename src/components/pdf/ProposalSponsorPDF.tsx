import {
    Document, Page, Text, View, StyleSheet, Image
} from '@react-pdf/renderer'
import { formatRupiah } from '@/lib/utils'

// Define the dummy verification URL base
const VERIFY_BASE_URL = 'https://hut16pklu.org/verify/SPO-'

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        backgroundColor: '#FCFAF5',
        color: '#2C3E50',
    },
    // COVER PAGE
    coverPage: {
        padding: 0,
        backgroundColor: '#022c22',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    watermarkContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 0,
        opacity: 0.05,
    },
    watermarkLogo: {
        width: 600,
        height: 600,
    },
    coverBorderOuter: {
        position: 'absolute',
        top: 25,
        bottom: 25,
        left: 25,
        right: 25,
        border: '1pt solid #D4AF37',
        zIndex: 1,
    },
    coverBorderInner: {
        position: 'absolute',
        top: 32,
        bottom: 32,
        left: 32,
        right: 32,
        border: '0.5pt solid rgba(212, 175, 55, 0.5)',
        zIndex: 1,
    },
    coverContent: {
        zIndex: 2,
        alignItems: 'center',
        width: '80%',
    },
    logoCover: {
        width: 160,
        height: 160,
        marginBottom: 30,
    },
    coverSubtitleTop: {
        fontFamily: 'Helvetica',
        fontSize: 12,
        color: '#D4AF37',
        letterSpacing: 4,
        textTransform: 'uppercase',
        marginBottom: 15,
        textAlign: 'center',
    },
    coverTitleMain: {
        fontFamily: 'Times-Roman',
        fontSize: 38,
        fontWeight: 700,
        color: '#FDFBF7',
        textAlign: 'center',
        letterSpacing: 2,
        marginBottom: 20,
        lineHeight: 1.2,
    },
    goldDivider: {
        width: 50,
        borderBottom: '2pt solid #D4AF37',
        marginBottom: 20,
    },
    coverTheme: {
        fontFamily: 'Times-Roman',
        fontSize: 28,
        color: '#D4AF37',
        marginBottom: 15,
        textAlign: 'center',
    },
    coverThemeSub: {
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#A0AEC0',
        letterSpacing: 1,
        textAlign: 'center',
        marginBottom: 50,
        lineHeight: 1.5,
    },
    coverDetails: {
        alignItems: 'center',
    },
    coverDetailText: {
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#FDFBF7',
        letterSpacing: 2,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    // HEADER & FOOTER
    headerWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        borderBottom: '1pt solid #D4AF37',
        paddingBottom: 15,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerLogos: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    headerLogo: {
        width: 30,
        height: 30,
        marginRight: 8,
    },
    headerTitle: {
        fontFamily: 'Times-Roman',
        fontSize: 12,
        fontWeight: 700,
        color: '#022c22',
        letterSpacing: 1,
    },
    headerSubtitle: {
        fontFamily: 'Helvetica',
        fontSize: 7,
        color: '#718096',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginTop: 2,
    },
    headerRight: {
        fontFamily: 'Helvetica',
        fontSize: 8,
        color: '#D4AF37',
        letterSpacing: 2,
    },
    footerPage: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTop: '0.5pt solid rgba(2, 44, 34, 0.2)',
        paddingTop: 15,
    },
    footerText: {
        fontFamily: 'Helvetica',
        fontSize: 7,
        color: '#A0AEC0',
        letterSpacing: 1,
    },
    // CONTENT TYPOGRAPHY
    sectionTitle: {
        fontFamily: 'Times-Roman',
        fontSize: 18,
        fontWeight: 700,
        color: '#022c22',
        marginBottom: 15,
    },
    bodyText: {
        fontFamily: 'Helvetica',
        fontSize: 9.5,
        lineHeight: 1.6,
        color: '#4A5568',
        marginBottom: 10,
        textAlign: 'justify',
    },
    bodyTextBold: {
        fontWeight: 700,
        color: '#022c22',
    },
    quoteContainer: {
        marginVertical: 20,
        padding: 20,
        backgroundColor: '#022c22',
        borderLeft: '4pt solid #D4AF37',
    },
    quoteText: {
        fontFamily: 'Times-Roman',
        fontSize: 14,
        color: '#D4AF37',
        textAlign: 'center',
        lineHeight: 1.5,
    },
    quoteRef: {
        fontFamily: 'Helvetica',
        fontSize: 8,
        color: '#FDFBF7',
        textAlign: 'center',
        marginTop: 8,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    // EDITORIAL TABLES
    editorialTable: {
        width: '100%',
        marginBottom: 20,
    },
    edTableRow: {
        flexDirection: 'row',
        borderBottom: '0.5pt solid rgba(2, 44, 34, 0.1)',
        paddingVertical: 8,
    },
    edTableHeader: {
        flexDirection: 'row',
        borderBottom: '1.5pt solid #022c22',
        paddingVertical: 10,
    },
    edTableCellLabel: {
        width: '35%',
        fontFamily: 'Helvetica',
        fontSize: 9,
        fontWeight: 700,
        color: '#022c22',
        paddingRight: 10,
    },
    edTableCellValue: {
        width: '65%',
        fontFamily: 'Helvetica',
        fontSize: 9,
        color: '#4A5568',
        lineHeight: 1.4,
    },
    edTableHeadText: {
        fontFamily: 'Helvetica',
        fontSize: 8.5,
        fontWeight: 700,
        color: '#022c22',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    // LISTS
    listItem: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    listBullet: {
        width: 15,
        fontFamily: 'Helvetica',
        fontSize: 9.5,
        color: '#022c22',
    },
    listText: {
        flex: 1,
        fontFamily: 'Helvetica',
        fontSize: 9.5,
        color: '#4A5568',
        lineHeight: 1.4,
    },
    // VIP CERTIFICATE
    vipCard: {
        backgroundColor: '#FFFFFF',
        padding: 30,
        border: '1pt solid #D4AF37',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    },
    vipTitle: {
        fontFamily: 'Times-Roman',
        fontSize: 16,
        fontWeight: 700,
        color: '#022c22',
        textAlign: 'center',
        marginBottom: 25,
        letterSpacing: 1,
    },
    vipRow: {
        flexDirection: 'row',
        marginBottom: 12,
        borderBottom: '0.5pt dotted #CBD5E0',
        paddingBottom: 4,
    },
    vipLabel: {
        width: '40%',
        fontFamily: 'Helvetica',
        fontSize: 8,
        fontWeight: 700,
        color: '#718096',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    vipValue: {
        width: '60%',
        fontFamily: 'Times-Roman',
        fontSize: 10,
        fontWeight: 700,
        color: '#022c22',
    },
    vipValueGold: {
        width: '60%',
        fontFamily: 'Times-Roman',
        fontSize: 12,
        fontWeight: 700,
        color: '#D4AF37',
    },
    // SIGNATURES
    sealSection: {
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 30,
    },
    sealBox: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 90,
        height: 90,
        border: '1pt solid #D4AF37',
        borderRadius: 45,
        padding: 5,
    },
    qrCodeSeal: {
        width: 50,
        height: 50,
        marginBottom: 2,
    },
    sealText: {
        fontFamily: 'Helvetica',
        fontSize: 5,
        color: '#D4AF37',
        textAlign: 'center',
        letterSpacing: 1,
    },
    signBox: {
        alignItems: 'center',
        width: 140,
    },
    signDate: {
        fontFamily: 'Helvetica',
        fontSize: 8,
        color: '#718096',
        marginBottom: 8,
        letterSpacing: 1,
    },
    signTitle: {
        fontFamily: 'Helvetica',
        fontSize: 7,
        fontWeight: 700,
        color: '#022c22',
        marginBottom: 35,
        letterSpacing: 1,
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    signLine: {
        width: 120,
        borderBottom: '1pt solid #022c22',
        marginBottom: 6,
    },
    signName: {
        fontFamily: 'Times-Roman',
        fontSize: 11,
        fontWeight: 700,
        color: '#022c22',
    },
    signRole: {
        fontFamily: 'Helvetica',
        fontSize: 7,
        color: '#718096',
        letterSpacing: 1,
    },
    signRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 30,
    },
    signCenterBox: {
        alignItems: 'center',
        width: 250,
        marginTop: 20,
    }
})

interface Props {
    data: any
    lang: 'id' | 'en'
    logoUrl?: string
    gpibLogoUrl?: string
    origin?: string
}

export function ProposalSponsorPDF({ data, lang, logoUrl = "/logo_hut16_pklu.png", gpibLogoUrl = "/logo_gpib.png", origin = "https://pklu.amanloka.com" }: Props) {
    const isId = lang === 'id'

    const CENTRAL_CONTACT_NAME = 'Vevi Mayo'
    const CENTRAL_CONTACT_PHONE = '628111550543'

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

    const committeeName = data.committees?.name || 'Vrilly Rondonuwu'
    const committeeRole = data.committees?.role || (isId ? 'Ketua Panitia' : 'Committee Chairperson')
    
    const verifyUrl = `${VERIFY_BASE_URL}${data.number || '0000-0000'}`
    const qrImageUrl = `https://quickchart.io/qr?text=${encodeURIComponent(verifyUrl)}&size=140&margin=1&dark=022c22`

    const categoryMap: Record<string, string> = {
        sahabat_bakti: isId ? 'Sahabat Bakti' : 'Service Friend',
        sahabat_teladan: isId ? 'Sahabat Teladan' : 'Role Model Friend',
        sahabat_pelayanan: isId ? 'Sahabat Pelayan' : 'Servant Friend',
        sahabat_berkat: isId ? 'Sahabat Berkat' : 'Blessing Friend',
        sahabat_kasih: isId ? 'Sahabat Kasih' : 'Love Friend',
    }
    const categoryLabel = categoryMap[data.donatur_category] || data.donatur_category

    const Header = () => (
        <View style={styles.headerWrapper} fixed>
            <View style={styles.headerLeft}>
                <View style={styles.headerLogos}>
                    <Image src={logoUrl} style={styles.headerLogo} />
                </View>
                <View>
                    <Text style={styles.headerTitle}>{isId ? 'PROPOSAL SPONSOR' : 'SPONSOR PROPOSAL'}</Text>
                    <Text style={styles.headerSubtitle}>{isId ? 'HUT Ke-16 Pelkat PKLU GPIB' : '16th Anniversary of PKLU GPIB'}</Text>
                </View>
            </View>
            <Text style={styles.headerRight}>2026</Text>
        </View>
    )

    const Footer = () => (
        <View style={styles.footerPage} fixed>
            <Text style={styles.footerText}>
                {isId ? 'Untuk Lansia - Oleh Lansia - Bersama PKLU GPIB' : 'For the Elderly - By the Elderly - With PKLU GPIB'}
            </Text>
            <Text style={styles.footerText} render={({ pageNumber, totalPages }) => (
                `${pageNumber} / ${totalPages}`
            )} />
        </View>
    )

    return (
        <Document>
            {/* PAGE 1: COVER */}
            <Page size="A4" style={styles.coverPage}>
                <View style={styles.watermarkContainer}>
                    <Image src={logoUrl} style={styles.watermarkLogo} />
                </View>
                <View style={styles.coverBorderOuter} />
                <View style={styles.coverBorderInner} />
                <View style={styles.coverContent}>
                    <View style={{ flexDirection: 'row', gap: 20, marginBottom: 30 }}>
                        <Image src={logoUrl} style={{ width: 100, height: 100 }} />
                    </View>
                    <Text style={styles.coverSubtitleTop}>
                        {isId ? 'Proposal Dukungan Pelayanan' : 'Service Support Proposal'}
                    </Text>
                    <Text style={styles.coverTitleMain}>
                        {isId ? 'PERAYAAN HUT KE-16\nPELKAT PKLU GPIB' : '16TH ANNIVERSARY\nOF PKLU GPIB'}
                    </Text>
                    <View style={styles.goldDivider} />
                    <Text style={styles.coverTheme}>"Teruskan Baktimu!"</Text>
                    <Text style={styles.coverThemeSub}>
                        {isId ? 'Lansia Teladan dalam Iman, Karya, dan Pelayanan\nBertumbuh Dalam Keselamatan (1 Petrus 2:2)' : 'Elderly Role Models in Faith, Work, and Service\nGrowing in Salvation (1 Peter 2:2)'}
                    </Text>
                    {/* Event Details Section (DI ATAS PREPARED FOR) */}
                    <View style={[styles.coverDetails, { marginBottom: 15 }]}>
                        <Text style={styles.coverDetailText}>{isId ? 'Senin, 12 Oktober 2026' : 'Monday, October 12, 2026'}</Text>
                        <Text style={styles.coverDetailText}>Bekasi Convention Center</Text>
                        <Text style={styles.coverDetailText}>Hotel Santika Mega Mall Bekasi</Text>
                        <Text style={styles.coverDetailText}>Jawa Barat</Text>
                    </View>

                    {/* Target Recipient Section with exclusive frame (DI TENGAH) */}
                    <View style={{ 
                        border: '1pt solid #D4AF37', 
                        padding: '12 24', 
                        marginTop: 10, 
                        marginBottom: 15, 
                        alignItems: 'center', 
                        borderRadius: 4, 
                        backgroundColor: 'rgba(212, 175, 55, 0.04)',
                        minWidth: 260
                    }}>
                        <Text style={{ fontFamily: 'Helvetica', fontSize: 7, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>
                            {isId ? 'Ditujukan Kepada / Prepared For:' : 'Prepared For:'}
                        </Text>
                        <Text style={{ fontFamily: 'Times-Roman', fontSize: 13, color: '#FDFBF7', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center' }}>
                            {data.name}
                        </Text>
                        {data.company_name && data.company_name !== data.name && (
                            <Text style={{ fontFamily: 'Helvetica', fontSize: 10, color: '#FDFBF7', marginTop: 2, textTransform: 'uppercase', textAlign: 'center' }}>
                                {data.company_name}
                            </Text>
                        )}
                        {data.pic_name && (
                            <Text style={{ fontFamily: 'Helvetica', fontSize: 8, color: '#A0AEC0', marginTop: 4, textTransform: 'uppercase', textAlign: 'center' }}>
                                {isId ? `U.p. Bpk/Ibu ${data.pic_name}` : `Attn: Mr/Ms ${data.pic_name}`} {data.pic_position ? `(${data.pic_position})` : ''}
                            </Text>
                        )}
                    </View>

                    {/* Proposal ID / Pembawa Section (DI BAWAH) */}
                    <View style={styles.coverDetails}>
                        <Text style={[styles.coverDetailText, { color: '#D4AF37', fontWeight: 700, marginBottom: 6, textAlign: 'center' }]}>
                            {isId 
                                ? `NO. PROPOSAL: ${data.number}${data.committees?.name ? ` | PEMBAWA: ${data.committees.name}` : ''}`
                                : `PROPOSAL NO: ${data.number}${data.committees?.name ? ` | PRESENTED BY: ${data.committees.name}` : ''}`}
                        </Text>
                        <Text style={[styles.coverDetailText, { color: '#A0AEC0', fontSize: 8 }]}>
                            {isId 
                                ? `Tanggal Terbit: ${formatDateLong(data.created_at, true)}`
                                : `Issued Date: ${formatDateLong(data.created_at, false)}`}
                        </Text>
                    </View>
                </View>
            </Page>

            {/* PAGE 2: PENDAHULUAN */}
            <Page size="A4" style={styles.page}>
                <Header />
                <Text style={styles.sectionTitle}>{isId ? 'I. Pendahuluan' : 'I. Introduction'}</Text>
                
                <View style={styles.quoteContainer}>
                    <Text style={styles.quoteText}>
                        {isId ? '“Hiasan orang muda ialah kekuatannya, dan keindahan orang tua ialah uban.”' : '“The glory of young men is their strength, gray hair the splendor of the old.”'}
                    </Text>
                    <Text style={styles.quoteRef}>— Amsal 20:29 / Proverbs 20:29 —</Text>
                </View>

                <Text style={styles.bodyText}>
                    {isId ? 'Uban di kepala adalah mahkota kemuliaan; tanda kesetiaan, pengalaman hidup, dan kasih Tuhan yang terus menyertai. Usia lanjut bukanlah akhir dari karya dan pelayanan, melainkan kesempatan untuk tetap menjadi berkat, menghadirkan hikmat, keteduhan, dan teladan iman bagi keluarga, gereja, dan masyarakat.' : 'Gray hair is a crown of splendor; a mark of loyalty, life experience, and God\'s ever-present love. Old age is not the end of work and service, but a golden opportunity to continue being a blessing, bringing wisdom, serenity, and a model of faith for family, church, and society.'}
                </Text>
                <Text style={styles.bodyText}>
                    {isId ? 'Pelayanan Kategorial Persekutuan Kaum Lanjut Usia atau Pelkat PKLU GPIB merupakan wadah pembinaan, persekutuan, dan pelayanan bagi warga jemaat GPIB berusia 60 tahun ke atas. Dalam kehidupan bergereja, kaum lanjut usia memiliki peran yang sangat berharga. Mereka bukan hanya hadir sebagai peserta, tetapi juga sebagai saksi iman, sumber hikmat, pelayan yang setia, serta teladan dalam ketekunan, kesetiaan, dan kasih.' : 'The Categorical Service of the Elderly Fellowship (Pelkat PKLU) GPIB is a forum for fostering, fellowship, and serving GPIB congregation members aged 60 and above. In church life, the elderly have a very precious role. They are not merely participants, but living witnesses of faith.'}
                </Text>
                <Text style={styles.bodyText}>
                    {isId ? 'Semangat pelayanan kaum lanjut usia ini sejalan dengan upaya peningkatan kesejahteraan lansia, termasuk dalam aspek keagamaan dan mental spiritual. Melalui berbagai kegiatan ibadah, pembinaan, persekutuan, kreativitas, dan pelayanan, Pelkat PKLU GPIB terus berupaya menghadirkan ruang yang mendukung lansia agar tetap sehat, mandiri, aktif, dan bermakna, serta menjadi teladan dalam kehidupan bergereja, berkeluarga, dan bermasyarakat.' : 'This spirit of service is aligned with efforts to improve elderly welfare, including religious and spiritual mental aspects. Through worship, fellowship, and creativity, PKLU GPIB strives to provide spaces supporting healthy, independent, and active living for the elderly.'}
                </Text>
                <Text style={styles.bodyText}>
                    {isId ? 'Pada tahun 2026, Pelkat PKLU GPIB memperingati Hari Ulang Tahun ke-16. Perayaan ini menjadi momen syukur atas kasih dan penyertaan Tuhan dalam perjalanan pelayanan Pelkat PKLU GPIB selama 16 tahun. Kegiatan ini mengangkat tema “Bertumbuh Dalam Keselamatan” (1 Petrus 2:2), dan Sub Tema “Lansia Teladan Dalam Iman, Karya dan Pelayanan”.' : 'In 2026, PKLU GPIB celebrates its 16th Anniversary. This celebration is a moment of gratitude for God\'s love over 16 years of service, adopting the theme "Growing in Salvation" (1 Peter 2:2) and Sub Theme "Elderly Role Models in Faith, Work, and Service".'}
                </Text>

                <View style={{ marginTop: 20 }} />
                <View style={[styles.quoteContainer, { backgroundColor: '#FDFBF7', borderLeft: '4pt solid #047857' }]}>
                    <Text style={[styles.sectionTitle, { fontSize: 14, marginBottom: 5 }]}>{isId ? 'Undangan Kasih' : 'Invitation of Love'}</Text>
                    <Text style={styles.bodyText}>
                        {isId ? 'Setiap dukungan, baik besar maupun kecil, menjadi bagian dari pelayanan yang membangun persekutuan, menguatkan lansia, dan menghadirkan sukacita bersama dalam HUT ke-16 Pelkat PKLU GPIB.' : 'Every support, big or small, becomes part of a service that builds fellowship, strengthens the elderly, and brings collective joy in the 16th Anniversary of PKLU GPIB.'}
                    </Text>
                </View>
                <Footer />
            </Page>

            {/* PAGE 3: MAKSUD, TUJUAN & RINGKASAN */}
            <Page size="A4" style={styles.page}>
                <Header />
                <Text style={styles.sectionTitle}>{isId ? 'II. Maksud dan Tujuan' : 'II. Purpose and Objectives'}</Text>
                <Text style={styles.bodyText}>{isId ? 'Proposal ini disusun sebagai permohonan dukungan dana dari pribadi, keluarga, dan sahabat pelayanan untuk mendukung terselenggaranya Perayaan dan Ibadah HUT ke-16 Pelkat PKLU GPIB.' : 'This proposal is prepared as a request for financial support to organize the 16th Anniversary Celebration of PKLU GPIB.'}</Text>
                
                <View style={styles.listItem}>
                    <Text style={styles.listBullet}>1.</Text>
                    <Text style={styles.listText}>{isId ? 'Mendukung terselenggaranya ibadah syukur dan perayaan HUT ke-16 Pelkat PKLU GPIB.' : 'Supporting the thanksgiving worship and 16th PKLU GPIB Anniversary celebration.'}</Text>
                </View>
                <View style={styles.listItem}>
                    <Text style={styles.listBullet}>2.</Text>
                    <Text style={styles.listText}>{isId ? 'Mempererat kebersamaan Pelkat PKLU GPIB dari berbagai jemaat di Indonesia.' : 'Strengthening the bonds of fellowship of Pelkat PKLU GPIB congregations across Indonesia.'}</Text>
                </View>
                <View style={styles.listItem}>
                    <Text style={styles.listBullet}>3.</Text>
                    <Text style={styles.listText}>{isId ? 'Mendukung kebutuhan peserta, khususnya kaum lanjut usia.' : 'Supporting the needs of participants, especially the elderly.'}</Text>
                </View>
                <View style={styles.listItem}>
                    <Text style={styles.listBullet}>4.</Text>
                    <Text style={styles.listText}>{isId ? 'Mendukung pra-kegiatan berupa lomba dan webinar.' : 'Supporting pre-event activities such as competitions and webinars.'}</Text>
                </View>
                <View style={styles.listItem}>
                    <Text style={styles.listBullet}>5.</Text>
                    <Text style={styles.listText}>{isId ? 'Mengapresiasi karya, talenta, pengalaman, dan kesaksian kaum lansia.' : 'Appreciating the works, talents, experiences, and testimonies of the elderly.'}</Text>
                </View>
                <View style={styles.listItem}>
                    <Text style={styles.listBullet}>6.</Text>
                    <Text style={styles.listText}>{isId ? 'Menguatkan semangat lansia teladan dalam iman, karya, dan pelayanan.' : 'Strengthening the spirit of elderly role models in faith, work, and service.'}</Text>
                </View>

                <View style={{ marginTop: 20 }} />
                <Text style={styles.sectionTitle}>{isId ? 'III. Ringkasan Kegiatan' : 'III. Event Summary'}</Text>
                
                <View style={styles.editorialTable}>
                    <View style={styles.edTableRow}>
                        <Text style={styles.edTableCellLabel}>{isId ? 'NAMA KEGIATAN' : 'EVENT NAME'}</Text>
                        <Text style={[styles.edTableCellValue, { fontFamily: 'Times-Roman', fontWeight: 700, fontSize: 11, color: '#022c22' }]}>
                            {isId ? 'Ibadah Perayaan dan Seremonial HUT ke-16 Pelkat PKLU GPIB' : 'Worship & Ceremonial 16th PKLU GPIB Anniversary'}
                        </Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={styles.edTableCellLabel}>{isId ? 'TAG LINE' : 'TAG LINE'}</Text>
                        <Text style={styles.edTableCellValue}>Teruskan Baktimu !</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={styles.edTableCellLabel}>{isId ? 'TEMA & SUBTEMA' : 'THEME & SUBTHEME'}</Text>
                        <Text style={styles.edTableCellValue}>
                            Bertumbuh dalam Keselamatan (1 Petrus 2: 2)\n
                            Lansia Teladan dalam Iman, Karya, dan Pelayanan
                        </Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={styles.edTableCellLabel}>{isId ? 'HARI / TANGGAL' : 'DATE'}</Text>
                        <Text style={styles.edTableCellValue}>{isId ? 'Senin, 12 Oktober 2026' : 'Monday, October 12, 2026'}</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={styles.edTableCellLabel}>{isId ? 'TEMPAT' : 'LOCATION'}</Text>
                        <Text style={styles.edTableCellValue}>Bekasi Convention Center, Hotel Santika Mega Mall Bekasi, Kota Bekasi, Jawa Barat</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={styles.edTableCellLabel}>{isId ? 'TARGET PESERTA' : 'TARGET ATTENDEES'}</Text>
                        <Text style={styles.edTableCellValue}>{isId ? '±600 orang dari pengurus dan anggota Pelkat PKLU GPIB di Indonesia' : '±600 Delegates from PKLU GPIB across Indonesia'}</Text>
                    </View>
                </View>

                <Footer />
            </Page>

            {/* PAGE 4: JADWAL & ANGGARAN */}
            <Page size="A4" style={styles.page}>
                <Header />
                <Text style={styles.sectionTitle}>{isId ? 'Rincian Agenda' : 'Agenda Details'}</Text>
                
                <View style={styles.editorialTable}>
                    <View style={styles.edTableHeader}>
                        <Text style={[styles.edTableHeadText, { width: '25%' }]}>{isId ? 'WAKTU' : 'TIME'}</Text>
                        <Text style={[styles.edTableHeadText, { width: '30%' }]}>{isId ? 'KEGIATAN' : 'ACTIVITY'}</Text>
                        <Text style={[styles.edTableHeadText, { width: '45%' }]}>{isId ? 'KETERANGAN' : 'DESCRIPTION'}</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellLabel, { width: '25%' }]}>Pra-Kegiatan</Text>
                        <Text style={[styles.edTableCellValue, { width: '30%', fontWeight: 700 }]}>Lomba Puisi</Text>
                        <Text style={[styles.edTableCellValue, { width: '45%', fontSize: 8 }]}>Ekspresi iman dan pengalaman hidup kaum lanjut usia.</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellLabel, { width: '25%' }]}>Pra-Kegiatan</Text>
                        <Text style={[styles.edTableCellValue, { width: '30%', fontWeight: 700 }]}>Lomba Artikel</Text>
                        <Text style={[styles.edTableCellValue, { width: '45%', fontSize: 8 }]}>Tema: Lansia Teladan dalam Iman, Karya, dan Pelayanan.</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellLabel, { width: '25%' }]}>Pra-Kegiatan</Text>
                        <Text style={[styles.edTableCellValue, { width: '30%', fontWeight: 700 }]}>Lomba Video Singkat</Text>
                        <Text style={[styles.edTableCellValue, { width: '45%', fontSize: 8 }]}>Tema: Lansia Teladan; karya inspiratif dari kaum lansia.</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellLabel, { width: '25%' }]}>Pra-Kegiatan</Text>
                        <Text style={[styles.edTableCellValue, { width: '30%', fontWeight: 700 }]}>Webinar</Text>
                        <Text style={[styles.edTableCellValue, { width: '45%', fontSize: 8 }]}>Bijak Mengelola Berkat: Persiapan Keuangan Menuju Masa Lanjut Usia yang Bermakna.</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellLabel, { width: '25%' }]}>12 Okt 2026</Text>
                        <Text style={[styles.edTableCellValue, { width: '30%', fontWeight: 700 }]}>Ibadah Syukur</Text>
                        <Text style={[styles.edTableCellValue, { width: '45%', fontSize: 8 }]}>Pusat perayaan dan ungkapan syukur kepada Tuhan.</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellLabel, { width: '25%' }]}>12 Okt 2026</Text>
                        <Text style={[styles.edTableCellValue, { width: '30%', fontWeight: 700 }]}>Seremonial & Seni</Text>
                        <Text style={[styles.edTableCellValue, { width: '45%', fontSize: 8 }]}>Seremonial bersama gereja & pemerintah, peniupan lilin, seni lansia.</Text>
                    </View>
                </View>

                <View style={{ marginTop: 20 }} />
                <Text style={styles.sectionTitle}>{isId ? 'IV. Anggaran Kegiatan' : 'IV. Budget Plan'}</Text>
                
                <View style={styles.editorialTable}>
                    <View style={styles.edTableHeader}>
                        <Text style={[styles.edTableHeadText, { width: '70%' }]}>{isId ? 'REKAPITULASI PENGELUARAN' : 'EXPENDITURE RECAPITULATION'}</Text>
                        <Text style={[styles.edTableHeadText, { width: '30%', textAlign: 'right', color: '#D4AF37' }]}>{isId ? 'JUMLAH (Rp)' : 'AMOUNT (Rp)'}</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellValue, { width: '70%' }]}>1. Sekretariat</Text>
                        <Text style={[styles.edTableCellValue, { width: '30%', textAlign: 'right', fontFamily: 'Times-Roman', fontWeight: 700 }]}>31.440.000</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellValue, { width: '70%' }]}>2. Seksi Acara / Ibadah / Penerima Tamu</Text>
                        <Text style={[styles.edTableCellValue, { width: '30%', textAlign: 'right', fontFamily: 'Times-Roman', fontWeight: 700 }]}>125.280.000</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellValue, { width: '70%' }]}>3. Seksi Konsumsi</Text>
                        <Text style={[styles.edTableCellValue, { width: '30%', textAlign: 'right', fontFamily: 'Times-Roman', fontWeight: 700 }]}>247.100.000</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellValue, { width: '70%' }]}>4. Seksi Dekorasi / Perlengkapan / Transportasi</Text>
                        <Text style={[styles.edTableCellValue, { width: '30%', textAlign: 'right', fontFamily: 'Times-Roman', fontWeight: 700 }]}>51.250.000</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellValue, { width: '70%' }]}>5. Seksi Dokumentasi, Humas, Dana, Kesehatan, Keamanan</Text>
                        <Text style={[styles.edTableCellValue, { width: '30%', textAlign: 'right', fontFamily: 'Times-Roman', fontWeight: 700 }]}>82.715.000</Text>
                    </View>
                    <View style={[styles.edTableRow, { borderBottom: '1.5pt solid #022c22' }]}>
                        <Text style={[styles.edTableCellLabel, { width: '70%' }]}>{isId ? 'TOTAL PENGELUARAN' : 'TOTAL EXPENDITURE'}</Text>
                        <Text style={[styles.edTableCellValue, { width: '30%', textAlign: 'right', fontFamily: 'Times-Roman', fontWeight: 700, color: '#022c22', fontSize: 11 }]}>537.785.000</Text>
                    </View>
                </View>

                <Footer />
            </Page>

            {/* PAGE 5: APRESIASI & DONASI SPESIFIK */}
            <Page size="A4" style={styles.page}>
                <Header />
                <Text style={styles.sectionTitle}>{isId ? 'V. Bentuk Dukungan Donatur' : 'V. Donor Support Forms'}</Text>
                
                <View style={styles.editorialTable}>
                    <View style={styles.edTableHeader}>
                        <Text style={[styles.edTableHeadText, { width: '25%' }]}>{isId ? 'KATEGORI' : 'CATEGORY'}</Text>
                        <Text style={[styles.edTableHeadText, { width: '35%' }]}>{isId ? 'NILAI DUKUNGAN' : 'SUPPORT VALUE'}</Text>
                        <Text style={[styles.edTableHeadText, { width: '40%' }]}>{isId ? 'APRESIASI HANGAT' : 'WARM APPRECIATION'}</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellLabel, { width: '25%' }]}>Sahabat Bakti</Text>
                        <Text style={[styles.edTableCellValue, { width: '35%', fontFamily: 'Times-Roman', fontWeight: 700 }]}>Rp 500.000 - Rp 999.999</Text>
                        <Text style={[styles.edTableCellValue, { width: '40%', fontSize: 8 }]}>{isId ? 'Nama dicantumkan dalam ucapan terima kasih digital.' : 'Name listed in digital thank you notes.'}</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellLabel, { width: '25%' }]}>Sahabat Teladan</Text>
                        <Text style={[styles.edTableCellValue, { width: '35%', fontFamily: 'Times-Roman', fontWeight: 700 }]}>Rp 1.000.000 - Rp 2.499.999</Text>
                        <Text style={[styles.edTableCellValue, { width: '40%', fontSize: 8 }]}>{isId ? 'Nama dicantumkan dalam buku acara elektronik.' : 'Name listed in electronic program book.'}</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellLabel, { width: '25%' }]}>Sahabat Pelayan</Text>
                        <Text style={[styles.edTableCellValue, { width: '35%', fontFamily: 'Times-Roman', fontWeight: 700 }]}>Rp 2.500.000 - Rp 4.999.999</Text>
                        <Text style={[styles.edTableCellValue, { width: '40%', fontSize: 8 }]}>{isId ? 'Nama di buku acara & ucapan terima kasih panitia.' : 'Name in program book & committee thank you.'}</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellLabel, { width: '25%' }]}>Sahabat Berkat</Text>
                        <Text style={[styles.edTableCellValue, { width: '35%', fontFamily: 'Times-Roman', fontWeight: 700 }]}>Rp 5.000.000 - Rp 9.999.999</Text>
                        <Text style={[styles.edTableCellValue, { width: '40%', fontSize: 8 }]}>{isId ? 'Nama lebih menonjol di halaman apresiasi buku elektronik.' : 'Name prominently featured in appreciation page.'}</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellLabel, { width: '25%' }]}>Sahabat Kasih</Text>
                        <Text style={[styles.edTableCellValue, { width: '35%', fontFamily: 'Times-Roman', fontWeight: 700 }]}>≥ Rp 10.000.000</Text>
                        <Text style={[styles.edTableCellValue, { width: '40%', fontSize: 8 }]}>{isId ? 'Halaman khusus ucapan syukur dan apresiasi.' : 'Dedicated gratitude page & appreciation.'}</Text>
                    </View>
                    <View style={[styles.edTableRow, { borderBottom: '1.5pt solid #022c22' }]}>
                        <Text style={[styles.edTableCellLabel, { width: '25%', color: '#D4AF37' }]}>Anonim / Sukacita</Text>
                        <Text style={[styles.edTableCellValue, { width: '35%', fontFamily: 'Times-Roman', fontWeight: 700, color: '#D4AF37' }]}>Sukarela</Text>
                        <Text style={[styles.edTableCellValue, { width: '40%', fontSize: 8, color: '#022c22', fontWeight: 700 }]}>{isId ? 'Dicatat sebagai NN / Keluarga yang Mengasihi Lansia.' : 'Recorded as Anonymous / Loving Family.'}</Text>
                    </View>
                </View>

                <View style={{ marginTop: 20 }} />
                <Text style={styles.sectionTitle}>{isId ? 'VI. Ide Apresiasi yang Hangat' : 'VI. Warm Appreciation Ideas'}</Text>
                
                <View style={styles.editorialTable}>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellLabel, { width: '35%' }]}>Buku Acara Elektronik</Text>
                        <Text style={[styles.edTableCellValue, { width: '65%' }]}>{isId ? 'Nama pribadi/keluarga dicantumkan pada halaman "Ucapan Syukur".' : 'Name listed in "Thanksgiving" page.'}</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellLabel, { width: '35%' }]}>Pohon Syukur Digital</Text>
                        <Text style={[styles.edTableCellValue, { width: '65%' }]}>{isId ? 'Nama ditampilkan sebagai daun-daun pada Pohon Syukur.' : 'Name displayed as leaves on the Thanksgiving Tree.'}</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellLabel, { width: '35%' }]}>Halaman Doa & Ucapan</Text>
                        <Text style={[styles.edTableCellValue, { width: '65%' }]}>{isId ? 'Donatur menuliskan ucapan singkat maksimal 25-40 kata.' : 'Donors write a short message max 25-40 words.'}</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellLabel, { width: '35%' }]}>Sertifikat Digital</Text>
                        <Text style={[styles.edTableCellValue, { width: '65%' }]}>{isId ? 'Sertifikat apresiasi digital "Sahabat Pelayanan".' : 'Digital appreciation certificate.'}</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellLabel, { width: '35%' }]}>Kartu Terima Kasih</Text>
                        <Text style={[styles.edTableCellValue, { width: '65%' }]}>{isId ? 'Dikirimkan melalui WhatsApp disertai foto kegiatan.' : 'Sent via WhatsApp with event photos.'}</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellLabel, { width: '35%' }]}>Slideshow Ucapan</Text>
                        <Text style={[styles.edTableCellValue, { width: '65%' }]}>{isId ? 'Ditayangkan saat jeda tanpa nominal.' : 'Displayed during breaks without nominal.'}</Text>
                    </View>
                </View>

                <Footer />
            </Page>

            {/* PAGE 6: PAKET DONASI SPESIFIK & PENGGUNAAN DANA */}
            <Page size="A4" style={styles.page}>
                <Header />
                <Text style={styles.sectionTitle}>{isId ? 'VII. Paket Donasi Spesifik' : 'VII. Specific Donation Packages'}</Text>
                
                <View style={styles.editorialTable}>
                    <View style={styles.edTableHeader}>
                        <Text style={[styles.edTableHeadText, { width: '40%' }]}>{isId ? 'PILIHAN DUKUNGAN' : 'SUPPORT OPTIONS'}</Text>
                        <Text style={[styles.edTableHeadText, { width: '60%' }]}>{isId ? 'CONTOH PERUNTUKAN' : 'USAGE EXAMPLES'}</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellLabel, { width: '40%' }]}>Dukung Konsumsi Lansia</Text>
                        <Text style={[styles.edTableCellValue, { width: '60%' }]}>{isId ? 'Membantu penyediaan makanan, snack, dan air mineral peserta.' : 'Helping provide food, snacks, and mineral water for participants.'}</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellLabel, { width: '40%' }]}>Dukung Hadiah Lomba</Text>
                        <Text style={[styles.edTableCellValue, { width: '60%' }]}>{isId ? 'Mendukung apresiasi pemenang lomba puisi, artikel, dan video.' : 'Supporting appreciation for competition winners.'}</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellLabel, { width: '40%' }]}>Dukung Souvenir Peserta</Text>
                        <Text style={[styles.edTableCellValue, { width: '60%' }]}>{isId ? 'Membantu pengadaan tanda kasih / merchandise sederhana.' : 'Helping procure simple merchandise for participants.'}</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellLabel, { width: '40%' }]}>Dukung Dokumentasi</Text>
                        <Text style={[styles.edTableCellValue, { width: '60%' }]}>{isId ? 'Mendukung foto, video, dan dokumentasi kenangan pelayanan.' : 'Supporting photo, video, and memory documentation.'}</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellLabel, { width: '40%' }]}>Dukung Webinar</Text>
                        <Text style={[styles.edTableCellValue, { width: '60%' }]}>{isId ? 'Mendukung teknis webinar dan narasumber lansia.' : 'Supporting webinar technicalities and elderly speakers.'}</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellLabel, { width: '40%' }]}>Dukung Peserta Lansia</Text>
                        <Text style={[styles.edTableCellValue, { width: '60%' }]}>{isId ? 'Membantu kebutuhan teknis & kenyamanan peserta lansia.' : 'Helping technical needs and comfort of elderly participants.'}</Text>
                    </View>
                </View>

                <View style={{ marginTop: 20 }} />
                <Text style={styles.sectionTitle}>{isId ? 'VIII. Penggunaan Dana Donatur' : 'VIII. Use of Donor Funds'}</Text>
                <Text style={styles.bodyText}>{isId ? 'Dukungan donatur akan digunakan untuk membantu kebutuhan kegiatan, antara lain:' : 'Donor support will be used to help event needs, including:'}</Text>
                
                <View style={styles.listItem}><Text style={styles.listBullet}>•</Text><Text style={styles.listText}>{isId ? 'Pelaksanaan ibadah dan perayaan HUT ke-16.' : 'Execution of worship and 16th Anniversary celebration.'}</Text></View>
                <View style={styles.listItem}><Text style={styles.listBullet}>•</Text><Text style={styles.listText}>{isId ? 'Konsumsi peserta dan dukungan kenyamanan peserta lansia.' : 'Participant consumption and comfort support for the elderly.'}</Text></View>
                <View style={styles.listItem}><Text style={styles.listBullet}>•</Text><Text style={styles.listText}>{isId ? 'Perlengkapan kegiatan, dekorasi, dan kebutuhan teknis acara.' : 'Event equipment, decoration, and technical needs.'}</Text></View>
                <View style={styles.listItem}><Text style={styles.listBullet}>•</Text><Text style={styles.listText}>{isId ? 'Hadiah lomba puisi, artikel, dan video singkat.' : 'Prizes for poetry, article, and short video competitions.'}</Text></View>
                <View style={styles.listItem}><Text style={styles.listBullet}>•</Text><Text style={styles.listText}>{isId ? 'Pelaksanaan webinar dan Dokumentasi kegiatan.' : 'Webinar execution and event documentation.'}</Text></View>
                <View style={styles.listItem}><Text style={styles.listBullet}>•</Text><Text style={styles.listText}>{isId ? 'Souvenir atau merchandise peserta.' : 'Participant souvenirs or merchandise.'}</Text></View>

                <Footer />
            </Page>

            {/* PAGE 7: BUKU ACARA & UCAPAN SINGKAT */}
            <Page size="A4" style={styles.page}>
                <Header />
                <Text style={styles.sectionTitle}>{isId ? 'IX. Contoh Halaman Buku Acara Elektronik' : 'IX. Electronic Program Book Page Example'}</Text>
                
                <View style={[styles.quoteContainer, { backgroundColor: '#FDFBF7', borderLeft: '4pt solid #D4AF37', border: '1pt solid #D4AF37' }]}>
                    <Text style={[styles.sectionTitle, { fontSize: 13, marginBottom: 15, textAlign: 'center', color: '#047857' }]}>
                        {isId ? 'Dengan penuh syukur, Panitia HUT ke-16 Pelkat PKLU GPIB mengucapkan terima kasih kepada:' : 'With full gratitude, the 16th PKLU GPIB Anniversary Committee thanks:'}
                    </Text>
                    
                    <Text style={[styles.bodyTextBold, { marginBottom: 5 }]}>Sahabat Kasih</Text>
                    <Text style={[styles.bodyText, { marginLeft: 10, marginBottom: 10 }]}>1. Keluarga .............................. 2. Bapak/Ibu ..............................</Text>

                    <Text style={[styles.bodyTextBold, { marginBottom: 5 }]}>Sahabat Berkat</Text>
                    <Text style={[styles.bodyText, { marginLeft: 10, marginBottom: 10 }]}>1. Keluarga .............................. 2. Bapak/Ibu ..............................</Text>

                    <Text style={[styles.bodyTextBold, { marginBottom: 5 }]}>Sahabat Pelayanan</Text>
                    <Text style={[styles.bodyText, { marginLeft: 10, marginBottom: 15 }]}>1. Keluarga .............................. 2. Bapak/Ibu ..............................</Text>

                    <Text style={[styles.bodyTextBold, { marginBottom: 5 }]}>Donatur Anonim</Text>
                    <Text style={[styles.bodyText, { marginLeft: 10, marginBottom: 20 }]}>Keluarga yang Mengasihi Pelayanan Lansia</Text>

                    <Text style={[styles.bodyText, { textAlign: 'center', fontStyle: 'italic' }]}>
                        {isId ? 'Kiranya Tuhan memberkati setiap dukungan, doa, dan kasih yang telah diberikan bagi pelayanan Pelkat PKLU GPIB.' : 'May God bless every support, prayer, and love given for the service of PKLU GPIB.'}
                    </Text>
                </View>

                <View style={{ marginTop: 20 }} />
                <Text style={styles.sectionTitle}>{isId ? 'X. Contoh Ucapan Singkat Donatur' : 'X. Donor Short Messages Examples'}</Text>
                <View style={styles.listItem}><Text style={styles.listBullet}>•</Text><Text style={styles.listText}>{isId ? 'Selamat HUT ke-16 Pelkat PKLU GPIB. Teruskan baktimu dan jadilah lansia teladan dalam iman, karya, dan pelayanan.' : 'Happy 16th PKLU GPIB Anniversary. Continue your service and be an elderly role model in faith, work, and service.'}</Text></View>
                <View style={styles.listItem}><Text style={styles.listBullet}>•</Text><Text style={styles.listText}>{isId ? 'Kiranya Pelkat PKLU GPIB terus menjadi berkat bagi gereja, keluarga, dan masyarakat.' : 'May PKLU GPIB continue to be a blessing to the church, family, and society.'}</Text></View>
                <View style={styles.listItem}><Text style={styles.listBullet}>•</Text><Text style={styles.listText}>{isId ? 'Bersyukur dapat mendukung pelayanan kaum lanjut usia. Tuhan memberkati seluruh rangkaian HUT ke-16 Pelkat PKLU GPIB.' : 'Grateful to support elderly service. God bless the entire 16th PKLU GPIB Anniversary series.'}</Text></View>
                <View style={styles.listItem}><Text style={styles.listBullet}>•</Text><Text style={styles.listText}>{isId ? 'Usia boleh bertambah, tetapi semangat pelayanan tetap menyala. Selamat melayani dan terus menjadi teladan.' : 'Age may increase, but the spirit of service remains lit. Happy serving and continue being a role model.'}</Text></View>

                <Footer />
            </Page>

            {/* PAGE 8: FORMAT KOMITMEN DONATUR (DINAMIS - VIP FORMAT) */}
            <Page size="A4" style={styles.page}>
                <Header />
                <Text style={styles.sectionTitle}>{isId ? 'XI. Lembar Komitmen & Pengesahan' : 'XI. Commitment & Endorsement Sheet'}</Text>
                <Text style={styles.bodyText}>
                    {isId ? 'Dengan kerendahan hati kami mengucapkan terima kasih atas komitmen dan dukungan yang Bapak/Ibu/Saudara berikan. Berikut adalah rincian data partisipasi resmi Anda yang telah tercatat dengan aman dalam sistem perbendaharaan kami.' : 'With humility, we thank you for your commitment and support. Below are the official details of your participation, securely recorded in our treasury system.'}
                </Text>

                {/* VIP Card Layout */}
                <View style={styles.vipCard}>
                    <Text style={styles.vipTitle}>{isId ? 'REKAMAN DUKUNGAN DONATUR' : 'DONOR SUPPORT RECORD'}</Text>
                    
                    <View style={styles.vipRow}>
                        <Text style={styles.vipLabel}>{isId ? 'Nomor Registrasi' : 'Registration Number'}</Text>
                        <Text style={[styles.vipValue, { fontFamily: 'Helvetica', fontSize: 10 }]}>{data.number}</Text>
                    </View>
                    <View style={styles.vipRow}>
                        <Text style={styles.vipLabel}>{isId ? 'Nama Lengkap' : 'Full Name'}</Text>
                        <Text style={styles.vipValue}>{data.name}</Text>
                    </View>
                    <View style={styles.vipRow}>
                        <Text style={styles.vipLabel}>{isId ? 'Nama Tercantum' : 'Published Name'}</Text>
                        <Text style={styles.vipValue}>{data.display_name || data.name}</Text>
                    </View>
                    <View style={styles.vipRow}>
                        <Text style={styles.vipLabel}>{isId ? 'Kategori Kehormatan' : 'Honorary Category'}</Text>
                        <Text style={[styles.vipValue, { color: '#D4AF37' }]}>{categoryLabel}</Text>
                    </View>
                    <View style={styles.vipRow}>
                        <Text style={styles.vipLabel}>{isId ? 'Nilai Dukungan' : 'Support Value'}</Text>
                        <Text style={styles.vipValueGold}>Rp {formatRupiah(Number(data.contribution_value))}</Text>
                    </View>
                    <View style={[styles.vipRow, { borderBottom: 'none', marginBottom: 0 }]}>
                        <Text style={styles.vipLabel}>{isId ? 'Pesan / Harapan' : 'Message / Hope'}</Text>
                        <Text style={[styles.vipValue, { fontSize: 10, lineHeight: 1.5 }]}>
                            "{data.message || (isId ? 'Teruskan Baktimu!' : 'Continue Your Service!')}"
                        </Text>
                    </View>
                </View>

                {/* Royal Seal */}
                <View style={styles.sealSection}>
                    <View style={styles.sealBox}>
                        <Image src={qrImageUrl} style={styles.qrCodeSeal} />
                        <Text style={styles.sealText}>
                            {isId ? 'PINDAI UNTUK\nVERIFIKASI KEASLIAN' : 'SCAN TO\nVERIFY AUTHENTICITY'}
                        </Text>
                    </View>
                </View>

                <Footer />
            </Page>

            {/* PAGE 9: INFORMASI TRANSFER & PENUTUP */}
            <Page size="A4" style={styles.page}>
                <Header />
                <Text style={styles.sectionTitle}>{isId ? 'XII. Informasi Transfer Dukungan' : 'XII. Support Transfer Information'}</Text>
                <Text style={styles.bodyText}>
                    {isId ? 'Guna memastikan transparansi dan akuntabilitas, seluruh dukungan dana hanya disalurkan melalui satu pintu rekening resmi Kepanitiaan berikut ini:' : 'To ensure transparency and accountability, all financial support is exclusively channeled through the following official Committee account:'}
                </Text>

                <View style={styles.quoteContainer}>
                    <Text style={[styles.edTableCellLabel, { color: '#A0AEC0', marginBottom: 5 }]}>Bank Pembayaran / Payment Bank</Text>
                    <Text style={[styles.vipValueGold, { marginBottom: 15 }]}>PT. BANK ...............................................</Text>
                    
                    <Text style={[styles.edTableCellLabel, { color: '#A0AEC0', marginBottom: 5 }]}>Nomor Rekening / Account Number</Text>
                    <Text style={[styles.vipValueGold, { marginBottom: 15 }]}>...............................................................</Text>
                    
                    <Text style={[styles.edTableCellLabel, { color: '#A0AEC0', marginBottom: 5 }]}>Nama Penerima / Beneficiary Name</Text>
                    <Text style={[styles.vipValueGold, { color: '#FDFBF7' }]}>...............................................................</Text>
                </View>
                
                <Text style={[styles.bodyText, { textAlign: 'center', marginTop: -10, marginBottom: 40 }]}>
                    {isId ? 'Mohon berkenan mengirimkan bukti transfer via WhatsApp ke nomor Sekretaris Panitia: ' : 'Please kindly send the transfer receipt via WhatsApp to the Committee Secretary: '}
                    <Text style={styles.bodyTextBold}>{CENTRAL_CONTACT_PHONE} ({CENTRAL_CONTACT_NAME})</Text>
                </Text>

                <Text style={styles.sectionTitle}>{isId ? 'XIII. Penutup' : 'XIII. Closing'}</Text>
                <Text style={styles.bodyText}>
                    {isId ? 'Demikian proposal dukungan donatur ini disampaikan sebagai undangan pelayanan bagi pribadi, keluarga, dan sahabat Pelkat PKLU GPIB yang rindu mengambil bagian dalam Perayaan dan Ibadah Memperingati HUT ke-16 Pelkat PKLU GPIB.' : 'Thus this donor support proposal is presented as an invitation to serve for individuals, families, and friends of PKLU GPIB who wish to take part in the 16th Anniversary Celebration and Worship.'}
                </Text>
                <Text style={styles.bodyText}>
                    {isId ? 'Setiap dukungan, baik besar maupun kecil, merupakan wujud kasih dan kepedulian yang sangat berarti bagi pelayanan kaum lanjut usia. Kiranya melalui kegiatan ini, Pelkat PKLU GPIB semakin dikuatkan untuk terus menjadi lansia teladan dalam iman, karya, dan pelayanan.' : 'Every support, big or small, is a manifestation of love and care that means a lot to the elderly service. May through this event, PKLU GPIB be further strengthened to continue being elderly role models in faith, work, and service.'}
                </Text>
                
                <Text style={[styles.sectionTitle, { fontSize: 12, marginTop: 20, textAlign: 'center' }]}>Terima Kasih</Text>
                <Text style={[styles.bodyText, { textAlign: 'center' }]}>
                    {isId ? 'Atas doa, dukungan, dan kasih yang diberikan, Panitia menyampaikan terima kasih.' : 'For the prayers, support, and love given, the Committee expresses gratitude.'}
                </Text>

                <View style={styles.signRow}>
                    <View style={styles.signBox}>
                        <Text style={styles.signTitle}>{isId ? 'Ketua Panitia' : 'Committee Chairperson'}</Text>
                        <View style={styles.signLine} />
                        <Text style={styles.signName}>Vrilly Rondonuwu</Text>
                    </View>

                    {/* Verification QR Code in the middle */}
                    <View style={{ alignItems: 'center', justifyContent: 'center', width: 90, marginTop: -5 }}>
                        <Image 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${origin}/verify/${data.id}`)}`} 
                            style={{ width: 55, height: 55, marginBottom: 4 }} 
                        />
                        <Text style={{ fontSize: 6, color: '#D4AF37', textAlign: 'center', fontWeight: 'bold' }}>
                            {isId ? 'DOKUMEN VALID' : 'VALID DOCUMENT'}
                        </Text>
                        <Text style={{ fontSize: 5, color: '#718096', textAlign: 'center', marginTop: 1 }}>
                            {isId ? 'PINDAI VERIFIKASI' : 'SCAN TO VERIFY'}
                        </Text>
                    </View>

                    <View style={styles.signBox}>
                        <Text style={styles.signTitle}>{isId ? 'Sekretaris I' : 'Secretary I'}</Text>
                        <View style={styles.signLine} />
                        <Text style={styles.signName}>Vevi Mayo</Text>
                    </View>
                </View>

                <View style={{ alignItems: 'center' }}>
                    <View style={styles.signCenterBox}>
                        <Text style={[styles.signTitle, { marginBottom: 10 }]}>{isId ? 'Mengetahui,' : 'Acknowledged by,'}</Text>
                        <Text style={[styles.signTitle, { marginBottom: 35 }]}>{isId ? 'Badan Pelaksana MUPEL Jemaat – Jemaat Bekasi' : 'Executive Board of GPIB MUPEL - Bekasi Jemaat'}</Text>
                        <View style={[styles.signLine, { width: 180 }]} />
                        <Text style={styles.signName}>Pdt. Daniel J C Lumentut, S.Th., M.M</Text>
                        <Text style={styles.signRole}>{isId ? 'Ketua B.P Mupel Bekasi' : 'Chairperson of BP Mupel Bekasi'}</Text>
                    </View>
                </View>

                <Footer />
            </Page>
        </Document>
    )
}
