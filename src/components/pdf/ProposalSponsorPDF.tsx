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

export function ProposalSponsorPDF({ data, lang, logoUrl = "/logo_hut16_pklu.png", origin = "https://pklu.amanloka.com" }: Props) {
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
        ? `Halo Panitia HUT 16 PKLU GPIB, saya mewakili perusahaan/instansi ingin memberikan komitmen dukungan untuk Proposal Sponsorship No: ${data.number}. Nama Sponsor: ${data.name}.`
        : `Hello 16th PKLU GPIB Anniversary Committee, on behalf of my company/institution, I would like to make a support commitment for Sponsorship Proposal No: ${data.number}. Sponsor Name: ${data.name}.`
    const commitmentWaUrl = `https://api.whatsapp.com/send?phone=${CENTRAL_CONTACT_PHONE}&text=${encodeURIComponent(commitmentMsg)}`
    const commitmentWaQrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(commitmentWaUrl)}&size=140&margin=1&dark=022c22`

    const packageMap: Record<string, string> = {
        platinum: isId ? 'Platinum' : 'Platinum',
        gold: isId ? 'Gold' : 'Gold',
        silver: isId ? 'Silver' : 'Silver',
        bronze: isId ? 'Bronze' : 'Bronze',
        in_kind: isId ? 'Sponsor Produk/ In-Kind' : 'In-Kind',
        donatur: isId ? 'Sahabat Pelayanan/ Donatur' : 'Participation',
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
                        {isId ? 'PROPOSAL SPONSORSHIP' : 'SPONSORSHIP PROPOSAL'}
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
                        {data.company_name && data.company_name !== data.name && (
                            <Text style={{ fontFamily: 'Helvetica', fontSize: 9, color: '#D4AF37', marginTop: 4, fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center' }}>
                                {data.company_name}
                            </Text>
                        )}
                        {data.pic_name && (
                            <Text style={{ fontFamily: 'Helvetica', fontSize: 8, color: '#A0AEC0', marginTop: 3, textTransform: 'uppercase', textAlign: 'center' }}>
                                {data.pic_name} {data.pic_position ? `(${data.pic_position})` : ''}
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
                
                {/* RINGKASAN KEGIATAN UNTUK SPONSOR */}
                <View style={{ marginBottom: 20 }}>
                    <Text style={[styles.sectionTitle, { fontSize: 20, textAlign: 'center', color: '#022c22', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20 }]}>
                        {isId ? 'Ringkasan Kegiatan' : 'Event Summary'}
                    </Text>
                    
                    <View style={{ border: '1pt solid #022c22', borderRadius: 6, padding: 15, backgroundColor: '#FFFFFF' }}>
                        <View style={{ width: '100%' }}>
                            <View style={{ flexDirection: 'row', borderBottom: '1pt solid rgba(2, 44, 34, 0.1)', paddingVertical: 12 }}>
                                <Text style={{ width: '35%', fontFamily: 'Helvetica', fontSize: 10, fontWeight: 'bold', color: '#022c22', textTransform: 'uppercase', letterSpacing: 0.5 }}>{isId ? 'NAMA KEGIATAN' : 'EVENT NAME'}</Text>
                                <Text style={{ width: '65%', fontFamily: 'Times-Roman', fontWeight: 700, fontSize: 12, color: '#022c22', lineHeight: 1.4 }}>
                                    {isId ? 'Perayaan dan Ibadah Memperingati HUT ke-16 Pelkat PKLU GPIB' : 'Worship & Ceremonial 16th PKLU GPIB Anniversary'}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', borderBottom: '1pt solid rgba(2, 44, 34, 0.1)', paddingVertical: 12 }}>
                                <Text style={{ width: '35%', fontFamily: 'Helvetica', fontSize: 10, fontWeight: 'bold', color: '#022c22', textTransform: 'uppercase', letterSpacing: 0.5 }}>{isId ? 'TAG LINE' : 'TAG LINE'}</Text>
                                <Text style={{ width: '65%', fontFamily: 'Times-Roman', fontStyle: 'italic', fontSize: 12, color: '#D4AF37', fontWeight: 'bold' }}>"Teruskan Baktimu!"</Text>
                            </View>
                            <View style={{ flexDirection: 'row', borderBottom: '1pt solid rgba(2, 44, 34, 0.1)', paddingVertical: 12 }}>
                                <Text style={{ width: '35%', fontFamily: 'Helvetica', fontSize: 10, fontWeight: 'bold', color: '#022c22', textTransform: 'uppercase', letterSpacing: 0.5 }}>{isId ? 'TEMA / SUBTEMA' : 'THEME / SUBTHEME'}</Text>
                                <Text style={{ width: '65%', fontFamily: 'Helvetica', fontSize: 10, color: '#4A5568', lineHeight: 1.4 }}>
                                    {isId ? '"Bertumbuh dalam Keselamatan" (1 Petrus 2: 2)\nLansia Teladan dalam Iman, Karya, dan Pelayanan' : '"Growing in Salvation" (1 Peter 2:2)\nElderly Role Models in Faith, Work, and Service'}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', borderBottom: '1pt solid rgba(2, 44, 34, 0.1)', paddingVertical: 12 }}>
                                <Text style={{ width: '35%', fontFamily: 'Helvetica', fontSize: 10, fontWeight: 'bold', color: '#022c22', textTransform: 'uppercase', letterSpacing: 0.5 }}>{isId ? 'HARI / TANGGAL' : 'DATE'}</Text>
                                <Text style={{ width: '65%', fontFamily: 'Helvetica', fontSize: 10, color: '#4A5568', fontWeight: 'bold' }}>{isId ? 'Senin, 12 Oktober 2026' : 'Monday, October 12, 2026'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', borderBottom: '1pt solid rgba(2, 44, 34, 0.1)', paddingVertical: 12 }}>
                                <Text style={{ width: '35%', fontFamily: 'Helvetica', fontSize: 10, fontWeight: 'bold', color: '#022c22', textTransform: 'uppercase', letterSpacing: 0.5 }}>{isId ? 'TEMPAT' : 'LOCATION'}</Text>
                                <Text style={{ width: '65%', fontFamily: 'Helvetica', fontSize: 10, color: '#4A5568', lineHeight: 1.4 }}>Bekasi Convention Center, Hotel Santika Mega Mall Bekasi, Kota Bekasi, Jawa Barat</Text>
                            </View>
                            <View style={{ flexDirection: 'row', borderBottom: '1pt solid rgba(2, 44, 34, 0.1)', paddingVertical: 12 }}>
                                <Text style={{ width: '35%', fontFamily: 'Helvetica', fontSize: 10, fontWeight: 'bold', color: '#022c22', textTransform: 'uppercase', letterSpacing: 0.5 }}>{isId ? 'TARGET PESERTA' : 'TARGET ATTENDEES'}</Text>
                                <Text style={{ width: '65%', fontFamily: 'Helvetica', fontSize: 10, color: '#4A5568' }}>{isId ? '± 600 Orang dari pengurus/ anggota Pelkat PKLU GPIB jemaat GPIB di Indonesia' : '± 600 Delegates from PKLU GPIB across Indonesia'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', borderBottom: '1pt solid rgba(2, 44, 34, 0.1)', paddingVertical: 12 }}>
                                <Text style={{ width: '35%', fontFamily: 'Helvetica', fontSize: 10, fontWeight: 'bold', color: '#022c22', textTransform: 'uppercase', letterSpacing: 0.5 }}>{isId ? 'BENTUK KEGIATAN' : 'EVENT FORMAT'}</Text>
                                <Text style={{ width: '65%', fontFamily: 'Helvetica', fontSize: 10, color: '#4A5568', lineHeight: 1.4 }}>{isId ? 'Ibadah, Seremonial, Peniupan Lilin, Penampilan Seni Lansia, Dan Pengumuman Pemenang Lomba' : 'Worship, Ceremonial, Candle Blowing, Elderly Art Performance, And Competition Winner Announcements'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', paddingVertical: 12 }}>
                                <Text style={{ width: '35%', fontFamily: 'Helvetica', fontSize: 10, fontWeight: 'bold', color: '#022c22', textTransform: 'uppercase', letterSpacing: 0.5 }}>{isId ? 'PRA-KEGIATAN' : 'PRE-EVENT'}</Text>
                                <Text style={{ width: '65%', fontFamily: 'Helvetica', fontSize: 10, color: '#4A5568', lineHeight: 1.4 }}>{isId ? 'Lomba Puisi, Lomba Artikel, Lomba Video Singkat/ Shorts/ Reel, Dan Webinar' : 'Poetry Competition, Article Competition, Short Video/ Shorts/ Reel Competition, And Webinar'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* I. PENDAHULUAN */}
                <View break style={{ marginBottom: 20 }}>
                    <Text style={styles.sectionTitle}>{isId ? 'I. Pendahuluan' : 'I. Introduction'}</Text>
                    <Text style={styles.bodyText}>
                        {isId ? 'Pelayanan Kategorial Persekutuan Kaum Lanjut Usia Gereja Protestan di Indonesia bagian Barat atau Pelkat PKLU GPIB merupakan wadah pelayanan kategorial bagi warga lanjut usia di lingkungan GPIB.' : 'The Categorical Service of the Elderly Fellowship of the Protestant Church in Western Indonesia or Pelkat PKLU GPIB is a categorical service forum for elderly citizens within the GPIB.'}
                    </Text>
                    <Text style={styles.bodyText}>
                        {isId ? 'Pelkat PKLU hadir sebagai ruang persekutuan, pembinaan, pendampingan, penguatan iman, serta pemberdayaan kaum lanjut usia agar tetap menjadi pribadi yang aktif, sehat, mandiri, berdaya, dan bermakna dalam kehidupan bergereja, berkeluarga, dan bermasyarakat.' : 'Pelkat PKLU is present as a space for fellowship, coaching, mentoring, faith strengthening, and empowerment of the elderly so that they remain active, healthy, independent, empowered, and meaningful individuals in church, family, and community life.'}
                    </Text>
                    <Text style={styles.bodyText}>
                        {isId ? 'Pada tanggal 12 Oktober 2026, Pelkat PKLU GPIB akan memperingati Hari Ulang Tahun ke-16. Momentum ini menjadi kesempatan bagi seluruh warga Pelkat PKLU GPIB untuk menyatakan syukur atas kasih dan penyertaan Tuhan dalam perjalanan pelayanan selama 16 tahun. Perayaan ini juga menjadi ruang untuk memperkuat semangat pelayanan kaum lanjut usia agar tetap menjadi teladan dalam iman, karya, dan pelayanan.' : 'On October 12, 2026, Pelkat PKLU GPIB will commemorate its 16th Anniversary. This momentum is an opportunity for all members of Pelkat PKLU GPIB to express gratitude for God\'s love and inclusion in the journey of service for 16 years. This celebration is also a space to strengthen the spirit of service of the elderly so that they remain role models in faith, work, and service.'}
                    </Text>
                    <Text style={styles.bodyText}>
                        {isId ? 'Panitia HUT ke-16 Pelkat PKLU GPIB membuka kesempatan kerja sama dan dukungan sponsorship dari berbagai pihak, baik lembaga, perusahaan, organisasi, komunitas, maupun pribadi, untuk mendukung terselenggaranya kegiatan ini.' : 'The 16th Anniversary Committee of Pelkat PKLU GPIB opens opportunities for cooperation and sponsorship support from various parties, both institutions, companies, organizations, communities, and individuals, to support the implementation of this activity.'}
                    </Text>
                </View>

                {/* II. MAKSUD DAN TUJUAN */}
                <View style={{ marginBottom: 20 }}>
                    <Text style={styles.sectionTitle}>{isId ? 'II. Maksud dan Tujuan' : 'II. Purpose and Objectives'}</Text>
                    <View style={styles.listItem}><Text style={styles.listBullet}>•</Text><Text style={styles.listText}>{isId ? 'Mewujudkan ungkapan syukur kepada Tuhan atas perjalanan pelayanan Pelkat PKLU GPIB.' : 'Realizing an expression of gratitude to God for the journey of service of Pelkat PKLU GPIB.'}</Text></View>
                    <View style={styles.listItem}><Text style={styles.listBullet}>•</Text><Text style={styles.listText}>{isId ? 'Mempererat persekutuan antar pengurus dan anggota Pelkat PKLU GPIB dari jemaat-jemaat GPIB di Indonesia.' : 'Strengthening the fellowship between administrators and members of Pelkat PKLU GPIB from GPIB congregations in Indonesia.'}</Text></View>
                    <View style={styles.listItem}><Text style={styles.listBullet}>•</Text><Text style={styles.listText}>{isId ? 'Mengapresiasi karya, kreativitas, pengalaman, dan kesaksian iman kaum lanjut usia.' : 'Appreciating the work, creativity, experience, and faith testimony of the elderly.'}</Text></View>
                    <View style={styles.listItem}><Text style={styles.listBullet}>•</Text><Text style={styles.listText}>{isId ? 'Mendorong kaum lanjut usia untuk tetap aktif, sehat, mandiri, dan bermakna.' : 'Encouraging the elderly to remain active, healthy, independent, and meaningful.'}</Text></View>
                    <View style={styles.listItem}><Text style={styles.listBullet}>•</Text><Text style={styles.listText}>{isId ? 'Membangun kolaborasi dengan sponsor, donatur, pemerintah, dan mitra pelayanan.' : 'Building collaboration with sponsors, donors, government, and service partners.'}</Text></View>
                </View>

                {/* III. BENTUK DAN RANGKAIAN KEGIATAN */}
                <View wrap={false} style={{ marginBottom: 20 }}>
                    <Text style={styles.sectionTitle}>{isId ? 'III. Bentuk dan Rangkaian Kegiatan' : 'III. Form and Series of Activities'}</Text>
                    
                    <Text style={[styles.sectionTitle, { fontSize: 13, marginBottom: 10, marginTop: 5 }]}>{isId ? 'A. Pra-Kegiatan' : 'A. Pre-Event'}</Text>
                    <View style={styles.listItem}><Text style={styles.listBullet}>-</Text><Text style={styles.listText}>{isId ? 'Lomba Pembuatan Puisi sebagai ruang ekspresi iman, pengalaman hidup, dan refleksi pelayanan kaum lanjut usia.' : 'Poetry Making Competition as a space for expressing faith, life experience, and reflecting on the service of the elderly.'}</Text></View>
                    <View style={styles.listItem}><Text style={styles.listBullet}>-</Text><Text style={styles.listText}>{isId ? 'Lomba Penulisan Artikel dengan tema “Lansia Teladan dalam Iman, Karya, dan Pelayanan”.' : 'Article Writing Competition with the theme “Elderly Role Models in Faith, Work, and Service”.'}</Text></View>
                    <View style={styles.listItem}><Text style={styles.listBullet}>-</Text><Text style={styles.listText}>{isId ? 'Lomba Pembuatan Video Singkat/ Shorts/ Reel bertema “Lansia Teladan”.' : 'Short Video/ Shorts/ Reel Making Competition with the theme “Elderly Role Models”.'}</Text></View>
                    <View style={styles.listItem}><Text style={styles.listBullet}>-</Text><Text style={styles.listText}>{isId ? 'Webinar dengan topik "Bijak Mengelola Berkat: Persiapan Keuangan Menuju Masa Lanjut Usia yang Bermakna" / "Siap Finansial di Usia Emas" / "Lansia Teladan, Keuangan Terencana".' : 'Webinar with the topic "Wisely Managing Blessings: Financial Preparation Towards a Meaningful Old Age" etc.'}</Text></View>

                    <Text style={[styles.sectionTitle, { fontSize: 13, marginBottom: 10, marginTop: 10 }]}>{isId ? 'B. Kegiatan Puncak' : 'B. Main Event'}</Text>
                    <View style={styles.listItem}><Text style={styles.listBullet}>-</Text><Text style={styles.listText}>{isId ? 'Ibadah syukur HUT ke-16 Pelkat PKLU GPIB.' : 'Thanksgiving worship for the 16th Anniversary of Pelkat PKLU GPIB.'}</Text></View>
                    <View style={styles.listItem}><Text style={styles.listBullet}>-</Text><Text style={styles.listText}>{isId ? 'Seremonial perayaan bersama unsur pemerintah, pimpinan gereja, dan undangan.' : 'Celebration ceremonial with government elements, church leaders, and invitees.'}</Text></View>
                    <View style={styles.listItem}><Text style={styles.listBullet}>-</Text><Text style={styles.listText}>{isId ? 'Peniupan lilin HUT ke-16.' : 'Blowing the 16th Anniversary candles.'}</Text></View>
                    <View style={styles.listItem}><Text style={styles.listBullet}>-</Text><Text style={styles.listText}>{isId ? 'Penampilan karya seni kaum lanjut usia: tarian, nyanyian, stand up comedy, dan kreativitas lainnya.' : 'Performance of artworks by the elderly: dance, singing, stand up comedy, and other creativity.'}</Text></View>
                    <View style={styles.listItem}><Text style={styles.listBullet}>-</Text><Text style={styles.listText}>{isId ? 'Pengumuman pemenang lomba dan ramah tamah.' : 'Announcement of competition winners and hospitality.'}</Text></View>
                </View>

                {/* IV & V. RUNDOWN */}
                <View wrap={false} style={{ marginBottom: 20 }}>
                    <Text style={styles.sectionTitle}>{isId ? 'IV. Rundown Pra-Kegiatan' : 'IV. Pre-Event Rundown'}</Text>
                    <View style={styles.editorialTable}>
                        <View style={styles.edTableHeader}>
                            <Text style={[styles.edTableHeadText, { width: '30%' }]}>{isId ? 'PERIODE' : 'PERIOD'}</Text>
                            <Text style={[styles.edTableHeadText, { width: '30%' }]}>{isId ? 'KEGIATAN' : 'ACTIVITY'}</Text>
                            <Text style={[styles.edTableHeadText, { width: '40%' }]}>{isId ? 'KETERANGAN' : 'DESCRIPTION'}</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellLabel, { width: '30%' }]}>Juni – Juli 2026</Text>
                            <Text style={[styles.edTableCellValue, { width: '30%', fontWeight: 700 }]}>Sosialisasi Lomba</Text>
                            <Text style={[styles.edTableCellValue, { width: '40%', fontSize: 8 }]}>Publikasi kepada jemaat-jemaat GPIB</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellLabel, { width: '30%' }]}>Juli - Agustus 2026</Text>
                            <Text style={[styles.edTableCellValue, { width: '30%', fontWeight: 700 }]}>Penerimaan Lomba Puisi</Text>
                            <Text style={[styles.edTableCellValue, { width: '40%', fontSize: 8 }]}>Karya dikirim kepada panitia</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellLabel, { width: '30%' }]}>Juli - Agustus 2026</Text>
                            <Text style={[styles.edTableCellValue, { width: '30%', fontWeight: 700 }]}>Penerimaan Lomba Artikel</Text>
                            <Text style={[styles.edTableCellValue, { width: '40%', fontSize: 8 }]}>Tema: Lansia Teladan dalam Iman, Karya, dan Pelayanan</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellLabel, { width: '30%' }]}>Agustus - Sept 2026</Text>
                            <Text style={[styles.edTableCellValue, { width: '30%', fontWeight: 700 }]}>Penerimaan Lomba Video</Text>
                            <Text style={[styles.edTableCellValue, { width: '40%', fontSize: 8 }]}>Tema: Lansia Teladan</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellLabel, { width: '30%' }]}>September 2026</Text>
                            <Text style={[styles.edTableCellValue, { width: '30%', fontWeight: 700 }]}>Penjurian Lomba</Text>
                            <Text style={[styles.edTableCellValue, { width: '40%', fontSize: 8 }]}>Dilakukan oleh tim juri</Text>
                        </View>
                        <View style={styles.edTableRow}>
                            <Text style={[styles.edTableCellLabel, { width: '30%' }]}>Sept/ Okt 2026</Text>
                            <Text style={[styles.edTableCellValue, { width: '30%', fontWeight: 700 }]}>Webinar</Text>
                            <Text style={[styles.edTableCellValue, { width: '40%', fontSize: 8 }]}>Lansia Teladan dari Kacamata Keuangan</Text>
                        </View>
                        <View style={[styles.edTableRow, { borderBottom: 'none' }]}>
                            <Text style={[styles.edTableCellLabel, { width: '30%' }]}>12 Oktober 2026</Text>
                            <Text style={[styles.edTableCellValue, { width: '30%', fontWeight: 700 }]}>Pengumuman Pemenang</Text>
                            <Text style={[styles.edTableCellValue, { width: '40%', fontSize: 8 }]}>Pada acara puncak</Text>
                        </View>
                    </View>
                    
                    <Text style={[styles.sectionTitle, { marginTop: 15 }]}>{isId ? 'V. Rundown Kegiatan Puncak' : 'V. Main Event Rundown'}</Text>
                    <Text style={{ fontFamily: 'Helvetica', fontSize: 8.5, fontWeight: 'bold', color: '#D4AF37', textAlign: 'center', letterSpacing: 0.5, marginBottom: 12 }}>
                        {isId ? 'Senin, 12 Oktober 2026   |   Bekasi Convention Center, Hotel Santika Mega Mall Bekasi' : 'Monday, October 12, 2026   |   Bekasi Convention Center, Hotel Santika Mega Mall'}
                    </Text>
                    
                    <View style={{ border: '0.5pt solid rgba(2, 44, 34, 0.15)', borderRadius: 4, overflow: 'hidden', marginBottom: 20 }}>
                        <View style={{ width: '100%' }}>
                            <View style={{ flexDirection: 'row', backgroundColor: '#022c22', borderBottom: '1.5pt solid #D4AF37', paddingVertical: 8, paddingHorizontal: 10 }}>
                                <Text style={{ width: '25%', fontFamily: 'Helvetica', fontSize: 8.0, fontWeight: 'bold', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: 0.5 }}>{isId ? 'WAKTU' : 'TIME'}</Text>
                                <Text style={{ width: '15%', fontFamily: 'Helvetica', fontSize: 8.0, fontWeight: 'bold', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' }}>{isId ? 'DURASI' : 'DURATION'}</Text>
                                <Text style={{ width: '60%', fontFamily: 'Helvetica', fontSize: 8.0, fontWeight: 'bold', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: 0.5 }}>{isId ? 'ACARA' : 'PROGRAM'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', borderBottom: '0.5pt solid rgba(2, 44, 34, 0.08)', paddingVertical: 8, paddingHorizontal: 10, backgroundColor: 'rgba(2, 44, 34, 0.02)' }}>
                                <Text style={{ width: '25%', fontFamily: 'Helvetica', fontSize: 8.5, fontWeight: 'bold', color: '#022c22' }}>08:00 – 09:00</Text>
                                <Text style={{ width: '15%', fontFamily: 'Helvetica', fontSize: 8.5, color: '#4A5568', textAlign: 'center', fontWeight: 'bold' }}>60'</Text>
                                <Text style={{ width: '60%', fontFamily: 'Helvetica', fontSize: 8.5, color: '#4A5568' }}>{isId ? 'Registrasi Peserta dan Tamu Undangan' : 'Registration of Participants and Invited Guests'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', borderBottom: '0.5pt solid rgba(2, 44, 34, 0.08)', paddingVertical: 8, paddingHorizontal: 10, backgroundColor: '#FFFFFF' }}>
                                <Text style={{ width: '25%', fontFamily: 'Helvetica', fontSize: 8.5, fontWeight: 'bold', color: '#022c22' }}>09:00 – 10:30</Text>
                                <Text style={{ width: '15%', fontFamily: 'Helvetica', fontSize: 8.5, color: '#4A5568', textAlign: 'center', fontWeight: 'bold' }}>90'</Text>
                                <Text style={{ width: '60%', fontFamily: 'Helvetica', fontSize: 8.5, color: '#022c22', fontWeight: 'bold' }}>{isId ? 'Ibadah Syukur Agung HUT Ke-16 Pelkat PKLU GPIB' : 'Thanksgiving Worship Service 16th PKLU GPIB'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', borderBottom: '0.5pt solid rgba(2, 44, 34, 0.08)', paddingVertical: 8, paddingHorizontal: 10, backgroundColor: 'rgba(2, 44, 34, 0.02)' }}>
                                <Text style={{ width: '25%', fontFamily: 'Helvetica', fontSize: 8.5, fontWeight: 'bold', color: '#022c22' }}>10:30 – 10:50</Text>
                                <Text style={{ width: '15%', fontFamily: 'Helvetica', fontSize: 8.5, color: '#4A5568', textAlign: 'center', fontWeight: 'bold' }}>20'</Text>
                                <Text style={{ width: '60%', fontFamily: 'Helvetica', fontSize: 8.5, color: '#4A5568' }}>{isId ? 'Snack Break + Hiburan Musik' : 'Snack Break & Musical Entertainment'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', borderBottom: '0.5pt solid rgba(2, 44, 34, 0.08)', paddingVertical: 8, paddingHorizontal: 10, backgroundColor: '#FFFFFF' }}>
                                <Text style={{ width: '25%', fontFamily: 'Helvetica', fontSize: 8.5, fontWeight: 'bold', color: '#022c22' }}>10:50 – 11:15</Text>
                                <Text style={{ width: '15%', fontFamily: 'Helvetica', fontSize: 8.5, color: '#4A5568', textAlign: 'center', fontWeight: 'bold' }}>25'</Text>
                                <Text style={{ width: '60%', fontFamily: 'Helvetica', fontSize: 8.5, color: '#4A5568' }}>{isId ? 'Opening Ceremony (Tarian Pembukaan, Penyambutan Pemerintah)' : 'Opening Ceremony (Traditional Dance & Government Welcoming)'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', borderBottom: '0.5pt solid rgba(2, 44, 34, 0.08)', paddingVertical: 8, paddingHorizontal: 10, backgroundColor: 'rgba(2, 44, 34, 0.02)' }}>
                                <Text style={{ width: '25%', fontFamily: 'Helvetica', fontSize: 8.5, fontWeight: 'bold', color: '#022c22' }}>11:15 – 12:00</Text>
                                <Text style={{ width: '15%', fontFamily: 'Helvetica', fontSize: 8.5, color: '#4A5568', textAlign: 'center', fontWeight: 'bold' }}>45'</Text>
                                <Text style={{ width: '60%', fontFamily: 'Helvetica', fontSize: 8.5, color: '#4A5568' }}>{isId ? 'Sambutan-Sambutan + Keynote Speech' : 'Speeches & Keynote Address'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', borderBottom: '0.5pt solid rgba(2, 44, 34, 0.08)', paddingVertical: 8, paddingHorizontal: 10, backgroundColor: '#FFFFFF' }}>
                                <Text style={{ width: '25%', fontFamily: 'Helvetica', fontSize: 8.5, fontWeight: 'bold', color: '#022c22' }}>12:00 – 13:50</Text>
                                <Text style={{ width: '15%', fontFamily: 'Helvetica', fontSize: 8.5, color: '#4A5568', textAlign: 'center', fontWeight: 'bold' }}>110'</Text>
                                <Text style={{ width: '60%', fontFamily: 'Helvetica', fontSize: 8.5, color: '#4A5568' }}>{isId ? 'Makan Siang Bersama (Istirahat & Persiapan Peserta)' : 'Lunch Break (Rest & Participants Preparation)'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', borderBottom: '0.5pt solid rgba(2, 44, 34, 0.08)', paddingVertical: 8, paddingHorizontal: 10, backgroundColor: 'rgba(2, 44, 34, 0.02)' }}>
                                <Text style={{ width: '25%', fontFamily: 'Helvetica', fontSize: 8.5, fontWeight: 'bold', color: '#022c22' }}>13:50 – 16:00</Text>
                                <Text style={{ width: '15%', fontFamily: 'Helvetica', fontSize: 8.5, color: '#4A5568', textAlign: 'center', fontWeight: 'bold' }}>130'</Text>
                                <Text style={{ width: '60%', fontFamily: 'Helvetica', fontSize: 8.5, color: '#022c22', fontWeight: 'bold' }}>{isId ? 'Perayaan (Panggung Gembira, Seni Lansia) + Pengumuman Pemenang' : 'Celebration (Stage Festivities, Art Shows) & Competition Winners'}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 10, backgroundColor: '#FFFFFF' }}>
                                <Text style={{ width: '25%', fontFamily: 'Helvetica', fontSize: 8.5, fontWeight: 'bold', color: '#022c22' }}>16:00 – 17:00</Text>
                                <Text style={{ width: '15%', fontFamily: 'Helvetica', fontSize: 8.5, color: '#4A5568', textAlign: 'center', fontWeight: 'bold' }}>60'</Text>
                                <Text style={{ width: '60%', fontFamily: 'Helvetica', fontSize: 8.5, color: '#4A5568' }}>{isId ? 'Penutup (Nyanyi Bersama, Foto Bersama, Doa)' : 'Closing (Singing Together, Group Photos, Prayer)'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* VII. PAKET SPONSORSHIP - ASTOUNDING MASTERPIECE PAGE */}
                <View wrap={false} break style={{ marginBottom: 20 }}>
                    <Text style={[styles.sectionTitle, { fontSize: 20, textAlign: 'center', color: '#022c22', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 15 }]}>
                        {isId ? 'VII. Paket Sponsorship' : 'VII. Sponsorship Packages'}
                    </Text>
                    <Text style={[styles.bodyText, { textAlign: 'center', color: '#4A5568', fontStyle: 'italic', marginBottom: 20 }]}>
                        {isId 
                            ? 'Kami mengundang Bapak/Ibu untuk menjalin kemitraan eksklusif dalam perayaan HUT ke-16 Pelkat PKLU GPIB melalui pilihan paket sponsorship berikut:'
                            : 'We invite you to establish an exclusive partnership through our premium sponsorship packages:'}
                    </Text>

                    {/* PLATINUM CARD (FULL WIDTH) */}
                    <View style={{ backgroundColor: '#022c22', border: '1.5pt solid #D4AF37', borderRadius: 6, padding: 12, marginBottom: 10, position: 'relative', overflow: 'hidden' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5pt solid rgba(212, 175, 55, 0.3)', paddingBottom: 6, marginBottom: 8 }}>
                            <Text style={{ fontFamily: 'Helvetica', fontSize: 10, fontWeight: 'bold', color: '#D4AF37', letterSpacing: 2 }}>PLATINUM SPONSOR</Text>
                            <Text style={{ fontFamily: 'Times-Roman', fontSize: 13, fontWeight: 'bold', color: '#FDFBF7' }}>Rp 50.000.000 +</Text>
                        </View>
                        <Text style={{ fontFamily: 'Helvetica', fontSize: 8.0, color: '#FDFBF7', lineHeight: 1.45 }}>
                            {isId 
                                ? '• Logo ukuran utama (terbesar) pada Backdrop Utama, Spanduk Kegiatan, dan Buku Acara Elektronik.\n• Promosi produk eksklusif/pencantuman logo pada Media Publikasi Digital Panitia.\n• Penyebutan nama sponsor secara berkala oleh MC pada acara puncak.\n• Disediakan space Booth/ Ruang Promosi di area Bekasi Convention Center.\n• Penayangan Video Greeting/ Iklan singkat Sponsor pada layar utama kegiatan.\n• Dokumentasi khusus penyerahan plakat penghargaan & Laporan Pertanggungjawaban Kegiatan.' 
                                : '• Primary logo placement (largest) on Main Backdrop, Banner, and E-Booklet.\n• Exclusive promo / logo listing on Committee\'s Digital Publication Media.\n• Regular MC acknowledgement during the main event.\n• Dedicated Promo Booth space at Bekasi Convention Center.\n• Sponsor Video Greeting / short commercial display on main screens.\n• Special docs of plaque ceremony and official event report.'}
                        </Text>
                    </View>

                    {/* GOLD & SILVER ROW (2 COLUMNS) */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                        {/* GOLD CARD */}
                        <View style={{ width: '48.5%', backgroundColor: '#FDFBF7', border: '1pt solid #D4AF37', borderRadius: 6, padding: 10 }}>
                            <Text style={{ fontFamily: 'Helvetica', fontSize: 9, fontWeight: 'bold', color: '#D4AF37', letterSpacing: 1.5, marginBottom: 4 }}>GOLD SPONSOR</Text>
                            <Text style={{ fontFamily: 'Times-Roman', fontSize: 11.5, fontWeight: 'bold', color: '#022c22', borderBottom: '0.5pt solid rgba(2, 44, 34, 0.1)', paddingBottom: 4, marginBottom: 6 }}>Rp 25.000.000 - 49.999.999</Text>
                            <Text style={{ fontFamily: 'Helvetica', fontSize: 7.5, color: '#4A5568', lineHeight: 1.4 }}>
                                {isId 
                                    ? '• Logo pada Backdrop Utama & Spanduk.\n• Logo pada Buku Acara Elektronik.\n• Penyebutan nama sponsor oleh MC.\n• Pembagian materi promosi/bazar.\n• Laporan Pertanggungjawaban Kegiatan.' 
                                    : '• Logo on Main Backdrop & Banners.\n• Logo listing on Event E-Booklet.\n• MC mentions during main program.\n• Promo material distribution / bazaar.\n• Copy of event report.'}
                            </Text>
                        </View>

                        {/* SILVER CARD */}
                        <View style={{ width: '48.5%', backgroundColor: '#FFFFFF', border: '0.5pt solid rgba(2, 44, 34, 0.15)', borderRadius: 6, padding: 10 }}>
                            <Text style={{ fontFamily: 'Helvetica', fontSize: 9, fontWeight: 'bold', color: '#022c22', letterSpacing: 1.5, marginBottom: 4 }}>SILVER SPONSOR</Text>
                            <Text style={{ fontFamily: 'Times-Roman', fontSize: 11.5, fontWeight: 'bold', color: '#022c22', borderBottom: '0.5pt solid rgba(2, 44, 34, 0.1)', paddingBottom: 4, marginBottom: 6 }}>Rp 10.000.000 - 24.999.999</Text>
                            <Text style={{ fontFamily: 'Helvetica', fontSize: 7.5, color: '#4A5568', lineHeight: 1.4 }}>
                                {isId 
                                    ? '• Logo pada Media Publikasi tertentu.\n• Logo pada Buku Acara Elektronik.\n• Penyebutan nama sponsor oleh MC.\n• Pencantuman dalam daftar sponsor.' 
                                    : '• Logo on select publication media.\n• Logo listing on Event E-Booklet.\n• MC mentions during program.\n• Listing on official sponsor directory.'}
                            </Text>
                        </View>
                    </View>

                    {/* BRONZE, IN-KIND, DONATUR ROW (3 COLUMNS) */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        {/* BRONZE */}
                        <View style={{ width: '31.5%', backgroundColor: '#FFFFFF', border: '0.5pt solid rgba(2, 44, 34, 0.15)', borderRadius: 4, padding: 8 }}>
                            <Text style={{ fontFamily: 'Helvetica', fontSize: 8, fontWeight: 'bold', color: '#4A5568', marginBottom: 2 }}>BRONZE SPONSOR</Text>
                            <Text style={{ fontFamily: 'Times-Roman', fontSize: 9.5, fontWeight: 'bold', color: '#022c22', borderBottom: '0.5pt solid rgba(2, 44, 34, 0.1)', paddingBottom: 3, marginBottom: 4 }}>Rp 5.000.000 - 9.999.999</Text>
                            <Text style={{ fontFamily: 'Helvetica', fontSize: 7.0, color: '#718096', lineHeight: 1.3 }}>
                                {isId 
                                    ? '• Pencantuman nama/ logo.\n• Penyebutan oleh MC.\n• Dokumentasi Kegiatan.' 
                                    : '• Name/ logo listing.\n• MC mentions.\n• Copy of event photos.'}
                            </Text>
                        </View>

                        {/* IN-KIND */}
                        <View style={{ width: '31.5%', backgroundColor: '#FFFFFF', border: '0.5pt solid rgba(2, 44, 34, 0.15)', borderRadius: 4, padding: 8 }}>
                            <Text style={{ fontFamily: 'Helvetica', fontSize: 8, fontWeight: 'bold', color: '#4A5568', marginBottom: 2 }}>SPONSOR IN-KIND</Text>
                            <Text style={{ fontFamily: 'Times-Roman', fontSize: 9.5, fontWeight: 'bold', color: '#022c22', borderBottom: '0.5pt solid rgba(2, 44, 34, 0.1)', paddingBottom: 3, marginBottom: 4 }}>{isId ? 'Barang / Jasa' : 'Products / Services'}</Text>
                            <Text style={{ fontFamily: 'Helvetica', fontSize: 7.0, color: '#718096', lineHeight: 1.3 }}>
                                {isId 
                                    ? '• Kompensasi logo sesuai nilai barang/ jasa.\n• Penyebutan oleh MC.' 
                                    : '• Logo benefits adjusted to product value.\n• MC mentions.'}
                            </Text>
                        </View>

                        {/* DONATUR */}
                        <View style={{ width: '31.5%', backgroundColor: '#FFFFFF', border: '0.5pt solid rgba(2, 44, 34, 0.15)', borderRadius: 4, padding: 8 }}>
                            <Text style={{ fontFamily: 'Helvetica', fontSize: 8, fontWeight: 'bold', color: '#4A5568', marginBottom: 2 }}>PARTICIPATION</Text>
                            <Text style={{ fontFamily: 'Times-Roman', fontSize: 9.5, fontWeight: 'bold', color: '#022c22', borderBottom: '0.5pt solid rgba(2, 44, 34, 0.1)', paddingBottom: 3, marginBottom: 4 }}>{isId ? 'Sukarela' : 'Voluntary'}</Text>
                            <Text style={{ fontFamily: 'Helvetica', fontSize: 7.0, color: '#718096', lineHeight: 1.3 }}>
                                {isId 
                                    ? '• Pencantuman nama pendukung (opsional).\n• Ucapan Terima Kasih.' 
                                    : '• Listing on directory.\n• Thank you mention.'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* VIII. FORMAT RENCANA ANGGARAN BIAYA - SCALED UP TO FILL 1 PAGE */}
                <View break wrap={false} style={{ marginBottom: 20 }}>
                    <Text style={[styles.sectionTitle, { fontSize: 20, textAlign: 'center', color: '#022c22', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 15 }]}>
                        {isId ? 'VIII. Format Rencana Anggaran Biaya' : 'VIII. Budget Plan Format'}
                    </Text>
                    <Text style={[styles.bodyText, { textAlign: 'center', color: '#4A5568', fontStyle: 'italic', marginBottom: 20 }]}>
                        {isId
                            ? 'Rencana anggaran biaya operasional dan pelaksanaan kegiatan HUT ke-16 Pelkat PKLU GPIB secara keseluruhan:'
                            : 'Overall operational and implementation budget plan for the 16th Anniversary of Pelkat PKLU GPIB:'}
                    </Text>

                    <View style={{ border: '0.5pt solid rgba(2, 44, 34, 0.15)', borderRadius: 6, overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
                        <View style={{ width: '100%' }}>
                            <View style={{ flexDirection: 'row', backgroundColor: '#022c22', borderBottom: '1.5pt solid #D4AF37', paddingVertical: 10, paddingHorizontal: 12 }}>
                                <Text style={{ width: '8%', fontFamily: 'Helvetica', fontSize: 9.0, fontWeight: 'bold', color: '#D4AF37', textAlign: 'center' }}>NO</Text>
                                <Text style={{ width: '32%', fontFamily: 'Helvetica', fontSize: 9.0, fontWeight: 'bold', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: 0.5 }}>{isId ? 'KOMPONEN KEBUTUHAN' : 'REQUIREMENT COMPONENT'}</Text>
                                <Text style={{ width: '42%', fontFamily: 'Helvetica', fontSize: 9.0, fontWeight: 'bold', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: 0.5 }}>{isId ? 'RINCIAN' : 'DETAILS'}</Text>
                                <Text style={{ width: '18%', fontFamily: 'Helvetica', fontSize: 9.0, fontWeight: 'bold', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'right' }}>{isId ? 'ESTIMASI (Rp)' : 'ESTIMATE (Rp)'}</Text>
                            </View>

                            <View style={{ flexDirection: 'row', borderBottom: '0.5pt solid rgba(2, 44, 34, 0.08)', paddingVertical: 9, paddingHorizontal: 12, backgroundColor: 'rgba(2, 44, 34, 0.02)', alignItems: 'center' }}>
                                <Text style={{ width: '8%', fontFamily: 'Helvetica', fontSize: 9.0, textAlign: 'center', color: '#022c22' }}>1</Text>
                                <Text style={{ width: '32%', fontFamily: 'Helvetica', fontSize: 9.0, fontWeight: 'bold', color: '#022c22' }}>Sekretariat</Text>
                                <Text style={{ width: '42%', fontFamily: 'Helvetica', fontSize: 8.0, color: '#4A5568', lineHeight: 1.35 }}>Proposal, Surat-Menyurat, Pencetakan Dokumen, Seragam Panitia, Pelakat</Text>
                                <Text style={{ width: '18%', fontFamily: 'Times-Roman', fontSize: 9.5, fontWeight: 'bold', color: '#022c22', textAlign: 'right' }}>31.440.000</Text>
                            </View>

                            <View style={{ flexDirection: 'row', borderBottom: '0.5pt solid rgba(2, 44, 34, 0.08)', paddingVertical: 9, paddingHorizontal: 12, backgroundColor: '#FFFFFF', alignItems: 'center' }}>
                                <Text style={{ width: '8%', fontFamily: 'Helvetica', fontSize: 9.0, textAlign: 'center', color: '#022c22' }}>2</Text>
                                <Text style={{ width: '32%', fontFamily: 'Helvetica', fontSize: 9.0, fontWeight: 'bold', color: '#022c22' }}>Acara / Ibadah / Tamu</Text>
                                <Text style={{ width: '42%', fontFamily: 'Helvetica', fontSize: 8.0, color: '#4A5568', lineHeight: 1.35 }}>Webinar Pra HUT, Juri Lomba, Pelayan Firman, Pemusik, Alat Musik, MC, Hadiah Lomba, Transport Acara</Text>
                                <Text style={{ width: '18%', fontFamily: 'Times-Roman', fontSize: 9.5, fontWeight: 'bold', color: '#022c22', textAlign: 'right' }}>125.280.000</Text>
                            </View>

                            <View style={{ flexDirection: 'row', borderBottom: '0.5pt solid rgba(2, 44, 34, 0.08)', paddingVertical: 9, paddingHorizontal: 12, backgroundColor: 'rgba(2, 44, 34, 0.02)', alignItems: 'center' }}>
                                <Text style={{ width: '8%', fontFamily: 'Helvetica', fontSize: 9.0, textAlign: 'center', color: '#022c22' }}>3</Text>
                                <Text style={{ width: '32%', fontFamily: 'Helvetica', fontSize: 9.0, fontWeight: 'bold', color: '#022c22' }}>Konsumsi Peserta</Text>
                                <Text style={{ width: '42%', fontFamily: 'Helvetica', fontSize: 8.0, color: '#4A5568', lineHeight: 1.35 }}>Tempat Penyelenggaraan, Makan siang/ snack/ air mineral untuk ±600 Peserta, Konsumsi Tim Support</Text>
                                <Text style={{ width: '18%', fontFamily: 'Times-Roman', fontSize: 9.5, fontWeight: 'bold', color: '#022c22', textAlign: 'right' }}>247.100.000</Text>
                            </View>

                            <View style={{ flexDirection: 'row', borderBottom: '0.5pt solid rgba(2, 44, 34, 0.08)', paddingVertical: 9, paddingHorizontal: 12, backgroundColor: '#FFFFFF', alignItems: 'center' }}>
                                <Text style={{ width: '8%', fontFamily: 'Helvetica', fontSize: 9.0, textAlign: 'center', color: '#022c22' }}>4</Text>
                                <Text style={{ width: '32%', fontFamily: 'Helvetica', fontSize: 9.0, fontWeight: 'bold', color: '#022c22' }}>Dekorasi & Perlengkapan</Text>
                                <Text style={{ width: '42%', fontFamily: 'Helvetica', fontSize: 8.0, color: '#4A5568', lineHeight: 1.35 }}>Dekorasi Gedung, Soundsystem, Videotron, Lighting, Gong, Dekorasi Bunga, Koordinasi & Tempat Sampah</Text>
                                <Text style={{ width: '18%', fontFamily: 'Times-Roman', fontSize: 9.5, fontWeight: 'bold', color: '#022c22', textAlign: 'right' }}>51.250.000</Text>
                            </View>

                            <View style={{ flexDirection: 'row', borderBottom: '0.5pt solid rgba(2, 44, 34, 0.08)', paddingVertical: 9, paddingHorizontal: 12, backgroundColor: 'rgba(2, 44, 34, 0.02)', alignItems: 'center' }}>
                                <Text style={{ width: '8%', fontFamily: 'Helvetica', fontSize: 9.0, textAlign: 'center', color: '#022c22' }}>5</Text>
                                <Text style={{ width: '32%', fontFamily: 'Helvetica', fontSize: 9.0, fontWeight: 'bold', color: '#022c22' }}>Dokumentasi</Text>
                                <Text style={{ width: '42%', fontFamily: 'Helvetica', fontSize: 8.0, color: '#4A5568', lineHeight: 1.35 }}>Camera, Kabel, Baterai, Camcorder, Switcher, HDMI Wireless, Intercom</Text>
                                <Text style={{ width: '18%', fontFamily: 'Times-Roman', fontSize: 9.5, fontWeight: 'bold', color: '#022c22', textAlign: 'right' }}>19.150.000</Text>
                            </View>

                            <View style={{ flexDirection: 'row', borderBottom: '0.5pt solid rgba(2, 44, 34, 0.08)', paddingVertical: 9, paddingHorizontal: 12, backgroundColor: '#FFFFFF', alignItems: 'center' }}>
                                <Text style={{ width: '8%', fontFamily: 'Helvetica', fontSize: 9.0, textAlign: 'center', color: '#022c22' }}>6</Text>
                                <Text style={{ width: '32%', fontFamily: 'Helvetica', fontSize: 9.0, fontWeight: 'bold', color: '#022c22' }}>Humas & Publikasi</Text>
                                <Text style={{ width: '42%', fontFamily: 'Helvetica', fontSize: 8.0, color: '#4A5568', lineHeight: 1.35 }}>Pembuatan Konten Video Publikasi, Buku Kehadiran Peserta, Alat Tulis Kantor</Text>
                                <Text style={{ width: '18%', fontFamily: 'Times-Roman', fontSize: 9.5, fontWeight: 'bold', color: '#022c22', textAlign: 'right' }}>1.440.000</Text>
                            </View>

                            <View style={{ flexDirection: 'row', borderBottom: '0.5pt solid rgba(2, 44, 34, 0.08)', paddingVertical: 9, paddingHorizontal: 12, backgroundColor: 'rgba(2, 44, 34, 0.02)', alignItems: 'center' }}>
                                <Text style={{ width: '8%', fontFamily: 'Helvetica', fontSize: 9.0, textAlign: 'center', color: '#022c22' }}>7</Text>
                                <Text style={{ width: '32%', fontFamily: 'Helvetica', fontSize: 9.0, fontWeight: 'bold', color: '#022c22' }}>Usaha Dana</Text>
                                <Text style={{ width: '42%', fontFamily: 'Helvetica', fontSize: 8.0, color: '#4A5568', lineHeight: 1.35 }}>Souvenir/ Merchandise, Proposal, Nobar, Bazar</Text>
                                <Text style={{ width: '18%', fontFamily: 'Times-Roman', fontSize: 9.5, fontWeight: 'bold', color: '#022c22', textAlign: 'right' }}>56.000.000</Text>
                            </View>

                            <View style={{ flexDirection: 'row', borderBottom: '0.5pt solid rgba(2, 44, 34, 0.08)', paddingVertical: 9, paddingHorizontal: 12, backgroundColor: '#FFFFFF', alignItems: 'center' }}>
                                <Text style={{ width: '8%', fontFamily: 'Helvetica', fontSize: 9.0, textAlign: 'center', color: '#022c22' }}>8</Text>
                                <Text style={{ width: '32%', fontFamily: 'Helvetica', fontSize: 9.0, fontWeight: 'bold', color: '#022c22' }}>Kesehatan</Text>
                                <Text style={{ width: '42%', fontFamily: 'Helvetica', fontSize: 8.0, color: '#4A5568', lineHeight: 1.35 }}>Ambulance, Obat dan Alat Kesehatan</Text>
                                <Text style={{ width: '18%', fontFamily: 'Times-Roman', fontSize: 9.5, fontWeight: 'bold', color: '#022c22', textAlign: 'right' }}>4.725.000</Text>
                            </View>

                            <View style={{ flexDirection: 'row', borderBottom: '0.5pt solid rgba(2, 44, 34, 0.08)', paddingVertical: 9, paddingHorizontal: 12, backgroundColor: 'rgba(2, 44, 34, 0.02)', alignItems: 'center' }}>
                                <Text style={{ width: '8%', fontFamily: 'Helvetica', fontSize: 9.0, textAlign: 'center', color: '#022c22' }}>9</Text>
                                <Text style={{ width: '32%', fontFamily: 'Helvetica', fontSize: 9.0, fontWeight: 'bold', color: '#022c22' }}>Keamanan</Text>
                                <Text style={{ width: '42%', fontFamily: 'Helvetica', fontSize: 8.0, color: '#4A5568', lineHeight: 1.35 }}>Tim Support Keamanan Peserta</Text>
                                <Text style={{ width: '18%', fontFamily: 'Times-Roman', fontSize: 9.5, fontWeight: 'bold', color: '#022c22', textAlign: 'right' }}>1.400.000</Text>
                            </View>

                            <View style={{ flexDirection: 'row', backgroundColor: '#022c22', paddingVertical: 12, paddingHorizontal: 12, alignItems: 'center' }}>
                                <Text style={{ width: '82%', fontFamily: 'Helvetica', fontSize: 10.5, fontWeight: 'bold', color: '#D4AF37', textAlign: 'center' }}>{isId ? 'TOTAL ESTIMASI BIAYA' : 'TOTAL ESTIMATED COST'}</Text>
                                <Text style={{ width: '18%', fontFamily: 'Times-Roman', fontSize: 12.0, fontWeight: 'bold', color: '#FDFBF7', textAlign: 'right' }}>537.785.000</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* IX. FORMAT KOMITMEN SPONSORSHIP */}
                <View break style={{ marginTop: 20 }}>
                    <Text style={styles.sectionTitle}>{isId ? 'IX. Format Komitmen Sponsorship' : 'IX. Sponsorship Commitment Format'}</Text>

                    {data.contribution_value ? (
                        <>
                            <Text style={styles.bodyText}>
                                {isId ? 'Dengan kerendahan hati kami mengucapkan terima kasih atas komitmen dan dukungan yang Bapak/Ibu/Saudara berikan. Berikut adalah rincian data kemitraan resmi Anda yang telah tercatat dengan aman dalam sistem perbendaharaan kami.' : 'With humility, we thank you for your commitment and support. Below are the official details of your partnership, securely recorded in our treasury system.'}
                            </Text>

                            <View style={styles.vipCard}>
                                <Text style={styles.vipTitle}>{isId ? 'REKAMAN DUKUNGAN SPONSORSHIP' : 'SPONSORSHIP SUPPORT RECORD'}</Text>
                                
                                <View style={styles.vipRow}>
                                    <Text style={styles.vipLabel}>{isId ? 'Nomor Registrasi' : 'Registration Number'}</Text>
                                    <Text style={[styles.vipValue, { fontFamily: 'Helvetica', fontSize: 9.5 }]}>{data.number}</Text>
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
                                    <Text style={[styles.vipValue, { fontSize: 9, lineHeight: 1.5, fontStyle: 'italic' }]}>
                                        "{data.message || (isId ? 'Teruskan Baktimu!' : 'Continue Your Service!')}"
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.sealSection}>
                                <View style={styles.sealBox}>
                                    <Image src={qrImageUrl} style={styles.qrCodeSeal} />
                                    <Text style={styles.sealText}>
                                        {isId ? 'PINDAI UNTUK\nVERIFIKASI' : 'SCAN TO\nVERIFY'}
                                    </Text>
                                </View>
                                <View style={styles.sealBox}>
                                    <Image src={logoUrl} style={styles.qrCodeSeal} />
                                    <Text style={styles.sealText}>
                                        {isId ? 'TERUSKAN\nBAKTIMU' : 'CONTINUE\nYOUR SERVICE'}
                                    </Text>
                                </View>
                            </View>
                        </>
                    ) : (
                        <>
                            <Text style={[styles.bodyText, { marginBottom: 12 }]}>
                                {isId 
                                    ? 'Yang bertanda tangan di bawah ini menyatakan kesediaan untuk mendukung kegiatan Perayaan dan Ibadah Memperingati HUT ke-16 Pelkat PKLU GPIB:'
                                    : 'The undersigned hereby expresses the willingness to support the Celebration and Worship Commemorating the 16th Anniversary of Pelkat PKLU GPIB:'}
                            </Text>

                            <View style={{ border: '0.5pt solid rgba(2, 44, 34, 0.15)', borderRadius: 4, overflow: 'hidden', backgroundColor: '#FFFFFF', marginBottom: 15 }}>
                                {/* Row 1: Nama Perusahaan */}
                                <View style={{ flexDirection: 'row', borderBottom: '0.5pt solid rgba(2, 44, 34, 0.08)' }}>
                                    <Text style={{ width: '38%', padding: 8, fontFamily: 'Helvetica', fontSize: 8.5, fontWeight: 'bold', color: '#022c22', backgroundColor: 'rgba(2, 44, 34, 0.02)' }}>
                                        {isId ? 'Nama Perusahaan/ Lembaga/ Pribadi' : 'Company / Institution / Individual Name'}
                                    </Text>
                                    <View style={{ width: '62%', padding: 8, justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 8.0, color: '#A0AEC0' }}>..........................................................................................</Text>
                                    </View>
                                </View>

                                {/* Row 2: Nama Penanggung Jawab */}
                                <View style={{ flexDirection: 'row', borderBottom: '0.5pt solid rgba(2, 44, 34, 0.08)' }}>
                                    <Text style={{ width: '38%', padding: 8, fontFamily: 'Helvetica', fontSize: 8.5, fontWeight: 'bold', color: '#022c22', backgroundColor: 'rgba(2, 44, 34, 0.02)' }}>
                                        {isId ? 'Nama Penanggung Jawab' : 'Representative Name'}
                                    </Text>
                                    <View style={{ width: '62%', padding: 8, justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 8.0, color: '#A0AEC0' }}>..........................................................................................</Text>
                                    </View>
                                </View>

                                {/* Row 3: Jabatan */}
                                <View style={{ flexDirection: 'row', borderBottom: '0.5pt solid rgba(2, 44, 34, 0.08)' }}>
                                    <Text style={{ width: '38%', padding: 8, fontFamily: 'Helvetica', fontSize: 8.5, fontWeight: 'bold', color: '#022c22', backgroundColor: 'rgba(2, 44, 34, 0.02)' }}>
                                        {isId ? 'Jabatan' : 'Position'}
                                    </Text>
                                    <View style={{ width: '62%', padding: 8, justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 8.0, color: '#A0AEC0' }}>..........................................................................................</Text>
                                    </View>
                                </View>

                                {/* Row 4: Telepon / WA */}
                                <View style={{ flexDirection: 'row', borderBottom: '0.5pt solid rgba(2, 44, 34, 0.08)' }}>
                                    <Text style={{ width: '38%', padding: 8, fontFamily: 'Helvetica', fontSize: 8.5, fontWeight: 'bold', color: '#022c22', backgroundColor: 'rgba(2, 44, 34, 0.02)' }}>
                                        {isId ? 'Nomor Telepon/ WhatsApp' : 'Phone / WhatsApp Number'}
                                    </Text>
                                    <View style={{ width: '62%', padding: 8, justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 8.0, color: '#A0AEC0' }}>..........................................................................................</Text>
                                    </View>
                                </View>

                                {/* Row 5: Email */}
                                <View style={{ flexDirection: 'row', borderBottom: '0.5pt solid rgba(2, 44, 34, 0.08)' }}>
                                    <Text style={{ width: '38%', padding: 8, fontFamily: 'Helvetica', fontSize: 8.5, fontWeight: 'bold', color: '#022c22', backgroundColor: 'rgba(2, 44, 34, 0.02)' }}>
                                        Email
                                    </Text>
                                    <View style={{ width: '62%', padding: 8, justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 8.0, color: '#A0AEC0' }}>..........................................................................................</Text>
                                    </View>
                                </View>

                                {/* Row 6: Bentuk Dukungan */}
                                <View style={{ flexDirection: 'row', borderBottom: '0.5pt solid rgba(2, 44, 34, 0.08)' }}>
                                    <Text style={{ width: '38%', padding: 8, fontFamily: 'Helvetica', fontSize: 8.5, fontWeight: 'bold', color: '#022c22', backgroundColor: 'rgba(2, 44, 34, 0.02)' }}>
                                        {isId ? 'Bentuk Dukungan' : 'Support Type'}
                                    </Text>
                                    <View style={{ width: '62%', padding: 8, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 7.5, color: '#022c22', marginRight: 8 }}>[  ] Platinum</Text>
                                        <Text style={{ fontSize: 7.5, color: '#022c22', marginRight: 8 }}>[  ] Gold</Text>
                                        <Text style={{ fontSize: 7.5, color: '#022c22', marginRight: 8 }}>[  ] Silver</Text>
                                        <Text style={{ fontSize: 7.5, color: '#022c22', marginRight: 8 }}>[  ] Bronze</Text>
                                        <Text style={{ fontSize: 7.5, color: '#022c22', marginRight: 8 }}>[  ] In-Kind</Text>
                                        <Text style={{ fontSize: 7.5, color: '#022c22' }}>[  ] Donatur</Text>
                                    </View>
                                </View>

                                {/* Row 7: Nilai / Bentuk Dukungan */}
                                <View style={{ flexDirection: 'row' }}>
                                    <Text style={{ width: '38%', padding: 8, fontFamily: 'Helvetica', fontSize: 8.5, fontWeight: 'bold', color: '#022c22', backgroundColor: 'rgba(2, 44, 34, 0.02)' }}>
                                        {isId ? 'Nilai / Bentuk Dukungan' : 'Support Value / Details'}
                                    </Text>
                                    <View style={{ width: '62%', padding: 8, justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 8.0, color: '#A0AEC0' }}>..........................................................................................</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Signatures for commitment form */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingHorizontal: 20 }}>
                                <View style={{ alignItems: 'center', width: '40%' }}>
                                    <Text style={{ fontSize: 8.0, color: '#4A5568', marginBottom: 35 }}>{isId ? 'Panitia Pelaksana' : 'Organizing Committee'}</Text>
                                    <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica', fontWeight: 'bold', color: '#022c22' }}>( ........................................ )</Text>
                                </View>
                                <View style={{ alignItems: 'center', width: '40%' }}>
                                    <Text style={{ fontSize: 8.0, color: '#4A5568', marginBottom: 35 }}>{isId ? 'Perwakilan Donatur / Sponsor' : 'Sponsor / Donor Representative'}</Text>
                                    <Text style={{ fontSize: 8.5, fontFamily: 'Helvetica', fontWeight: 'bold', color: '#022c22' }}>( ........................................ )</Text>
                                </View>
                            </View>

                            {/* Digital Commitment Info Card */}
                            <View style={{ border: '0.5pt dashed #D4AF37', borderRadius: 4, padding: 8, backgroundColor: '#FDFBF7', marginTop: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View style={{ width: '70%' }}>
                                    <Text style={{ fontFamily: 'Helvetica', fontSize: 8.0, fontWeight: 'bold', color: '#022c22', marginBottom: 3 }}>
                                        {isId ? 'KIRIM KOMITMEN DIGITAL (PRAKTIS)' : 'SUBMIT DIGITAL COMMITMENT'}
                                    </Text>
                                    <Text style={{ fontFamily: 'Helvetica', fontSize: 7.0, color: '#718096', lineHeight: 1.3 }}>
                                        {isId
                                            ? 'Untuk kemudahan administrasi, Anda dapat memindai QR Code di sebelah kanan untuk langsung mengirimkan komitmen sponsorship ini via WhatsApp ke nomor Sekretariat Panitia.'
                                            : 'For administrative convenience, you can scan the QR code to submit this commitment directly via WhatsApp to our Secretariat.'}
                                    </Text>
                                </View>
                                <View style={{ width: '25%', alignItems: 'center' }}>
                                    <Image src={commitmentWaQrUrl} style={{ width: 45, height: 45, marginBottom: 2 }} />
                                    <Text style={{ fontSize: 5.0, color: '#022c22', fontWeight: 'bold' }}>SCAN WA</Text>
                                </View>
                            </View>
                        </>
                    )}
                </View>

                {/* X. PENUTUP & Signatures - FORCED BREAK */}
                <View wrap={false} break>
                    <Text style={styles.sectionTitle}>{isId ? 'X. Penutup' : 'X. Closing'}</Text>
                    <Text style={styles.bodyText}>
                        {isId ? 'Demikian proposal sponsorship ini disusun sebagai dasar permohonan dukungan dan kerja sama dalam rangka Perayaan dan Ibadah Memperingati HUT ke-16 Pelkat PKLU GPIB.' : 'Thus this sponsorship proposal is prepared as a basis for requesting support and cooperation in the context of the Celebration and Worship Commemorating the 16th Anniversary of Pelkat PKLU GPIB.'}
                    </Text>
                    <Text style={styles.bodyText}>
                        {isId ? 'Kami percaya bahwa dukungan Bapak/Ibu/Saudara/i serta lembaga yang dipimpin akan menjadi bagian penting dalam pelayanan bagi kaum lanjut usia. Dukungan tersebut bukan hanya membantu terselenggaranya kegiatan, tetapi juga menjadi wujud nyata kepedulian terhadap peran lansia sebagai pribadi yang tetap dapat berkarya, melayani, dan menjadi teladan.' : 'We believe that the support of Mr/Ms and the institution you lead will be an important part of the service for the elderly. The support not only helps the implementation of the activity, but also becomes a tangible manifestation of concern for the role of the elderly as individuals who can still work, serve, and be role models.'}
                    </Text>
                    
                    <Text style={[styles.bodyText, { textAlign: 'center', marginTop: 15, marginBottom: 20 }]}>
                        {isId ? 'Atas perhatian, dukungan, dan kerja sama yang diberikan, kami menyampaikan terima kasih.' : 'For the attention, support, and cooperation given, we express our gratitude.'}
                    </Text>

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
