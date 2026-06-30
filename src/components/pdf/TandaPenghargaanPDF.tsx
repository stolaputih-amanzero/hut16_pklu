import {
    Document, Page, Text, View, StyleSheet, Image, Font
} from '@react-pdf/renderer'

// Premium Redesign
const styles = StyleSheet.create({
    page: {
        padding: 30,
        backgroundColor: '#FAFAF7', // Extremely subtle ivory
    },
    backgroundLogo: {
        position: 'absolute',
        top: '25%',
        left: '35%',
        width: '30%',
        opacity: 0.03, // Very subtle watermark
    },
    outerBorder: {
        border: '3pt solid #D4AF37',
        padding: 4,
        height: '100%',
    },
    innerBorder: {
        border: '1pt solid #D4AF37',
        padding: 20,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
    },
    header: { alignItems: 'center', marginBottom: 10 },
    logo: { width: 70, height: 70, marginBottom: 10, objectFit: 'contain' },
    title: { 
        fontFamily: 'Times-Bold',
        fontSize: 32, 
        color: '#022c22', // Deep Emerald
        textAlign: 'center',
        letterSpacing: 4,
        textTransform: 'uppercase',
        marginBottom: 4
    },
    subtitle: { 
        fontFamily: 'Helvetica',
        fontSize: 9, 
        color: '#D4AF37', 
        textAlign: 'center', 
        letterSpacing: 2,
        textTransform: 'uppercase'
    },
    body: { marginVertical: 10, flexGrow: 1, justifyContent: 'center' },
    text: { 
        fontFamily: 'Times-Roman',
        fontSize: 13, 
        lineHeight: 1.5, 
        textAlign: 'center', 
        color: '#334155',
        marginBottom: 6,
        paddingHorizontal: 40
    },
    name: { 
        fontFamily: 'Times-BoldItalic',
        fontSize: 34, 
        color: '#D4AF37', 
        textAlign: 'center', 
        marginVertical: 10,
        letterSpacing: 1
    },
    category: { 
        fontFamily: 'Helvetica-Bold',
        fontSize: 14, 
        color: '#022c22', 
        textAlign: 'center', 
        marginVertical: 10,
        letterSpacing: 3,
        textTransform: 'uppercase'
    },
    footerContainer: {
        marginTop: 'auto',
        paddingTop: 5
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        gap: 20
    },
    signatureBlock: {
        alignItems: 'center',
        width: 170
    },
    dateText: { 
        fontFamily: 'Times-Roman',
        fontSize: 11, 
        color: '#475569',
        marginBottom: 6
    },
    signatureTitle: { 
        fontFamily: 'Helvetica-Bold',
        fontSize: 10, 
        color: '#022c22',
        marginBottom: 35
    },
    signatureLine: {
        borderBottom: '1pt solid #022c22',
        width: '100%',
        marginBottom: 4
    },
    signatureName: { 
        fontFamily: 'Helvetica-Bold',
        fontSize: 11, 
        color: '#022c22'
    },
    signatureRole: { 
        fontFamily: 'Helvetica',
        fontSize: 8,
        color: '#475569'
    },
    qrContainer: {
        alignItems: 'center',
        width: 100,
        padding: 6,
        border: '1pt solid #e2e8f0',
        backgroundColor: '#ffffff',
        borderRadius: 8,
        marginBottom: 0
    },
    qrCode: {
        width: 70,
        height: 70,
        marginBottom: 4
    },
    qrText: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 6,
        color: '#022c22',
        textAlign: 'center',
        letterSpacing: 1
    },
    qrSubText: {
        fontFamily: 'Helvetica',
        fontSize: 5,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 2
    }
})

interface Props {
    data: any
    lang: 'id' | 'en'
    logoUrl?: string
    origin?: string
}

