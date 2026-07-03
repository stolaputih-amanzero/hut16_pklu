import {
    Document, Page, Text, View, StyleSheet, Image
} from '@react-pdf/renderer'
import { formatRupiah } from '@/lib/utils'

// Define the dummy verification URL base
const VERIFY_BASE_URL = 'https://pklu.amanloka.com/verify/DON-'

const styles = StyleSheet.create({
    page: {
        padding: 35,
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
        fontSize: 28,
        fontWeight: 700,
        color: '#FDFBF7',
        textAlign: 'center',
        letterSpacing: 1.5,
        marginBottom: 20,
        lineHeight: 1.3,
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
        fontSize: 9.0,
        lineHeight: 1.4,
        color: '#4A5568',
        marginBottom: 6,
        textAlign: 'justify',
    },
    bodyTextBold: {
        fontWeight: 700,
        color: '#022c22',
    },
    quoteContainer: {
        marginVertical: 8,
        padding: 10,
        backgroundColor: '#022c22',
        borderLeft: '4pt solid #D4AF37',
    },
    quoteText: {
        fontFamily: 'Times-Roman',
        fontSize: 12,
        color: '#D4AF37',
        textAlign: 'center',
        lineHeight: 1.4,
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
        marginBottom: 10,
    },
    edTableRow: {
        flexDirection: 'row',
        borderBottom: '0.5pt solid rgba(2, 44, 34, 0.1)',
        paddingVertical: 5,
    },
    edTableHeader: {
        flexDirection: 'row',
        borderBottom: '1.5pt solid #022c22',
        paddingVertical: 6,
    },
    edTableCellLabel: {
        width: '35%',
        fontFamily: 'Helvetica',
        fontSize: 8.5,
        fontWeight: 700,
        color: '#022c22',
        paddingRight: 10,
    },
    edTableCellValue: {
        width: '65%',
        fontFamily: 'Helvetica',
        fontSize: 8.5,
        color: '#4A5568',
        lineHeight: 1.3,
    },
    edTableHeadText: {
        fontFamily: 'Helvetica',
        fontSize: 8.0,
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
    origin?: string
}

export function ProposalDonaturPDF({ data, lang, logoUrl = "/logo_hut16_pklu.png", origin = "https://pklu.amanloka.com" }: Props) {
    const isId = lang === 'id'

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

    const verifyUrl = `${VERIFY_BASE_URL}${data.number || '0000-0000'}`
    const qrImageUrl = `https://quickchart.io/qr?text=${encodeURIComponent(verifyUrl)}&size=140&margin=1&dark=022c22`

    const commitmentMsg = isId
        ? `Halo Panitia HUT 16 PKLU GPIB, saya ingin memberikan komitmen dukungan untuk Proposal Donatur No: ${data.number}. Nama saya: ${data.name}.`
        : `Hello 16th PKLU GPIB Anniversary Committee, I would like to make a support commitment for Donor Proposal No: ${data.number}. My name is: ${data.name}.`
    const commitmentWaUrl = `https://api.whatsapp.com/send?phone=${CENTRAL_CONTACT_PHONE}&text=${encodeURIComponent(commitmentMsg)}`
    const commitmentWaQrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(commitmentWaUrl)}&size=140&margin=1&dark=022c22`

    const categoryMap: Record<string, string> = {
        sahabat_bakti: isId ? 'Sahabat Bakti' : 'Service Friend',
        sahabat_teladan: isId ? 'Sahabat Teladan' : 'Role Model Friend',
        sahabat_pelayanan: isId ? 'Sahabat Pelayanan' : 'Servant Friend',
        sahabat_berkat: isId ? 'Sahabat Berkat' : 'Blessing Friend',
        sahabat_kasih: isId ? 'Sahabat Kasih' : 'Love Friend',
        donatur_anonim: isId ? 'Donatur Anonim / Sahabat Sukacita' : 'Anonymous Donor',
    }
    const categoryLabel = categoryMap[data.donatur_category] || data.donatur_category

    const Header = () => (
        <View style={styles.headerWrapper} fixed>
            <View style={styles.headerLeft}>
                <View style={styles.headerLogos}>
                    <Image src={logoUrl} style={styles.headerLogo} />
                </View>
                <View>
                    <Text style={styles.headerTitle}>{isId ? 'PROPOSAL DONATUR' : 'DONOR PROPOSAL'}</Text>
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
                `HALAMAN ${pageNumber} DARI ${totalPages}`
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
                    <Text style={[styles.coverSubtitleTop, { marginBottom: 30, fontSize: 14, fontWeight: 'bold' }]}>
                        {isId ? 'PROPOSAL DONATUR' : 'DONOR PROPOSAL'}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 20, marginBottom: 25 }}>
                        <Image src={logoUrl} style={{ width: 100, height: 100 }} />
                    </View>
                    <Text style={{ fontFamily: 'Helvetica', fontSize: 13, color: '#D4AF37', letterSpacing: 2, marginBottom: 10, textAlign: 'center', textTransform: 'uppercase' }}>
                        {isId ? 'Ibadah dan Perayaan' : 'Worship and Celebration'}
                    </Text>
                    <Text style={styles.coverTitleMain}>
                        {isId ? 'HUT KE-16 PELKAT PKLU GPIB' : '16TH ANNIVERSARY OF PELKAT PKLU GPIB'}
                    </Text>
                    <View style={styles.goldDivider} />
                    <Text style={styles.coverTheme}>"Teruskan Baktimu!"</Text>
                    <Text style={styles.coverThemeSub}>
                        {isId ? 'Bertumbuh Dalam Keselamatan (1 Petrus 2: 2)\nLansia Teladan dalam Iman, Karya, dan Pelayanan' : 'Growing in Salvation (1 Peter 2:2)\nElderly Role Models in Faith, Work, and Service'}
                    </Text>

                    <View style={[styles.coverDetails, { marginBottom: 15 }]}>
                        <Text style={styles.coverDetailText}>{isId ? 'Senin, 12 Oktober 2026' : 'Monday, October 12, 2026'}</Text>
                        <Text style={styles.coverDetailText}>Bekasi Convention Center</Text>
                        <Text style={styles.coverDetailText}>Hotel Santika Mega Mall Bekasi</Text>
                        <Text style={styles.coverDetailText}>Kota Bekasi, Jawa Barat</Text>
                    </View>

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
                        {data.company_name && (
                            <Text style={{ fontFamily: 'Helvetica', fontSize: 9, color: '#D4AF37', marginTop: 4, fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center' }}>
                                {data.company_name}
                            </Text>
                        )}
                        {data.display_name && data.display_name !== data.name && data.display_name !== data.company_name && (
                            <Text style={{ fontFamily: 'Helvetica', fontSize: 8, color: '#A0AEC0', marginTop: 3, textTransform: 'uppercase', textAlign: 'center' }}>
                                {data.display_name}
                            </Text>
                        )}
                    </View>

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

            <Page size="A4" style={styles.page} wrap>
                <Header />
                <Footer />

                {/* I. PENDAHULUAN */}
                <View style={{ marginBottom: 20 }}>
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
                    <Text style={styles.bodyText}>
                        {isId ? 'Melalui proposal ini, Panitia HUT ke-16 Pelkat PKLU GPIB mengajak Bapak/Ibu/Saudara/i, keluarga, dan sahabat pelayanan untuk mengambil bagian dalam mendukung kegiatan ini. Setiap dukungan yang diberikan merupakan wujud kasih dan kepedulian bagi pelayanan kaum lanjut usia, serta menjadi bagian dari sukacita bersama dalam memperkuat semangat lansia teladan yang terus berkarya dan melayani.' : 'Through this proposal, the 16th Anniversary Committee invites you to support this activity. Every support is a manifestation of love for the elderly service and a part of our joy in strengthening their spirit.'}
                    </Text>
                    <Text style={styles.bodyText}>
                        {isId ? 'Kiranya dukungan dan doa Bapak/Ibu/Saudara/i menjadi berkat bagi terselenggaranya kegiatan ini dan bagi pelayanan Pelkat PKLU GPIB ke depan.' : 'May your support and prayers be a blessing for this event and the future service of PKLU GPIB.'}
                    </Text>
                    <Text style={styles.bodyText}>
                        {isId ? 'Proposal ini secara khusus ditujukan bagi calon donatur pribadi, keluarga, komunitas kecil, dan sahabat pelayanan. Dukungan yang diberikan bukan dimaksudkan sebagai sponsorship iklan atau promosi komersial, melainkan sebagai bentuk kasih, ucapan syukur, dan partisipasi pelayanan bagi kaum lanjut usia.' : 'This proposal is specifically intended for prospective personal donors, families, and service friends. The support is not intended as commercial promotion, but as an expression of love and gratitude.'}
                    </Text>

                    <View style={{ marginTop: 20 }} />
                    <View style={[styles.quoteContainer, { backgroundColor: '#FDFBF7', borderLeft: '4pt solid #022c22' }]}>
                        <Text style={[styles.sectionTitle, { fontSize: 14, marginBottom: 5 }]}>{isId ? 'Undangan Kasih' : 'Invitation of Love'}</Text>
                        <Text style={styles.bodyText}>
                            {isId ? 'Setiap dukungan, baik besar maupun kecil, menjadi bagian dari pelayanan yang membangun persekutuan, menguatkan lansia, dan menghadirkan sukacita bersama dalam HUT ke-16 Pelkat PKLU GPIB.' : 'Every support, big or small, becomes part of a service that builds fellowship, strengthens the elderly, and brings collective joy in the 16th Anniversary of PKLU GPIB.'}
                        </Text>
                    </View>
                </View>

                {/* II. MAKSUD DAN TUJUAN */}
                <View break style={{ marginBottom: 15, marginTop: 0 }}>
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
                </View>

                {/* III. RINGKASAN & WAKTU KEGIATAN GROUPED WITH WRAP=FALSE */}
                <View wrap={false} style={{ marginTop: 10 }}>
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
                            <Text style={styles.edTableCellValue}>Teruskan Baktimu!</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={styles.edTableCellLabel}>{isId ? 'TEMA & SUBTEMA' : 'THEME & SUBTHEME'}</Text>
                            <Text style={styles.edTableCellValue}>
                                Bertumbuh dalam Keselamatan (1 Petrus 2: 2){'\n'}
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
                        <View style={[styles.edTableRow, { borderBottom: 'none' }]}>
                            <Text style={styles.edTableCellLabel}>{isId ? 'TARGET PESERTA' : 'TARGET ATTENDEES'}</Text>
                            <Text style={styles.edTableCellValue}>{isId ? '±600 orang dari pengurus dan anggota Pelkat PKLU GPIB di Indonesia' : '±600 Delegates from PKLU GPIB across Indonesia'}</Text>
                        </View>
                    </View>

                    <Text style={[styles.sectionTitle, { fontSize: 12, marginTop: 10, marginBottom: 10 }]}>{isId ? 'Waktu / Periode Kegiatan' : 'Event Schedule'}</Text>

                    <View style={styles.editorialTable}>
                        <View style={styles.edTableHeader}>
                            <Text style={[styles.edTableHeadText, { width: '25%' }]}>{isId ? 'WAKTU/PERIODE' : 'TIME/PERIOD'}</Text>
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
                            <Text style={[styles.edTableCellValue, { width: '45%', fontSize: 8 }]}>Bijak Mengelola Berkat di Masa Lanjut Usia.</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellLabel, { width: '25%' }]}>12 Okt 2026</Text>
                            <Text style={[styles.edTableCellValue, { width: '30%', fontWeight: 700 }]}>Ibadah Syukur</Text>
                            <Text style={[styles.edTableCellValue, { width: '45%', fontSize: 8 }]}>Pusat perayaan dan ungkapan syukur kepada Tuhan.</Text>
                        </View>
                        <View style={[styles.edTableRow, { borderBottom: 'none' }]}>
                            <Text style={[styles.edTableCellLabel, { width: '25%' }]}>12 Okt 2026</Text>
                            <Text style={[styles.edTableCellValue, { width: '30%', fontWeight: 700 }]}>Seremonial & Seni</Text>
                            <Text style={[styles.edTableCellValue, { width: '45%', fontSize: 8 }]}>Seremonial bersama gereja & pemerintah, peniupan lilin, seni lansia.</Text>
                        </View>
                    </View>
                </View>

                {/* IV. ANGGARAN KEGIATAN - FORCE FULL PAGE WITH BREAK */}
                <View break wrap={false}>
                    <Text style={styles.sectionTitle}>{isId ? 'IV. Anggaran Kegiatan' : 'IV. Budget Plan'}</Text>
                    <Text style={styles.bodyText}>{isId ? 'Adapun anggaran yang dibutuhkan dalam pelaksanaan kegiatan Perayaan HUT Pelkat PKLU yang ke-16 adalah sebagai berikut:' : 'The budget required for the implementation of the 16th PKLU Anniversary is as follows:'}</Text>

                    <Text style={[styles.sectionTitle, { fontSize: 11, textAlign: 'center', marginTop: 10, marginBottom: 5 }]}>{isId ? 'RENCANA ANGGARAN PENERIMAAN DAN PENGELUARAN\nPANITIA HUT KE 16 PELKAT PKLU GPIB 2026' : 'BUDGET PLAN FOR REVENUE AND EXPENDITURE\n16TH PKLU GPIB ANNIVERSARY COMMITTEE 2026'}</Text>

                    <Text style={[styles.sectionTitle, { fontSize: 10, marginBottom: 5, color: '#D4AF37' }]}>{isId ? 'PENERIMAAN' : 'REVENUE'}</Text>
                    <View style={styles.editorialTable}>
                        <View style={styles.edTableHeader}>
                            <Text style={[styles.edTableHeadText, { width: '10%', textAlign: 'center' }]}>NO</Text>
                            <Text style={[styles.edTableHeadText, { width: '60%' }]}>{isId ? 'PENERIMAAN' : 'REVENUE'}</Text>
                            <Text style={[styles.edTableHeadText, { width: '30%', textAlign: 'right' }]}>{isId ? 'JUMLAH (Rp)' : 'AMOUNT (Rp)'}</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellValue, { width: '10%', textAlign: 'center' }]}>1</Text>
                            <Text style={[styles.edTableCellValue, { width: '60%' }]}>GPIB BP Mupel</Text>
                            <Text style={[styles.edTableCellValue, { width: '30%', textAlign: 'right', fontFamily: 'Times-Roman', fontWeight: 700 }]}>5.000.000</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellValue, { width: '10%', textAlign: 'center' }]}>2</Text>
                            <Text style={[styles.edTableCellValue, { width: '60%' }]}>Kontribusi Panitia HUT PKLU ke 16</Text>
                            <Text style={[styles.edTableCellValue, { width: '30%', textAlign: 'right', fontFamily: 'Times-Roman', fontWeight: 700 }]}>40.285.000</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellValue, { width: '10%', textAlign: 'center' }]}>3</Text>
                            <Text style={[styles.edTableCellValue, { width: '60%' }]}>Donatur Personal</Text>
                            <Text style={[styles.edTableCellValue, { width: '30%', textAlign: 'right', fontFamily: 'Times-Roman', fontWeight: 700 }]}>50.000.000</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellValue, { width: '10%', textAlign: 'center' }]}>4</Text>
                            <Text style={[styles.edTableCellValue, { width: '60%' }]}>Kontribusi Peserta HUT PKLU ke 16</Text>
                            <Text style={[styles.edTableCellValue, { width: '30%', textAlign: 'right', fontFamily: 'Times-Roman', fontWeight: 700 }]}>200.000.000</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellValue, { width: '10%', textAlign: 'center' }]}>5</Text>
                            <Text style={[styles.edTableCellValue, { width: '60%' }]}>Usaha Dana Kreatif (Kaos/Bazar/Proposal Sponsor)</Text>
                            <Text style={[styles.edTableCellValue, { width: '30%', textAlign: 'right', fontFamily: 'Times-Roman', fontWeight: 700 }]}>135.000.000</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellValue, { width: '10%', textAlign: 'center' }]}>6</Text>
                            <Text style={[styles.edTableCellValue, { width: '60%' }]}>Proposal Donatur Ke 15 Jemaat Mupel Bekasi</Text>
                            <Text style={[styles.edTableCellValue, { width: '30%', textAlign: 'right', fontFamily: 'Times-Roman', fontWeight: 700 }]}>107.500.000</Text>
                        </View>
                        <View style={[styles.edTableRow, { borderBottom: 'none', backgroundColor: '#022c22' }]}>
                            <Text style={[styles.edTableCellLabel, { width: '70%', color: '#D4AF37', textAlign: 'center' }]}>{isId ? 'TOTAL PENERIMAAN' : 'TOTAL REVENUE'}</Text>
                            <Text style={[styles.edTableCellValue, { width: '30%', textAlign: 'right', fontFamily: 'Times-Roman', fontWeight: 700, color: '#FDFBF7' }]}>537.785.000</Text>
                        </View>
                    </View>

                    <Text style={[styles.sectionTitle, { fontSize: 10, marginBottom: 5, color: '#D4AF37' }]}>{isId ? 'PENGELUARAN' : 'EXPENDITURE'}</Text>
                    <View style={styles.editorialTable}>
                        <View style={styles.edTableHeader}>
                            <Text style={[styles.edTableHeadText, { width: '10%', textAlign: 'center' }]}>NO</Text>
                            <Text style={[styles.edTableHeadText, { width: '60%' }]}>{isId ? 'PENGELUARAN' : 'EXPENDITURE'}</Text>
                            <Text style={[styles.edTableHeadText, { width: '30%', textAlign: 'right' }]}>{isId ? 'JUMLAH (Rp)' : 'AMOUNT (Rp)'}</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellValue, { width: '10%', textAlign: 'center' }]}>1</Text>
                            <Text style={[styles.edTableCellValue, { width: '60%' }]}>SEKRETARIAT</Text>
                            <Text style={[styles.edTableCellValue, { width: '30%', textAlign: 'right', fontFamily: 'Times-Roman', fontWeight: 700 }]}>31.440.000</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellValue, { width: '10%', textAlign: 'center' }]}>2</Text>
                            <Text style={[styles.edTableCellValue, { width: '60%' }]}>SEKSI ACARA/IBADAH/PENERIMA TAMU</Text>
                            <Text style={[styles.edTableCellValue, { width: '30%', textAlign: 'right', fontFamily: 'Times-Roman', fontWeight: 700 }]}>125.280.000</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellValue, { width: '10%', textAlign: 'center' }]}>3</Text>
                            <Text style={[styles.edTableCellValue, { width: '60%' }]}>SEKSI KONSUMSI</Text>
                            <Text style={[styles.edTableCellValue, { width: '30%', textAlign: 'right', fontFamily: 'Times-Roman', fontWeight: 700 }]}>247.100.000</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellValue, { width: '10%', textAlign: 'center' }]}>4</Text>
                            <Text style={[styles.edTableCellValue, { width: '60%' }]}>SEKSI DEKORASI/PERLENGKAPAN/TRANSPORTASI</Text>
                            <Text style={[styles.edTableCellValue, { width: '30%', textAlign: 'right', fontFamily: 'Times-Roman', fontWeight: 700 }]}>51.250.000</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellValue, { width: '10%', textAlign: 'center' }]}>5</Text>
                            <Text style={[styles.edTableCellValue, { width: '60%' }]}>SEKSI DOKUMENTASI</Text>
                            <Text style={[styles.edTableCellValue, { width: '30%', textAlign: 'right', fontFamily: 'Times-Roman', fontWeight: 700 }]}>19.150.000</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellValue, { width: '10%', textAlign: 'center' }]}>6</Text>
                            <Text style={[styles.edTableCellValue, { width: '60%' }]}>SEKSI HUMAS/PUBLIKASI</Text>
                            <Text style={[styles.edTableCellValue, { width: '30%', textAlign: 'right', fontFamily: 'Times-Roman', fontWeight: 700 }]}>1.440.000</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellValue, { width: '10%', textAlign: 'center' }]}>7</Text>
                            <Text style={[styles.edTableCellValue, { width: '60%' }]}>SEKSI DANA</Text>
                            <Text style={[styles.edTableCellValue, { width: '30%', textAlign: 'right', fontFamily: 'Times-Roman', fontWeight: 700 }]}>56.000.000</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellValue, { width: '10%', textAlign: 'center' }]}>8</Text>
                            <Text style={[styles.edTableCellValue, { width: '60%' }]}>SEKSI KESEHATAN</Text>
                            <Text style={[styles.edTableCellValue, { width: '30%', textAlign: 'right', fontFamily: 'Times-Roman', fontWeight: 700 }]}>4.725.000</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellValue, { width: '10%', textAlign: 'center' }]}>9</Text>
                            <Text style={[styles.edTableCellValue, { width: '60%' }]}>SEKSI KEAMANAN</Text>
                            <Text style={[styles.edTableCellValue, { width: '30%', textAlign: 'right', fontFamily: 'Times-Roman', fontWeight: 700 }]}>1.400.000</Text>
                        </View>
                        <View style={[styles.edTableRow, { borderBottom: 'none', backgroundColor: '#022c22' }]}>
                            <Text style={[styles.edTableCellLabel, { width: '70%', color: '#D4AF37', textAlign: 'center' }]}>{isId ? 'TOTAL PENGELUARAN' : 'TOTAL EXPENDITURE'}</Text>
                            <Text style={[styles.edTableCellValue, { width: '30%', textAlign: 'right', fontFamily: 'Times-Roman', fontWeight: 700, color: '#FDFBF7' }]}>537.785.000</Text>
                        </View>
                    </View>
                </View>

                {/* V */}
                <View wrap={false}>
                    <Text style={styles.sectionTitle}>{isId ? 'V. Bentuk Dukungan Donatur' : 'V. Donor Support Forms'}</Text>
                    <Text style={styles.bodyText}>{isId ? 'Panitia membuka kesempatan dukungan dari pribadi, keluarga, persekutuan kecil, dan sahabat pelayanan dalam bentuk dana, hadiah lomba, konsumsi, souvenir, perlengkapan acara, dukungan bagi peserta lansia, atau bentuk dukungan lain sesuai kerinduan dan kemampuan donatur.' : 'The Committee opens support opportunities from individuals, families, and service friends in various forms according to their desire and capability.'}</Text>

                    <View style={styles.editorialTable}>
                        <View style={styles.edTableHeader}>
                            <Text style={[styles.edTableHeadText, { width: '25%' }]}>{isId ? 'KATEGORI' : 'CATEGORY'}</Text>
                            <Text style={[styles.edTableHeadText, { width: '25%' }]}>{isId ? 'NILAI DUKUNGAN' : 'SUPPORT VALUE'}</Text>
                            <Text style={[styles.edTableHeadText, { width: '50%' }]}>{isId ? 'APRESIASI HANGAT' : 'WARM APPRECIATION'}</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellLabel, { width: '25%' }]}>Sahabat Bakti</Text>
                            <Text style={[styles.edTableCellValue, { width: '25%', fontWeight: 700 }]}>Rp500Rb - Rp999Rb</Text>
                            <Text style={[styles.edTableCellValue, { width: '50%', fontSize: 8 }]}>Ucapan terima kasih digital.</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellLabel, { width: '25%' }]}>Sahabat Teladan</Text>
                            <Text style={[styles.edTableCellValue, { width: '25%', fontWeight: 700 }]}>Rp1Jt - Rp2.49Jt</Text>
                            <Text style={[styles.edTableCellValue, { width: '50%', fontSize: 8 }]}>Nama dicantumkan dalam buku acara elektronik.</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellLabel, { width: '25%' }]}>Sahabat Pelayanan</Text>
                            <Text style={[styles.edTableCellValue, { width: '25%', fontWeight: 700 }]}>Rp2.5Jt - Rp4.99Jt</Text>
                            <Text style={[styles.edTableCellValue, { width: '50%', fontSize: 8 }]}>Nama dalam buku acara & ucapan terima kasih panitia.</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellLabel, { width: '25%' }]}>Sahabat Berkat</Text>
                            <Text style={[styles.edTableCellValue, { width: '25%', fontWeight: 700 }]}>Rp5Jt - Rp9.99Jt</Text>
                            <Text style={[styles.edTableCellValue, { width: '50%', fontSize: 8 }]}>Nama dicantumkan lebih menonjol di halaman apresiasi.</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellLabel, { width: '25%' }]}>Sahabat Kasih</Text>
                            <Text style={[styles.edTableCellValue, { width: '25%', fontWeight: 700 }]}>Rp10.000.000 +</Text>
                            <Text style={[styles.edTableCellValue, { width: '50%', fontSize: 8 }]}>Halaman khusus ucapan syukur dan apresiasi.</Text>
                        </View>
                        <View style={[styles.edTableRow, { borderBottom: 'none' }]}>
                            <Text style={[styles.edTableCellLabel, { width: '25%' }]}>Anonim / Sukacita</Text>
                            <Text style={[styles.edTableCellValue, { width: '25%', fontWeight: 700 }]}>Sukarela</Text>
                            <Text style={[styles.edTableCellValue, { width: '50%', fontSize: 8 }]}>Dicatat sbg: NN/ Keluarga yang Mengasihi Pelayanan Lansia.</Text>
                        </View>
                    </View>
                </View>

                {/* VI */}
                <View wrap={false}>
                    <Text style={styles.sectionTitle}>{isId ? 'VI. Ide Apresiasi yang Hangat untuk Donatur' : 'VI. Warm Appreciation Ideas'}</Text>
                    <Text style={styles.bodyText}>{isId ? 'Karena dukungan ini bersifat personal dan kekeluargaan, bentuk apresiasi tidak diarahkan sebagai iklan komersial, melainkan sebagai ucapan syukur, penghargaan, dan tanda kasih dari Panitia.' : 'Because this support is personal, appreciation is not directed as commercial advertising, but as gratitude from the Committee.'}</Text>

                    <View style={styles.editorialTable}>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellLabel, { width: '30%' }]}>{isId ? 'Buku Acara Elektronik' : 'E-Booklet'}</Text>
                            <Text style={[styles.edTableCellValue, { width: '70%', fontSize: 9 }]}>{isId ? 'Nama pribadi atau keluarga dicantumkan pada halaman “Ucapan Syukur dan Terima Kasih kepada Sahabat Pelayanan”.' : 'Personal/family name listed on the appreciation page.'}</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellLabel, { width: '30%' }]}>{isId ? 'Pohon Syukur Digital' : 'Digital Gratitude Tree'}</Text>
                            <Text style={[styles.edTableCellValue, { width: '70%', fontSize: 9 }]}>{isId ? 'Nama keluarga donatur ditampilkan sebagai daun-daun pada “Pohon Syukur HUT ke-16” dalam buku acara elektronik.' : 'Donor family names displayed as leaves on the 16th Anniversary Gratitude Tree.'}</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellLabel, { width: '30%' }]}>{isId ? 'Halaman Doa dan Ucapan Keluarga' : 'Family Prayer Page'}</Text>
                            <Text style={[styles.edTableCellValue, { width: '70%', fontSize: 9 }]}>{isId ? 'Donatur dapat menuliskan ucapan singkat maksimal 25-40 kata sebagai doa dan dukungan.' : 'Donors can write short prayers/messages up to 25-40 words.'}</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellLabel, { width: '30%' }]}>{isId ? 'Sertifikat Digital' : 'Digital Certificate'}</Text>
                            <Text style={[styles.edTableCellValue, { width: '70%', fontSize: 9 }]}>{isId ? 'Panitia memberikan sertifikat apresiasi digital “Sahabat Pelayanan” setelah kegiatan.' : 'Committee provides a digital certificate of appreciation.'}</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellLabel, { width: '30%' }]}>{isId ? 'Kartu Terima Kasih Personal' : 'Personal Thank You Card'}</Text>
                            <Text style={[styles.edTableCellValue, { width: '70%', fontSize: 9 }]}>{isId ? 'Donatur menerima kartu ucapan digital melalui WhatsApp disertai foto kegiatan.' : 'Donors receive a digital thank you card via WhatsApp.'}</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellLabel, { width: '30%' }]}>{isId ? 'Slideshow Ucapan Syukur' : 'Gratitude Slideshow'}</Text>
                            <Text style={[styles.edTableCellValue, { width: '70%', fontSize: 9 }]}>{isId ? 'Nama donatur/ keluarga dapat ditayangkan sebelum acara atau saat jeda, tanpa mencantumkan nominal.' : 'Names can be displayed during breaks without nominals.'}</Text>
                        </View>
                        <View style={[styles.edTableRow, { borderBottom: 'none' }]}>
                            <Text style={[styles.edTableCellLabel, { width: '30%' }]}>{isId ? 'Paket Donasi Spesifik' : 'Specific Packages'}</Text>
                            <Text style={[styles.edTableCellValue, { width: '70%', fontSize: 9 }]}>{isId ? 'Donatur dapat memilih mendukung konsumsi lansia, hadiah lomba, souvenir peserta, dokumentasi, atau webinar.' : 'Donors can support specific categories.'}</Text>
                        </View>
                    </View>
                </View>

                {/* VII */}
                <View wrap={false} break>
                    <Text style={styles.sectionTitle}>{isId ? 'VII. Paket Donasi Spesifik' : 'VII. Specific Donation Packages'}</Text>
                    <Text style={styles.bodyText}>{isId ? 'Selain berdasarkan kategori nominal, calon donatur juga dapat mendukung kebutuhan tertentu agar dukungan terasa lebih personal dan konkret.' : 'Donors can also support specific needs to make the support more concrete.'}</Text>

                    <View style={styles.editorialTable}>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellLabel, { width: '30%' }]}>{isId ? 'Dukung Konsumsi Lansia' : 'Support Elderly Meals'}</Text>
                            <Text style={[styles.edTableCellValue, { width: '70%', fontSize: 9 }]}>{isId ? 'Membantu penyediaan makanan, snack, dan air mineral peserta.' : 'Provide meals, snacks, and mineral water for participants.'}</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellLabel, { width: '30%' }]}>{isId ? 'Dukung Hadiah Lomba' : 'Support Competition Prizes'}</Text>
                            <Text style={[styles.edTableCellValue, { width: '70%', fontSize: 9 }]}>{isId ? 'Mendukung apresiasi pemenang lomba puisi, artikel, dan video singkat.' : 'Support prizes for poetry, article, and short video competitions.'}</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellLabel, { width: '30%' }]}>{isId ? 'Dukung Souvenir Peserta' : 'Support Souvenirs'}</Text>
                            <Text style={[styles.edTableCellValue, { width: '70%', fontSize: 9 }]}>{isId ? 'Membantu pengadaan tanda kasih atau merchandise sederhana untuk peserta.' : 'Provide tokens of appreciation or merchandise.'}</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellLabel, { width: '30%' }]}>{isId ? 'Dukung Dokumentasi' : 'Support Documentation'}</Text>
                            <Text style={[styles.edTableCellValue, { width: '70%', fontSize: 9 }]}>{isId ? 'Mendukung foto, video, dan dokumentasi kegiatan sebagai kenangan pelayanan.' : 'Support event documentation.'}</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellLabel, { width: '30%' }]}>{isId ? 'Dukung Webinar' : 'Support Webinar'}</Text>
                            <Text style={[styles.edTableCellValue, { width: '70%', fontSize: 9 }]}>{isId ? 'Mendukung teknis webinar dan narasumber “Lansia Teladan dari Kacamata Keuangan”.' : 'Support webinar technicalities and speakers.'}</Text>
                        </View>
                        <View style={[styles.edTableRow, { borderBottom: 'none' }]}>
                            <Text style={[styles.edTableCellLabel, { width: '30%' }]}>{isId ? 'Dukung Peserta Lansia' : 'Support Elderly Participants'}</Text>
                            <Text style={[styles.edTableCellValue, { width: '70%', fontSize: 9 }]}>{isId ? 'Membantu kebutuhan teknis dan kenyamanan peserta lanjut usia selama kegiatan.' : 'Help with technical needs and comfort of elderly participants.'}</Text>
                        </View>
                    </View>
                </View>

                {/* VIII, IX, X, XI */}
                <View wrap={false}>
                    <Text style={styles.sectionTitle}>{isId ? 'VIII. Prinsip Pencantuman Nama Donatur' : 'VIII. Name Listing Principles'}</Text>
                    <View style={styles.listItem}><Text style={styles.listBullet}>1.</Text><Text style={styles.listText}>{isId ? 'Tidak mencantumkan nominal dukungan pada media publikasi eksternal.' : 'No nominals on external publication.'}</Text></View>
                    <View style={styles.listItem}><Text style={styles.listBullet}>2.</Text><Text style={styles.listText}>{isId ? 'Tidak menggunakan format iklan komersial atau promosi perusahaan.' : 'Not a commercial promotion.'}</Text></View>
                    <View style={styles.listItem}><Text style={styles.listBullet}>3.</Text><Text style={styles.listText}>{isId ? 'Mengutamakan nama pribadi, keluarga, persekutuan, atau komunitas kecil.' : 'Prioritizing personal, family, fellowship, or small community names.'}</Text></View>
                    <View style={styles.listItem}><Text style={styles.listBullet}>4.</Text><Text style={styles.listText}>{isId ? 'Menghormati donatur yang ingin memberikan dukungan secara anonim.' : 'Respecting anonymous donors.'}</Text></View>
                    <View style={styles.listItem}><Text style={styles.listBullet}>5.</Text><Text style={styles.listText}>{isId ? 'Menjaga suasana syukur, kasih, dan kekeluargaan.' : 'Maintaining a family atmosphere.'}</Text></View>
                    <View style={styles.listItem}><Text style={styles.listBullet}>6.</Text><Text style={styles.listText}>{isId ? 'Laporan penerimaan dan penggunaan dana dikelola oleh Panitia sesuai kebutuhan internal kepanitiaan.' : 'Fund reports are managed internally by the Committee.'}</Text></View>

                    <View style={{
                        border: '0.5pt solid #022c22',
                        borderRadius: 4,
                        padding: 10,
                        marginTop: 12,
                        backgroundColor: 'rgba(2, 44, 34, 0.02)'
                    }}>
                        <Text style={{ fontFamily: 'Helvetica', fontSize: 8.0, fontWeight: 'bold', color: '#022c22', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>
                            {isId ? 'Contoh Penulisan Nama:' : 'Example Name Listings:'}
                        </Text>
                        <View style={[styles.listItem, { marginBottom: 4 }]}><Text style={styles.listBullet}>•</Text><Text style={[styles.listText, { fontSize: 8.5 }]}>Keluarga Bapak/Ibu........................................</Text></View>
                        <View style={[styles.listItem, { marginBottom: 4 }]}><Text style={styles.listBullet}>•</Text><Text style={[styles.listText, { fontSize: 8.5 }]}>Bapak/Ibu........................................................</Text></View>
                        <View style={[styles.listItem, { marginBottom: 4 }]}><Text style={styles.listBullet}>•</Text><Text style={[styles.listText, { fontSize: 8.5 }]}>Keluarga.............................................................</Text></View>
                        <View style={[styles.listItem, { marginBottom: 0 }]}><Text style={styles.listBullet}>•</Text><Text style={[styles.listText, { fontSize: 8.5 }]}>NN/ Keluarga yang Mengasihi Pelayanan Lansia</Text></View>
                    </View>
                </View>

                <View wrap={false} style={{ marginTop: 20 }}>
                    <Text style={styles.sectionTitle}>{isId ? 'IX. Contoh Halaman Buku Acara Elektronik' : 'IX. E-Booklet Page Example'}</Text>
                    <Text style={styles.bodyText}>{isId ? 'Halaman apresiasi dalam buku acara elektronik dapat dibuat dengan nuansa hangat, sederhana, dan tidak komersial. Berikut contoh formatnya:' : 'Appreciation pages will be warm. Here is an example:'}</Text>

                    <View style={[styles.quoteContainer, { backgroundColor: '#FDFBF7', borderLeft: '4pt solid #022c22' }]}>
                        <Text style={[styles.bodyText, { fontStyle: 'italic', marginBottom: 15 }]}>{isId ? 'Dengan penuh syukur, Panitia HUT ke-16 Pelkat PKLU GPIB mengucapkan terima kasih kepada:' : 'With full gratitude, the 16th Anniversary Committee thanks:'}</Text>

                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                            <View style={{ width: '48%', border: '0.5pt solid rgba(2, 44, 34, 0.15)', padding: 8, borderRadius: 4, backgroundColor: 'rgba(2, 44, 34, 0.01)', marginBottom: 8 }}>
                                <Text style={{ fontFamily: 'Helvetica', fontSize: 8.0, fontWeight: 'bold', color: '#D4AF37', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>Sahabat Kasih</Text>
                                <Text style={[styles.bodyText, { fontSize: 8.0, marginBottom: 2 }]}>1. Keluarga........................................</Text>
                                <Text style={[styles.bodyText, { fontSize: 8.0, marginBottom: 0 }]}>2. Bapak/Ibu.......................................</Text>
                            </View>

                            <View style={{ width: '48%', border: '0.5pt solid rgba(2, 44, 34, 0.15)', padding: 8, borderRadius: 4, backgroundColor: 'rgba(2, 44, 34, 0.01)', marginBottom: 8 }}>
                                <Text style={{ fontFamily: 'Helvetica', fontSize: 8.0, fontWeight: 'bold', color: '#D4AF37', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>Sahabat Berkat</Text>
                                <Text style={[styles.bodyText, { fontSize: 8.0, marginBottom: 2 }]}>1. Keluarga........................................</Text>
                                <Text style={[styles.bodyText, { fontSize: 8.0, marginBottom: 0 }]}>2. Bapak/Ibu.......................................</Text>
                            </View>

                            <View style={{ width: '48%', border: '0.5pt solid rgba(2, 44, 34, 0.15)', padding: 8, borderRadius: 4, backgroundColor: 'rgba(2, 44, 34, 0.01)' }}>
                                <Text style={{ fontFamily: 'Helvetica', fontSize: 8.0, fontWeight: 'bold', color: '#D4AF37', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>Sahabat Pelayanan</Text>
                                <Text style={[styles.bodyText, { fontSize: 8.0, marginBottom: 2 }]}>1. Keluarga........................................</Text>
                                <Text style={[styles.bodyText, { fontSize: 8.0, marginBottom: 0 }]}>2. Bapak/Ibu.......................................</Text>
                            </View>

                            <View style={{ width: '48%', border: '0.5pt solid rgba(2, 44, 34, 0.15)', padding: 8, borderRadius: 4, backgroundColor: 'rgba(2, 44, 34, 0.01)' }}>
                                <Text style={{ fontFamily: 'Helvetica', fontSize: 8.0, fontWeight: 'bold', color: '#D4AF37', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>Donatur Anonim</Text>
                                <Text style={[styles.bodyText, { fontSize: 8.0, marginBottom: 0, lineHeight: 1.2 }]}>Keluarga yang Mengasihi Pelayanan Lansia</Text>
                            </View>
                        </View>

                        <Text style={[styles.bodyText, { fontStyle: 'italic', marginTop: 15, marginBottom: 0 }]}>{isId ? 'Kiranya Tuhan memberkati setiap dukungan, doa, dan kasih yang telah diberikan bagi pelayanan Pelkat PKLU GPIB.' : 'May God bless every support, prayer, and love given.'}</Text>
                    </View>
                </View>

                <View wrap={false} style={{ marginTop: 20 }}>
                    <Text style={styles.sectionTitle}>{isId ? 'X. Contoh Ucapan Singkat Donatur' : 'X. Short Message Examples'}</Text>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                        <View style={{ width: '48%', borderLeft: '3pt solid #D4AF37', backgroundColor: '#FDFBF7', padding: 8, borderRadius: 2, marginBottom: 8 }}>
                            <Text style={{ fontFamily: 'Times-Roman', fontSize: 8.5, fontStyle: 'italic', color: '#4A5568', lineHeight: 1.35 }}>
                                "{isId ? 'Selamat HUT ke-16 Pelkat PKLU GPIB. Teruskan baktimu dan jadilah lansia teladan dalam iman, karya, dan pelayanan.' : 'Happy 16th Anniversary PKLU GPIB. Continue your service.'}"
                            </Text>
                        </View>
                        <View style={{ width: '48%', borderLeft: '3pt solid #D4AF37', backgroundColor: '#FDFBF7', padding: 8, borderRadius: 2, marginBottom: 8 }}>
                            <Text style={{ fontFamily: 'Times-Roman', fontSize: 8.5, fontStyle: 'italic', color: '#4A5568', lineHeight: 1.35 }}>
                                "{isId ? 'Kiranya Pelkat PKLU GPIB terus menjadi berkat bagi gereja, keluarga, dan masyarakat.' : 'May PKLU GPIB continue to be a blessing.'}"
                            </Text>
                        </View>
                        <View style={{ width: '48%', borderLeft: '3pt solid #D4AF37', backgroundColor: '#FDFBF7', padding: 8, borderRadius: 2, marginBottom: 8 }}>
                            <Text style={{ fontFamily: 'Times-Roman', fontSize: 8.5, fontStyle: 'italic', color: '#4A5568', lineHeight: 1.35 }}>
                                "{isId ? 'Bersyukur dapat mendukung pelayanan kaum lanjut usia. Tuhan memberkati seluruh rangkaian HUT ke-16 Pelkat PKLU GPIB.' : 'Grateful to support the elderly service.'}"
                            </Text>
                        </View>
                        <View style={{ width: '48%', borderLeft: '3pt solid #D4AF37', backgroundColor: '#FDFBF7', padding: 8, borderRadius: 2, marginBottom: 8 }}>
                            <Text style={{ fontFamily: 'Times-Roman', fontSize: 8.5, fontStyle: 'italic', color: '#4A5568', lineHeight: 1.35 }}>
                                "{isId ? 'Usia boleh bertambah, tetapi semangat pelayanan tetap menyala. Selamat melayani dan terus menjadi teladan.' : 'Age increases, but the spirit of service remains.'}"
                            </Text>
                        </View>
                    </View>
                    <View style={{ width: '100%', borderLeft: '3pt solid #D4AF37', backgroundColor: '#FDFBF7', padding: 8, borderRadius: 2, marginTop: 2 }}>
                        <Text style={{ fontFamily: 'Times-Roman', fontSize: 8.5, fontStyle: 'italic', color: '#4A5568', lineHeight: 1.35, textAlign: 'center' }}>
                            "{isId ? 'Dengan penuh kasih, kami mendukung pelayanan Pelkat PKLU GPIB. Teruskan baktimu!' : 'With full love, we support PKLU GPIB. Continue your service!'}"
                        </Text>
                    </View>
                </View>

                {/* XI. Penggunaan Dana Donatur - FORCED BREAK TO PAGE 9 */}
                <View wrap={false} break style={{ marginTop: 0 }}>
                    <Text style={styles.sectionTitle}>{isId ? 'XI. Penggunaan Dana Donatur' : 'XI. Use of Donor Funds'}</Text>
                    <Text style={styles.bodyText}>{isId ? 'Dukungan donatur akan digunakan untuk membantu kebutuhan kegiatan, antara lain:' : 'Donor support will be used to help with activity needs, including:'}</Text>
                    <View style={styles.listItem}><Text style={styles.listBullet}>-</Text><Text style={styles.listText}>{isId ? 'Pelaksanaan ibadah dan perayaan HUT ke-16.' : 'Implementation of the 16th Anniversary worship.'}</Text></View>
                    <View style={styles.listItem}><Text style={styles.listBullet}>-</Text><Text style={styles.listText}>{isId ? 'Konsumsi peserta dan dukungan kenyamanan peserta lansia.' : 'Participant meals and comfort support for the elderly.'}</Text></View>
                    <View style={styles.listItem}><Text style={styles.listBullet}>-</Text><Text style={styles.listText}>{isId ? 'Perlengkapan kegiatan, dekorasi, dan kebutuhan teknis acara.' : 'Activity equipment, decoration, and technical needs.'}</Text></View>
                    <View style={styles.listItem}><Text style={styles.listBullet}>-</Text><Text style={styles.listText}>{isId ? 'Hadiah lomba puisi, artikel, dan video singkat.' : 'Prizes for poetry, article, and short video competitions.'}</Text></View>
                    <View style={styles.listItem}><Text style={styles.listBullet}>-</Text><Text style={styles.listText}>{isId ? 'Pelaksanaan webinar.' : 'Webinar implementation.'}</Text></View>
                    <View style={styles.listItem}><Text style={styles.listBullet}>-</Text><Text style={styles.listText}>{isId ? 'Dokumentasi kegiatan.' : 'Activity documentation.'}</Text></View>
                    <View style={styles.listItem}><Text style={styles.listBullet}>-</Text><Text style={styles.listText}>{isId ? 'Souvenir atau merchandise peserta.' : 'Participant souvenirs or merchandise.'}</Text></View>
                    <View style={styles.listItem}><Text style={styles.listBullet}>-</Text><Text style={styles.listText}>{isId ? 'Kebutuhan operasional Panitia.' : 'Committee operational needs.'}</Text></View>
                </View>

                {/* XII. FORMAT KOMITMEN (DYNAMIC) */}
                <View style={{ marginTop: 15 }}>
                    <Text style={styles.sectionTitle}>{isId ? 'XII. Format Komitmen Donatur' : 'XII. Donor Commitment Format'}</Text>
                    {data.contribution_value ? (
                        <>
                            <Text style={styles.bodyText}>
                                {isId ? 'Dengan kerendahan hati kami mengucapkan terima kasih atas komitmen dukungan yang Anda berikan. Berikut adalah rincian data kemitraan resmi Anda.' : 'With humility, we thank you for your commitment. Below are the official details of your partnership.'}
                            </Text>

                            <View style={styles.vipCard}>
                                <Text style={styles.vipTitle}>{isId ? 'REKAMAN DUKUNGAN DONATUR' : 'DONOR SUPPORT RECORD'}</Text>

                                <View style={styles.vipRow}>
                                    <Text style={styles.vipLabel}>{isId ? 'Nomor Registrasi' : 'Registration Number'}</Text>
                                    <Text style={[styles.vipValue, { fontFamily: 'Helvetica', fontSize: 9 }]}>{data.number}</Text>
                                </View>
                                <View style={styles.vipRow}>
                                    <Text style={styles.vipLabel}>{isId ? 'Nama Donatur / Keluarga' : 'Donor / Family Name'}</Text>
                                    <Text style={styles.vipValue}>{data.name}</Text>
                                </View>
                                <View style={styles.vipRow}>
                                    <Text style={styles.vipLabel}>{isId ? 'Nama yang Dicantumkan' : 'Display Name'}</Text>
                                    <Text style={styles.vipValue}>{data.display_name || data.name}</Text>
                                </View>
                                <View style={styles.vipRow}>
                                    <Text style={styles.vipLabel}>{isId ? 'Kategori Donatur' : 'Donor Category'}</Text>
                                    <Text style={[styles.vipValue, { color: '#D4AF37', fontWeight: 700 }]}>{categoryLabel}</Text>
                                </View>
                                <View style={styles.vipRow}>
                                    <Text style={styles.vipLabel}>{isId ? 'Nilai / Bentuk Dukungan' : 'Support Value'}</Text>
                                    <Text style={styles.vipValueGold}>Rp {formatRupiah(Number(data.contribution_value))}</Text>
                                </View>
                                <View style={[styles.vipRow, { borderBottom: 'none', marginBottom: 0 }]}>
                                    <Text style={styles.vipLabel}>{isId ? 'Ucapan untuk Buku Acara' : 'Message for E-Booklet'}</Text>
                                    <Text style={[styles.vipValue, { fontSize: 9, lineHeight: 1.5, fontStyle: 'italic' }]}>
                                        "{data.message || (isId ? 'Teruskan Baktimu!' : 'Continue Your Service!')}"
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.sealSection}>
                                <View style={styles.sealBox}>
                                    <Image src={qrImageUrl} style={styles.qrCodeSeal} />
                                    <Text style={styles.sealText}>{isId ? 'PINDAI UNTUK\nVERIFIKASI' : 'SCAN TO\nVERIFY'}</Text>
                                </View>
                                <View style={styles.sealBox}>
                                    <Image src={logoUrl} style={styles.qrCodeSeal} />
                                    <Text style={styles.sealText}>{isId ? 'TERUSKAN\nBAKTIMU' : 'CONTINUE\nYOUR SERVICE'}</Text>
                                </View>
                            </View>
                        </>
                    ) : (
                        <View style={{ marginTop: 5 }}>
                            <View style={{ border: '0.5pt solid rgba(2, 44, 34, 0.15)', padding: 12, borderRadius: 4, backgroundColor: '#FFFFFF' }}>
                                <View style={styles.editorialTable}>
                                    <View style={styles.edTableRow}>
                                        <Text style={[styles.edTableCellLabel, { width: '40%' }]}>{isId ? 'Nama Donatur/ Keluarga' : 'Donor/ Family Name'}</Text>
                                        <Text style={[styles.edTableCellValue, { width: '60%' }]}>...................................................................................</Text>
                                    </View>
                                    <View style={styles.edTableRow}>
                                        <Text style={[styles.edTableCellLabel, { width: '40%' }]}>{isId ? 'Nama yang ingin dicantumkan' : 'Display Name'}</Text>
                                        <Text style={[styles.edTableCellValue, { width: '60%' }]}>...................................................................................</Text>
                                    </View>
                                    <View style={styles.edTableRow}>
                                        <Text style={[styles.edTableCellLabel, { width: '40%' }]}>{isId ? 'Nomor Telepon/ WhatsApp' : 'Phone/ WhatsApp'}</Text>
                                        <Text style={[styles.edTableCellValue, { width: '60%' }]}>...................................................................................</Text>
                                    </View>
                                    <View style={styles.edTableRow}>
                                        <Text style={[styles.edTableCellLabel, { width: '40%' }]}>{isId ? 'Alamat/ Jemaat' : 'Address/ Congregation'}</Text>
                                        <Text style={[styles.edTableCellValue, { width: '60%' }]}>...................................................................................</Text>
                                    </View>
                                    <View style={styles.edTableRow}>
                                        <Text style={[styles.edTableCellLabel, { width: '40%' }]}>{isId ? 'Nilai/ Bentuk Dukungan' : 'Support Value/ Form'}</Text>
                                        <Text style={[styles.edTableCellValue, { width: '60%' }]}>...................................................................................</Text>
                                    </View>
                                    <View style={styles.edTableRow}>
                                        <Text style={[styles.edTableCellLabel, { width: '40%' }]}>{isId ? 'Kategori Donatur' : 'Donor Category'}</Text>
                                        <Text style={[styles.edTableCellValue, { width: '60%' }]}>...................................................................................</Text>
                                    </View>
                                    <View style={[styles.edTableRow, { borderBottom: 'none' }]}>
                                        <Text style={[styles.edTableCellLabel, { width: '40%' }]}>{isId ? 'Ucapan singkat untuk buku acara elektronik' : 'Short message for e-booklet'}</Text>
                                        <Text style={[styles.edTableCellValue, { width: '60%' }]}>...................................................................................</Text>
                                    </View>
                                </View>

                                {/* Signature Row */}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 25, paddingHorizontal: 15 }}>
                                    <View style={{ alignItems: 'center', width: '45%' }}>
                                        <Text style={{ fontFamily: 'Helvetica', fontSize: 8.0, fontWeight: 'bold', color: '#022c22', textAlign: 'center', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 40 }}>
                                            {isId ? 'Donatur / Perwakilan Keluarga' : 'Donor / Family Representative'}
                                        </Text>
                                        <Text style={{ fontFamily: 'Helvetica', fontSize: 8.0, color: '#4A5568' }}>....................................................</Text>
                                    </View>
                                    <View style={{ alignItems: 'center', width: '45%' }}>
                                        <Text style={{ fontFamily: 'Helvetica', fontSize: 8.0, fontWeight: 'bold', color: '#022c22', textAlign: 'center', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 40 }}>
                                            {isId ? 'Panitia HUT ke-16 Pelkat PKLU GPIB' : '16th Anniversary Committee'}
                                        </Text>
                                        <Text style={{ fontFamily: 'Helvetica', fontSize: 8.0, color: '#4A5568' }}>....................................................</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Optional WA QR Scanner - to combine both physical & digital */}
                            <View style={{ alignItems: 'center', marginTop: 12 }}>
                                <View style={[styles.vipCard, { width: '55%', alignItems: 'center', padding: 10, border: '0.5pt solid rgba(2, 44, 34, 0.1)' }]}>
                                    <Text style={[styles.vipTitle, { fontSize: 7.5, marginBottom: 6 }]}>
                                        {isId ? 'ATAU PINDAI UNTUK KIRIM KOMITMEN VIA WA' : 'OR SCAN TO SEND COMMITMENT VIA WA'}
                                    </Text>
                                    <Image src={commitmentWaQrUrl} style={{ width: 60, height: 60, marginBottom: 6 }} />
                                    <Text style={[styles.bodyText, { textAlign: 'center', fontSize: 7.0, color: '#022c22', fontWeight: 'bold', marginBottom: 0 }]}>
                                        {isId ? 'Atau hubungi WA: 0812-9145-1945' : 'Or contact WA: +62 812-9145-1945'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                {/* XIII. INFORMasi TRANSFER */}
                <View wrap={false} style={{ marginTop: 0 }}>
                    <Text style={styles.sectionTitle}>{isId ? 'XIII. Informasi Transfer' : 'XIII. Transfer Information'}</Text>
                    <Text style={styles.bodyText}>{isId ? 'Dukungan dana dapat disampaikan melalui rekening Panitia berikut:' : 'Financial support can be sent via the following Committee account:'}</Text>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5, marginBottom: 12 }}>
                        {/* Bank Box */}
                        <View style={{ width: '54%', backgroundColor: '#022c22', padding: 10, borderLeft: '3pt solid #D4AF37', borderRadius: 2 }}>
                            <Text style={{ fontFamily: 'Times-Roman', fontSize: 11, color: '#D4AF37', fontWeight: 'bold', marginBottom: 3 }}>BANK BTN</Text>
                            <Text style={{ fontFamily: 'Helvetica', fontSize: 8, color: '#A0AEC0', marginBottom: 1 }}>{isId ? 'Nomor Rekening:' : 'Account Number:'}</Text>
                            <Text style={{ fontFamily: 'Times-Roman', fontSize: 14, color: '#D4AF37', fontWeight: 'bold', marginBottom: 3 }}>00179-01-88-000447-9</Text>
                            <Text style={{ fontFamily: 'Helvetica', fontSize: 8, color: '#A0AEC0', marginBottom: 1 }}>{isId ? 'Atas Nama:' : 'Account Name:'}</Text>
                            <Text style={{ fontFamily: 'Times-Roman', fontSize: 9.5, color: '#FDFBF7' }}>PANITIA MUPEL GPIB BEKASI</Text>
                        </View>

                        {/* Contact Box */}
                        <View style={{ width: '43%', border: '0.5pt solid rgba(2, 44, 34, 0.15)', backgroundColor: '#FFFFFF', padding: 10, borderRadius: 2, justifyContent: 'center' }}>
                            <Text style={{ fontFamily: 'Helvetica', fontSize: 7.5, fontWeight: 'bold', color: '#022c22', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>
                                {isId ? 'Konfirmasi ke (WA):' : 'Confirm to (WA):'}
                            </Text>
                            <Text style={{ fontFamily: 'Times-Roman', fontSize: 9.0, fontWeight: 'bold', color: '#022c22', marginBottom: 2 }}>
                                ANASTASIA CHRISTINE DOLO
                            </Text>
                            <Text style={{ fontFamily: 'Helvetica', fontSize: 9, color: '#4A5568', fontWeight: 'bold' }}>
                                +62 812-9145-1945
                            </Text>
                        </View>
                    </View>
                </View>

                {/* XIV. PENUTUP & SIGNATURES */}
                <View wrap={false} style={{ marginTop: 10 }}>
                    <Text style={styles.sectionTitle}>{isId ? 'XIV. Penutup' : 'XIV. Closing'}</Text>
                    <Text style={styles.bodyText}>{isId ? 'Demikian proposal dukungan donatur ini disampaikan sebagai undangan pelayanan bagi pribadi, keluarga, dan sahabat-sahabat Pelkat PKLU GPIB yang rindu mengambil bagian dalam Perayaan dan Ibadah Memperingati HUT ke-16 Pelkat PKLU GPIB.' : 'Thus this donor support proposal is presented as an invitation to serve for individuals, families, and friends of Pelkat PKLU GPIB.'}</Text>
                    <Text style={styles.bodyText}>{isId ? 'Setiap dukungan, baik besar maupun kecil, merupakan wujud kasih dan kepedulian yang sangat berarti bagi pelayanan kaum lanjut usia. Kiranya melalui kegiatan ini, Pelkat PKLU GPIB semakin dikuatkan untuk terus menjadi lansia teladan dalam iman, karya, dan pelayanan.' : 'Every support is a meaningful manifestation of care for the elderly service. May through this activity, PKLU GPIB be strengthened to continue being role models.'}</Text>

                    <Text style={[styles.sectionTitle, { fontSize: 12, textAlign: 'center', marginTop: 15, marginBottom: 5 }]}>{isId ? 'Terima Kasih' : 'Thank You'}</Text>
                    <Text style={[styles.bodyText, { textAlign: 'center', marginBottom: 15 }]}>{isId ? 'Atas doa, dukungan, dan kasih yang diberikan, Panitia menyampaikan terima kasih.\n\nTeruskan Baktimu!\nLansia Teladan dalam Iman, Karya, dan Pelayanan' : 'For your prayers, support, and love, the Committee expresses gratitude.\n\nContinue Your Service!\nElderly Role Models in Faith, Work, and Service'}</Text>

                    <Text style={[styles.bodyText, { textAlign: 'center', marginBottom: 20 }]}>
                        {isId ? 'Teriring Salam dan Doa,' : 'With Greetings and Prayers,'}
                        {'\n'}
                        <Text style={styles.bodyTextBold}>{isId ? 'Panitia Pelaksana HUT ke-16 Pelkat PKLU GPIB' : '16th PLKU GPIB Anniversary Committee'}</Text>
                    </Text>

                    <View style={styles.signRow}>
                        <View style={styles.signBox}>
                            <Text style={styles.signName}>Vrilly Rondonuwu</Text>
                            <View style={[styles.signLine, { marginTop: 4, marginBottom: 4 }]} />
                            <Text style={styles.signTitle}>{isId ? 'Ketua' : 'Chairperson'}</Text>
                        </View>

                        <View style={{ alignItems: 'center', justifyContent: 'center', width: 90, marginTop: -25 }}>
                            <Image
                                src={`https://quickchart.io/qr?size=100&text=${encodeURIComponent(`https://pklu.amanloka.com/verify/${data.id}`)}`}
                                style={{ width: 40, height: 40, marginBottom: 4 }}
                            />
                            <Text style={{ fontSize: 5.5, color: '#022c22', textAlign: 'center', fontWeight: 'bold', letterSpacing: 0.5 }}>
                                {isId ? 'DOKUMEN VALID' : 'VALID DOCUMENT'}
                            </Text>
                        </View>

                        <View style={styles.signBox}>
                            <Text style={styles.signName}>Vevi Mayo</Text>
                            <View style={[styles.signLine, { marginTop: 4, marginBottom: 4 }]} />
                            <Text style={styles.signTitle}>{isId ? 'Sekretaris' : 'Secretary'}</Text>
                        </View>
                    </View>

                    <View style={{ alignItems: 'center', marginTop: 15 }}>
                        <View style={[styles.signCenterBox, { marginTop: 0 }]}>
                            <Text style={[styles.signTitle, { marginBottom: 25, color: '#022c22' }]}>{isId ? 'Mengetahui,\nBadan Pelaksana MUPEL Jemaat – Jemaat Bekasi' : 'Acknowledged by,\nExecutive Board of GPIB MUPEL - Bekasi Jemaat'}</Text>
                            <Text style={styles.signName}>Pdt. Daniel J C Lumentut, S.Th., M.M</Text>
                            <View style={[styles.signLine, { width: 180, marginTop: 4, marginBottom: 4 }]} />
                            <Text style={styles.signRole}>{isId ? 'Ketua B.P Mupel Bekasi' : 'Chairperson of BP Mupel Bekasi'}</Text>
                        </View>
                    </View>
                </View>

            </Page>
        </Document>
    )
}
