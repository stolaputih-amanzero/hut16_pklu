import {
    Document, Page, Text, View, StyleSheet, Image
} from '@react-pdf/renderer'
import { formatRupiah } from '@/lib/utils'

// Define the dummy verification URL base
const VERIFY_BASE_URL = 'https://pklu.amanloka.com/verify/SPO-'

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

    const CENTRAL_CONTACT_NAME = 'Anastasia Christine Dolo'
    const CENTRAL_CONTACT_PHONE = '6281291451945'

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

    const commitmentMsg = isId
        ? `Halo Panitia HUT 16 PKLU GPIB, saya mewakili perusahaan/instansi ingin memberikan komitmen dukungan untuk Proposal Sponsorship No: ${data.number}. Nama Sponsor: ${data.name}.`
        : `Hello 16th PKLU GPIB Anniversary Committee, on behalf of my company/institution, I would like to make a support commitment for Sponsorship Proposal No: ${data.number}. Sponsor Name: ${data.name}.`
    const commitmentWaUrl = `https://api.whatsapp.com/send?phone=${CENTRAL_CONTACT_PHONE}&text=${encodeURIComponent(commitmentMsg)}`
    const commitmentWaQrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(commitmentWaUrl)}&size=140&margin=1&dark=022c22`

    const packageMap: Record<string, string> = {
        platinum: isId ? 'Platinum' : 'Platinum',
        gold: isId ? 'Emas / Gold' : 'Gold',
        silver: isId ? 'Perak / Silver' : 'Silver',
        bronze: isId ? 'Perunggu / Bronze' : 'Bronze',
        in_kind: isId ? 'In-Kind (Barang/Jasa)' : 'In-Kind',
        donatur: isId ? 'Partisipasi' : 'Participation',
    }
    const packageLabel = packageMap[data.sponsor_package] || data.sponsor_package

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
                        <Text style={[styles.coverDetailText, { color: '#D4AF37', fontWeight: 700, fontSize: 8, marginBottom: 4, textAlign: 'center', letterSpacing: 1 }]}>
                            {data.number}
                        </Text>
                        {data.committees?.name && (
                            <Text style={[styles.coverDetailText, { color: '#D4AF37', fontWeight: 500, fontSize: 8, marginBottom: 4, textAlign: 'center', letterSpacing: 0.5 }]}>
                                {data.committees.name.toUpperCase()}
                            </Text>
                        )}
                        <Text style={[styles.coverDetailText, { color: '#A0AEC0', fontSize: 7, textAlign: 'center', letterSpacing: 0.5 }]}>
                            {isId 
                                ? formatDateLong(data.proposal_date || data.created_at, true)
                                : formatDateLong(data.proposal_date || data.created_at, false)}
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

            {/* PAGE 4: JADWAL */}
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

                <Footer />
            </Page>

            {/* PAGE 5: ANGGARAN KEGIATAN */}
            <Page size="A4" style={styles.page}>
                <Header />
                <Text style={styles.sectionTitle}>{isId ? 'IV. Anggaran Kegiatan' : 'IV. Budget Plan'}</Text>
                
                <View style={styles.editorialTable}>
                    <View style={styles.edTableHeader}>
                        <Text style={[styles.edTableHeadText, { width: '70%' }]}>{isId ? 'KOMPONEN ANGGARAN' : 'BUDGET COMPONENTS'}</Text>
                        <Text style={[styles.edTableHeadText, { width: '30%', textAlign: 'right', color: '#D4AF37' }]}>{isId ? 'ESTIMASI BIAYA (Rp)' : 'ESTIMATED COST (Rp)'}</Text>
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
                        <Text style={[styles.edTableCellValue, { width: '70%' }]}>5. Seksi Dokumentasi</Text>
                        <Text style={[styles.edTableCellValue, { width: '30%', textAlign: 'right', fontFamily: 'Times-Roman', fontWeight: 700 }]}>19.150.000</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellValue, { width: '70%' }]}>6. Seksi Humas / Publikasi</Text>
                        <Text style={[styles.edTableCellValue, { width: '30%', textAlign: 'right', fontFamily: 'Times-Roman', fontWeight: 700 }]}>1.440.000</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellValue, { width: '70%' }]}>7. Seksi Usaha Dana</Text>
                        <Text style={[styles.edTableCellValue, { width: '30%', textAlign: 'right', fontFamily: 'Times-Roman', fontWeight: 700 }]}>56.000.000</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellValue, { width: '70%' }]}>8. Seksi Kesehatan</Text>
                        <Text style={[styles.edTableCellValue, { width: '30%', textAlign: 'right', fontFamily: 'Times-Roman', fontWeight: 700 }]}>4.725.000</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellValue, { width: '70%' }]}>9. Seksi Keamanan</Text>
                        <Text style={[styles.edTableCellValue, { width: '30%', textAlign: 'right', fontFamily: 'Times-Roman', fontWeight: 700 }]}>1.400.000</Text>
                    </View>
                    <View style={[styles.edTableRow, { borderBottom: '1.5pt solid #022c22' }]}>
                        <Text style={[styles.edTableCellLabel, { width: '70%' }]}>{isId ? 'TOTAL ESTIMASI BIAYA' : 'TOTAL ESTIMATED COST'}</Text>
                        <Text style={[styles.edTableCellValue, { width: '30%', textAlign: 'right', fontFamily: 'Times-Roman', fontWeight: 700, color: '#022c22', fontSize: 11 }]}>537.785.000</Text>
                    </View>
                </View>

                <Footer />
            </Page>

             {/* PAGE 6: PAKET SPONSORSHIP */}
            <Page size="A4" style={styles.page}>
                <Header />
                <Text style={styles.sectionTitle}>{isId ? 'V. Paket Sponsorship' : 'V. Sponsorship Packages'}</Text>
                
                <View style={styles.editorialTable}>
                    <View style={styles.edTableHeader}>
                        <Text style={[styles.edTableHeadText, { width: '25%' }]}>{isId ? 'PAKET SPONSOR' : 'SPONSOR PACKAGE'}</Text>
                        <Text style={[styles.edTableHeadText, { width: '25%' }]}>{isId ? 'KONTRIBUSI' : 'CONTRIBUTION'}</Text>
                        <Text style={[styles.edTableHeadText, { width: '50%' }]}>{isId ? 'BENEFIT UTAMA SPONSOR' : 'MAIN SPONSOR BENEFITS'}</Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellLabel, { width: '25%' }]}>Platinum</Text>
                        <Text style={[styles.edTableCellValue, { width: '25%', fontFamily: 'Times-Roman', fontWeight: 700 }]}>≥ Rp 50.000.000</Text>
                        <Text style={[styles.edTableCellValue, { width: '50%', fontSize: 8 }]}>
                            {isId 
                                ? 'Logo utama backdrop & media digital, penyebutan MC, booth promosi, video greeting, dokumentasi khusus & laporan kegiatan.' 
                                : 'Primary logo on backdrop & digital media, MC mentions, promo booth, video greeting, special docs & event report.'}
                        </Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellLabel, { width: '25%' }]}>Gold</Text>
                        <Text style={[styles.edTableCellValue, { width: '25%', fontFamily: 'Times-Roman', fontWeight: 700 }]}>Rp 25Jt - 49.9Jt</Text>
                        <Text style={[styles.edTableCellValue, { width: '50%', fontSize: 8 }]}>
                            {isId 
                                ? 'Logo backdrop & media digital, penyebutan MC, penyebaran materi promosi, laporan kegiatan.' 
                                : 'Logo on backdrop & digital, MC mentions, promo material distribution, event report.'}
                        </Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellLabel, { width: '25%' }]}>Silver</Text>
                        <Text style={[styles.edTableCellValue, { width: '25%', fontFamily: 'Times-Roman', fontWeight: 700 }]}>Rp 10Jt - 24.9Jt</Text>
                        <Text style={[styles.edTableCellValue, { width: '50%', fontSize: 8 }]}>
                            {isId 
                                ? 'Logo pada media publikasi tertentu, penyebutan oleh MC, pencantuman pada daftar sponsor.' 
                                : 'Logo on select media, MC mentions, listing on sponsor page.'}
                        </Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellLabel, { width: '25%' }]}>Bronze</Text>
                        <Text style={[styles.edTableCellValue, { width: '25%', fontFamily: 'Times-Roman', fontWeight: 700 }]}>Rp 5Jt - 9.9Jt</Text>
                        <Text style={[styles.edTableCellValue, { width: '50%', fontSize: 8 }]}>
                            {isId 
                                ? 'Pencantuman nama / logo, penyebutan oleh MC, ucapan terima kasih panitia.' 
                                : 'Name / logo listing, MC mentions, committee appreciation.'}
                        </Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellLabel, { width: '25%', color: '#D4AF37' }]}>In-Kind</Text>
                        <Text style={[styles.edTableCellValue, { width: '25%', fontFamily: 'Times-Roman', fontWeight: 700, color: '#D4AF37' }]}>Barang / Jasa</Text>
                        <Text style={[styles.edTableCellValue, { width: '50%', fontSize: 8, color: '#022c22', fontWeight: 700 }]}>
                            {isId 
                                ? 'Pencantuman nama / logo sebagai pendukung, penyebutan oleh MC sesuai bentuk dukungan.' 
                                : 'Name / logo listing as supporter, MC mentions based on support form.'}
                        </Text>
                    </View>
                    <View style={[styles.edTableRow, { borderBottom: '1.5pt solid #022c22' }]}>
                        <Text style={[styles.edTableCellLabel, { width: '25%', color: '#D4AF37' }]}>Donatur</Text>
                        <Text style={[styles.edTableCellValue, { width: '25%', fontFamily: 'Times-Roman', fontWeight: 700, color: '#D4AF37' }]}>Sukarela</Text>
                        <Text style={[styles.edTableCellValue, { width: '50%', fontSize: 8, color: '#022c22', fontWeight: 700 }]}>
                            {isId 
                                ? 'Pencantuman nama sebagai pendukung (apabila berkenan), ucapan terima kasih panitia.' 
                                : 'Name listing as supporter (optional), committee appreciation.'}
                        </Text>
                    </View>
                </View>

                <Footer />
            </Page>

            {/* PAGE 7: KETENTUAN APRESIASI SPONSORSHIP */}
            <Page size="A4" style={styles.page}>
                <Header />
                <Text style={styles.sectionTitle}>{isId ? 'VI. Apresiasi & Publikasi Kemitraan' : 'VI. Appreciation & Partnership Publicity'}</Text>
                
                <View style={styles.editorialTable}>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellLabel, { width: '35%' }]}>{isId ? 'Pencantuman Logo' : 'Logo Placement'}</Text>
                        <Text style={[styles.edTableCellValue, { width: '65%' }]}>
                            {isId 
                                ? 'Logo sponsor akan ditempatkan pada backdrop utama acara dan media digital panitia sesuai dengan kategori paket.' 
                                : 'Sponsor logo will be placed on the main event backdrop and digital media based on package category.'}
                        </Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellLabel, { width: '35%' }]}>{isId ? 'Penyebutan MC' : 'MC Mentions'}</Text>
                        <Text style={[styles.edTableCellValue, { width: '65%' }]}>
                            {isId 
                                ? 'Nama perusahaan/lembaga sponsor akan dibacakan oleh pembawa acara (MC) selama rangkaian ibadah dan perayaan.' 
                                : 'Sponsor name will be announced by the MC during the worship and celebration sequence.'}
                        </Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellLabel, { width: '35%' }]}>{isId ? 'Materi Promosi' : 'Promo Materials'}</Text>
                        <Text style={[styles.edTableCellValue, { width: '65%' }]}>
                            {isId 
                                ? 'Pemberian kesempatan penyebaran brosur / flyer produk sponsor kepada jemaat dan tamu undangan di lokasi acara.' 
                                : 'Opportunity to distribute sponsor brochures/flyers to attendees and guests at the event venue.'}
                        </Text>
                    </View>
                    <View style={styles.edTableRow}>
                        <Text style={[styles.edTableCellLabel, { width: '35%' }]}>{isId ? 'Laporan Kegiatan' : 'Event Report'}</Text>
                        <Text style={[styles.edTableCellValue, { width: '65%' }]}>
                            {isId 
                                ? 'Laporan pertanggungjawaban kegiatan tertulis beserta dokumentasi foto/video akan dikirimkan pasca-acara.' 
                                : 'Written accountability report and photo/video documentation will be sent after the event.'}
                        </Text>
                    </View>
                </View>

                <Footer />
            </Page>

            {/* PAGE 8: PENGGUNAAN DANA SPONSORSHIP */}
            <Page size="A4" style={styles.page}>
                <Header />
                <Text style={styles.sectionTitle}>{isId ? 'VII. Penggunaan Dana Sponsorship' : 'VII. Use of Sponsorship Funds'}</Text>
                <Text style={styles.bodyText}>
                    {isId 
                        ? 'Dukungan dana dari pihak sponsor akan dialokasikan sepenuhnya untuk menyukseskan rangkaian kegiatan HUT ke-16 Pelkat PKLU GPIB, dengan perincian utama sebagai berikut:' 
                        : 'Financial support from sponsors will be fully allocated to ensure the success of the 16th PKLU GPIB Anniversary events, with the following main details:'}
                </Text>
                
                <View style={styles.listItem}><Text style={styles.listBullet}>•</Text><Text style={styles.listText}>{isId ? 'Penyewaan tempat penyelenggaraan di Bekasi Convention Center (Hotel Santika Mega Mall).' : 'Venue rental at Bekasi Convention Center (Hotel Santika Mega Mall).'}</Text></View>
                <View style={styles.listItem}><Text style={styles.listBullet}>•</Text><Text style={styles.listText}>{isId ? 'Penyediaan konsumsi bergizi dan air mineral bagi ±600 orang jemaat lansia.' : 'Provision of nutritious meals and mineral water for ±600 elderly attendees.'}</Text></View>
                <View style={styles.listItem}><Text style={styles.listBullet}>•</Text><Text style={styles.listText}>{isId ? 'Pengadaan sistem suara (sound system), dekorasi panggung, videotron, dan pencahayaan.' : 'Procurement of sound system, stage decoration, videotron, and event lighting.'}</Text></View>
                <View style={styles.listItem}><Text style={styles.listBullet}>•</Text><Text style={styles.listText}>{isId ? 'Fasilitas kesehatan darurat (ketersediaan ambulans dan tim medis di lokasi).' : 'Emergency health facilities (on-site ambulance and medical team availability).'}</Text></View>
                <View style={styles.listItem}><Text style={styles.listBullet}>•</Text><Text style={styles.listText}>{isId ? 'Penyelenggaraan webinar pra-kegiatan tentang pengelolaan keuangan masa lansia.' : 'Organization of pre-event webinar on financial management for the elderly.'}</Text></View>
                <View style={styles.listItem}><Text style={styles.listBullet}>•</Text><Text style={styles.listText}>{isId ? 'Apresiasi hadiah bagi para lansia pemenang lomba puisi, artikel, dan video pendek.' : 'Prizes and appreciation for elderly winners of poetry, article, and short video contests.'}</Text></View>

                <Footer />
            </Page>

            {/* PAGE 9: CONTOH HALAMAN BUKU ACARA & APRESIASI */}
            <Page size="A4" style={styles.page}>
                <Header />
                <Text style={styles.sectionTitle}>{isId ? 'VIII. Contoh Apresiasi Buku Acara Elektronik' : 'VIII. Program Book Appreciation Example'}</Text>
                
                <View style={[styles.quoteContainer, { backgroundColor: '#FDFBF7', borderLeft: '4pt solid #D4AF37', border: '1pt solid #D4AF37' }]}>
                    <Text style={[styles.sectionTitle, { fontSize: 13, marginBottom: 15, textAlign: 'center', color: '#047857' }]}>
                        {isId ? 'Dengan penuh syukur, Panitia HUT ke-16 Pelkat PKLU GPIB mengucapkan terima kasih kepada Sponsor Kemitraan:' : 'With full gratitude, the 16th PKLU GPIB Anniversary Committee thanks our Partnership Sponsors:'}
                    </Text>
                    
                    <Text style={[styles.bodyTextBold, { marginBottom: 5 }]}>Sponsor Platinum</Text>
                    <Text style={[styles.bodyText, { marginLeft: 10, marginBottom: 10 }]}>1. PT. .............................................. 2. Lembaga ..............................................</Text>

                    <Text style={[styles.bodyTextBold, { marginBottom: 5 }]}>Sponsor Gold</Text>
                    <Text style={[styles.bodyText, { marginLeft: 10, marginBottom: 10 }]}>1. PT. .............................................. 2. Bpk/Ibu ..............................................</Text>

                    <Text style={[styles.bodyTextBold, { marginBottom: 5 }]}>Sponsor Silver & Bronze</Text>
                    <Text style={[styles.bodyText, { marginLeft: 10, marginBottom: 15 }]}>1. PT. .............................................. 2. Instansi ..............................................</Text>

                    <Text style={[styles.bodyText, { textAlign: 'center', fontStyle: 'italic' }]}>
                        {isId ? 'Kiranya Tuhan memberkati setiap bentuk kerja sama dan kemitraan demi pelayanan kaum lanjut usia.' : 'May God bless every form of cooperation and partnership for the service of the elderly.'}
                    </Text>
                </View>

                <Footer />
            </Page>

            {/* PAGE 10: LEMBAR KOMITMEN */}
            <Page size="A4" style={styles.page}>
                <Header />
                {data.contribution_value ? (
                    <>
                        <Text style={styles.sectionTitle}>{isId ? 'IX. Lembar Komitmen & Pengesahan' : 'IX. Commitment & Endorsement Sheet'}</Text>
                        <Text style={styles.bodyText}>
                            {isId ? 'Dengan kerendahan hati kami mengucapkan terima kasih atas komitmen dan dukungan yang Bapak/Ibu/Saudara berikan. Berikut adalah rincian data kemitraan resmi Anda yang telah tercatat dengan aman dalam sistem perbendaharaan kami.' : 'With humility, we thank you for your commitment and support. Below are the official details of your partnership, securely recorded in our treasury system.'}
                        </Text>

                        {/* VIP Card Layout */}
                        <View style={styles.vipCard}>
                            <Text style={styles.vipTitle}>{isId ? 'REKAMAN DUKUNGAN SPONSORSHIP' : 'SPONSORSHIP SUPPORT RECORD'}</Text>
                            
                            <View style={styles.vipRow}>
                                <Text style={styles.vipLabel}>{isId ? 'Nomor Registrasi' : 'Registration Number'}</Text>
                                <Text style={[styles.vipValue, { fontFamily: 'Helvetica', fontSize: 10 }]}>{data.number}</Text>
                            </View>
                            <View style={styles.vipRow}>
                                <Text style={styles.vipLabel}>{isId ? 'Perusahaan / Lembaga' : 'Company / Institution'}</Text>
                                <Text style={styles.vipValue}>{data.name}</Text>
                            </View>
                            {data.pic_name && (
                                <View style={styles.vipRow}>
                                    <Text style={styles.vipLabel}>{isId ? 'Penanggung Jawab (PIC)' : 'Representative (PIC)'}</Text>
                                    <Text style={styles.vipValue}>{data.pic_name} {data.pic_position ? `(${data.pic_position})` : ''}</Text>
                                </View>
                            )}
                            <View style={styles.vipRow}>
                                <Text style={styles.vipLabel}>{isId ? 'Paket Sponsorship' : 'Sponsorship Package'}</Text>
                                <Text style={[styles.vipValue, { color: '#D4AF37', fontWeight: 700 }]}>{packageLabel}</Text>
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
                    </>
                ) : (
                    <>
                        <Text style={styles.sectionTitle}>{isId ? 'IX. Formulir Komitmen Digital' : 'IX. Digital Commitment Form'}</Text>
                        <Text style={styles.bodyText}>
                            {isId 
                                ? 'Bapak/Ibu Pimpinan Perusahaan/Instansi yang terkasih, jika Anda tergerak untuk menjalin kemitraan dan mendukung persekutuan serta pelayanan Kaum Lanjut Usia GPIB ini, Anda dapat menyatakan komitmen dukungan sponsorship Anda secara mudah secara digital.'
                                : 'Dear Company/Institution Leaders, if you are moved to establish a partnership and support this GPIB Elderly Fellowship and service, you can easily convey your sponsorship commitment digitally.'
                            }
                        </Text>
                        <Text style={styles.bodyText}>
                            {isId
                                ? 'Silakan membalas pesan WhatsApp panitia yang menghubungi Anda, atau pindai QR Code di bawah ini untuk mengirimkan komitmen dukungan Anda secara otomatis ke nomor resmi Sekretariat Panitia.'
                                : 'Please reply to the WhatsApp message from the committee member contacting you, or scan the QR Code below to automatically send your support commitment to the official Committee Secretariat.'
                            }
                        </Text>

                        {/* QR Code WhatsApp Box */}
                        <View style={{ alignItems: 'center', marginTop: 30, marginBottom: 20 }}>
                            <View style={[styles.vipCard, { width: '80%', alignItems: 'center', padding: 25 }]}>
                                <Text style={[styles.vipTitle, { fontSize: 13, marginBottom: 15 }]}>
                                    {isId ? 'PINDAI UNTUK KIRIM KOMITMEN VIA WA' : 'SCAN TO SEND COMMITMENT VIA WHATSAPP'}
                                </Text>
                                <Image src={commitmentWaQrUrl} style={{ width: 140, height: 140, marginBottom: 15 }} />
                                <Text style={[styles.bodyText, { textAlign: 'center', fontSize: 9, color: '#718096' }]}>
                                    {isId
                                        ? 'Atau hubungi WhatsApp: 0812-9145-1945 (Anastasia Christine Dolo)'
                                        : 'Or contact WhatsApp: +62 812-9145-1945 (Anastasia Christine Dolo)'
                                    }
                                </Text>
                            </View>
                        </View>
                    </>
                )}

                <Footer />
            </Page>

            {/* PAGE 11: INFORMASI TRANSFER & PENUTUP */}
            <Page size="A4" style={[styles.page, { paddingBottom: 40 }]}>
                <Header />
                <Text style={[styles.sectionTitle, { fontSize: 13, marginBottom: 6 }]}>{isId ? 'X. Informasi Transfer Dukungan' : 'X. Support Transfer Information'}</Text>
                <Text style={[styles.bodyText, { fontSize: 8.5, marginBottom: 5 }]}>
                    {isId ? 'Guna memastikan transparansi dan akuntabilitas, seluruh dukungan dana hanya disalurkan melalui satu pintu rekening resmi Kepanitiaan berikut ini:' : 'To ensure transparency and accountability, all financial support is exclusively channeled through the following official Committee account:'}
                </Text>

                <View style={[styles.quoteContainer, { padding: '4 15', marginVertical: 4, borderLeftWidth: 3 }]}>
                    <Text style={[styles.edTableCellLabel, { color: '#A0AEC0', marginBottom: 1, fontSize: 7.5 }]}>Bank Pembayaran / Payment Bank</Text>
                    <Text style={[styles.vipValueGold, { marginBottom: 4, fontSize: 10 }]}>Bank BTN</Text>
                    
                    <Text style={[styles.edTableCellLabel, { color: '#A0AEC0', marginBottom: 1, fontSize: 7.5 }]}>Nomor Rekening / Account Number</Text>
                    <Text style={[styles.vipValueGold, { marginBottom: 4, fontSize: 10 }]}>00179-01-88-000447-9</Text>
                    
                    <Text style={[styles.edTableCellLabel, { color: '#A0AEC0', marginBottom: 1, fontSize: 7.5 }]}>Nama Penerima / Beneficiary Name</Text>
                    <Text style={[styles.vipValueGold, { color: '#FDFBF7', fontSize: 10 }]}>PANITIA MUPEL GPIB BEKASI</Text>
                </View>
                
                <Text style={[styles.bodyText, { textAlign: 'center', marginTop: 2, marginBottom: 6, fontSize: 8 }]}>
                    {isId ? 'Mohon berkenan mengirimkan bukti transfer via WhatsApp ke nomor Kontak Person: ' : 'Please kindly send the transfer receipt via WhatsApp to the Contact Person: '}
                    <Text style={styles.bodyTextBold}>+62 812-9145-1945 (Anastasia Christine Dolo)</Text>
                </Text>

                <Text style={[styles.sectionTitle, { fontSize: 12, marginBottom: 4 }]}>{isId ? 'XI. Penutup' : 'XI. Closing'}</Text>
                <Text style={[styles.bodyText, { fontSize: 8.5, marginBottom: 3, lineHeight: 1.3 }]}>
                    {isId ? 'Demikian proposal kemitraan sponsorship ini disampaikan sebagai undangan kerja sama bagi instansi, perusahaan, dan lembaga untuk mengambil bagian dalam Perayaan dan Ibadah Memperingati HUT ke-16 Pelkat PKLU GPIB.' : 'Thus this sponsorship partnership proposal is presented as an invitation to cooperate for institutions, companies, and organizations to take part in the 16th Anniversary Celebration and Worship.'}
                </Text>
                <Text style={[styles.bodyText, { fontSize: 8.5, marginBottom: 6, lineHeight: 1.3 }]}>
                    {isId ? 'Setiap dukungan, baik dalam bentuk dana maupun in-kind, merupakan wujud kepedulian yang sangat berharga bagi peningkatan kesejahteraan dan pemberdayaan kaum lanjut usia. Kiranya kemitraan yang terjalin mendatangkan manfaat bersama dan berkat bagi pelayanan PKLU GPIB.' : 'Every support, whether financial or in-kind, is a highly valuable form of care for the improvement of welfare and empowerment of the elderly. May the partnership established bring mutual benefit and blessings for the PKLU GPIB service.'}
                </Text>
                
                <Text style={[styles.sectionTitle, { fontSize: 10, marginTop: 25, marginBottom: 4, textAlign: 'center' }]}>Terima Kasih</Text>
                <Text style={[styles.bodyText, { fontSize: 8.5, textAlign: 'center', marginBottom: 15 }]}>
                    {isId ? 'Atas perhatian, dukungan, dan kerja sama yang diberikan, Panitia menyampaikan terima kasih.' : 'For the attention, support, and cooperation given, the Committee expresses gratitude.'}
                </Text>

                <View style={[styles.signRow, { marginTop: 10 }]}>
                    <View style={styles.signBox}>
                        <Text style={[styles.signTitle, { marginBottom: 20 }]}>{isId ? 'Ketua Panitia' : 'Committee Chairperson'}</Text>
                        <View style={styles.signLine} />
                        <Text style={styles.signName}>Vrilly Rondonuwu</Text>
                    </View>

                    {/* Verification QR Code in the middle */}
                    <View style={{ alignItems: 'center', justifyContent: 'center', width: 90, marginTop: -8 }}>
                        <Image 
                            src={`https://quickchart.io/qr?size=100&text=${encodeURIComponent(`${origin}/verify/${data.id}`)}`} 
                            style={{ width: 40, height: 40, marginBottom: 2 }} 
                        />
                        <Text style={{ fontSize: 5.5, color: '#D4AF37', textAlign: 'center', fontWeight: 'bold' }}>
                            {isId ? 'DOKUMEN VALID' : 'VALID DOCUMENT'}
                        </Text>
                        <Text style={{ fontSize: 4.5, color: '#718096', textAlign: 'center', marginTop: 0.5 }}>
                            {isId ? 'PINDAI VERIFIKASI' : 'SCAN TO VERIFY'}
                        </Text>
                    </View>

                    <View style={styles.signBox}>
                        <Text style={[styles.signTitle, { marginBottom: 20 }]}>{isId ? 'Sekretaris' : 'Secretary'}</Text>
                        <View style={styles.signLine} />
                        <Text style={styles.signName}>Vevi Mayo</Text>
                    </View>
                </View>

                <View style={{ alignItems: 'center', marginTop: 8 }}>
                    <View style={[styles.signCenterBox, { marginTop: 0 }]}>
                        <Text style={[styles.signTitle, { marginBottom: 4 }]}>{isId ? 'Mengetahui,' : 'Acknowledged by,'}</Text>
                        <Text style={[styles.signTitle, { marginBottom: 15 }]}>{isId ? 'Badan Pelaksana MUPEL Jemaat – Jemaat Bekasi' : 'Executive Board of GPIB MUPEL - Bekasi Jemaat'}</Text>
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