export function TandaPenghargaanPDF({ data, lang, logoUrl, origin }: Props) {
    const isId = lang === 'id'
    const categoryMap: Record<string, string> = {
        sahabat_bakti: 'Sahabat Bakti',
        sahabat_teladan: 'Sahabat Teladan',
        sahabat_pelayanan: 'Sahabat Pelayanan',
        sahabat_berkat: 'Sahabat Berkat',
        sahabat_kasih: 'Sahabat Kasih',
        anonim: isId ? 'Sahabat Sukacita' : 'Joyful Friend',
        platinum: 'Platinum Sponsor',
        gold: isId ? 'Sponsor Emas' : 'Gold Sponsor',
        silver: isId ? 'Sponsor Perak' : 'Silver Sponsor',
        bronze: isId ? 'Sponsor Perunggu' : 'Bronze Sponsor',
        in_kind: isId ? 'Dukungan In-Kind' : 'In-Kind Support',
        donatur: isId ? 'Partisipasi' : 'Participation'
    }

    const categoryKey = data.donatur_category || data.sponsor_package || 'donatur'
    const categoryLabel = categoryMap[categoryKey] || categoryKey
    const committeeName = data.committees?.name || 'Adriaan Vanie Maggy Tomasouw'
    const committeeRole = data.committees?.role || (isId ? 'Ketua Panitia' : 'Committee Chairperson')
    
    // Fix QR URL: No 'TKN-' prefix in the URL path, verify/[id] expects exactly the UUID
    const baseUrl = origin || 'https://hut16pklu.org'
    const verifyUrl = `${baseUrl}/verify/${data.id || '0000-0000'}`
    const qrImageUrl = `https://quickchart.io/qr?text=${encodeURIComponent(verifyUrl)}&size=200&margin=1&dark=022c22`

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                <View style={styles.outerBorder}>
                    <View style={styles.innerBorder}>
                        
                        {/* Background Watermark */}
                        {logoUrl && <Image src={logoUrl} style={styles.backgroundLogo} />}

                        {/* Header */}
                        <View style={styles.header}>
                            {logoUrl ? (
                                <Image src={logoUrl} style={styles.logo} />
                            ) : (
                                <Image src="/logo-hut16.png" style={styles.logo} />
                            )}
                            <Text style={styles.title}>
                                {isId ? 'Tanda Penghargaan' : 'Token of Appreciation'}
                            </Text>
                            <Text style={styles.subtitle}>
                                {isId ? 'HUT KE-16 PELKAT PKLU GPIB • "TERUSKAN BAKTIMU!"' : '16TH ANNIVERSARY OF PKLU GPIB • "CONTINUE YOUR SERVICE!"'}
                            </Text>
                        </View>

                        {/* Body */}
                        <View style={styles.body}>
                            <Text style={styles.text}>
                                {isId 
                                    ? 'Dengan penuh syukur dan apresiasi yang mendalam, Panitia HUT ke-16 Pelkat PKLU GPIB mempersembahkan penghargaan ini kepada:'
                                    : 'With profound gratitude and deepest appreciation, the 16th Anniversary Committee of Pelkat PKLU GPIB presents this honor to:'}
                            </Text>

                            <Text style={styles.name}>{data.display_name || data.name}</Text>

                            <Text style={styles.text}>
                                {isId 
                                    ? 'Sebagai pengakuan atas dukungan kasih dan dedikasi luar biasa yang telah diberikan sebagai'
                                    : 'In formal recognition of the extraordinary generosity and loving support provided as'}
                            </Text>

                            <Text style={styles.category}>
                                {categoryLabel}
                            </Text>

                            <Text style={styles.text}>
                                {isId 
                                    ? 'dalam mensukseskan Perayaan dan Ibadah Memperingati HUT ke-16 Pelkat PKLU GPIB pada tanggal 12 Oktober 2026 di Bekasi Convention Center.'
                                    : 'in ensuring the success of the 16th Anniversary Celebration and Worship of Pelkat PKLU GPIB on October 12, 2026, at Bekasi Convention Center.'}
                            </Text>
                        </View>

                        {/* Footer Signatures */}
                        <View style={styles.footerContainer}>
                            <View style={styles.footer}>
                                {/* Left Signature */}
                                <View style={styles.signatureBlock}>
                                    <Text style={styles.dateText}>
                                        {isId ? 'Bekasi, 12 Oktober 2026' : 'Bekasi, October 12, 2026'}
                                    </Text>
                                    <Text style={styles.signatureTitle}>
                                        {isId ? 'Ketua Panitia' : 'Committee Chairperson'}
                                    </Text>
                                    <View style={styles.signatureLine} />
                                    <Text style={styles.signatureName}>Vrilly Rondonuwu</Text>
                                    <Text style={styles.signatureRole}>{isId ? 'Panitia HUT ke-16 PKLU' : '16th PKLU Committee'}</Text>
                                </View>

                                {/* QR Code Signature for Verification */}
                                <View style={styles.qrContainer}>
                                    <Image src={qrImageUrl} style={styles.qrCode} />
                                    <Text style={styles.qrText}>
                                        {isId ? 'PINDAI VERIFIKASI' : 'SCAN TO VERIFY'}
                                    </Text>
                                    <Text style={styles.qrSubText}>
                                        {isId ? 'KEASLIAN DOKUMEN' : 'AUTHENTICITY'}
                                    </Text>
                                </View>

                                {/* Right Signature */}
                                <View style={styles.signatureBlock}>
                                    <Text style={styles.dateText}> </Text>
                                    <Text style={styles.signatureTitle}>
                                        {isId ? 'Sekretaris' : 'Secretary'}
                                    </Text>
                                    <View style={styles.signatureLine} />
                                    <Text style={styles.signatureName}>Vevi Mayo</Text>
                                    <Text style={styles.signatureRole}>{isId ? 'Panitia HUT ke-16 PKLU' : '16th PKLU Committee'}</Text>
                                </View>
                            </View>
                        </View>

                    </View>
                </View>
            </Page>
        </Document>
    )
}