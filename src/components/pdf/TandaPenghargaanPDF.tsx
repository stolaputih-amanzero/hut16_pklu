import {
    Document, Page, Text, View, StyleSheet, Image, Font
} from '@react-pdf/renderer'

// Define the dummy verification URL base
const VERIFY_BASE_URL = 'https://hut16pklu.org/verify/TKN-'

const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: '#fefdf5', // Soft ivory paper color
    },
    outerBorder: {
        border: '3pt solid #D4AF37', // Gold outer border
        padding: 4,
        height: '100%',
    },
    innerBorder: {
        border: '1pt solid #022c22', // Emerald inner border
        padding: 30,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    header: { alignItems: 'center', marginBottom: 25 },
    logo: { width: 70, height: 70, marginBottom: 15 },
    title: { 
        fontFamily: 'Times-Roman',
        fontSize: 28, 
        fontWeight: 'extrabold', 
        color: '#022c22', // Emerald Green
        textAlign: 'center',
        letterSpacing: 2
    },
    subtitle: { 
        fontFamily: 'Helvetica',
        fontSize: 10, 
        color: '#D4AF37', 
        textAlign: 'center', 
        marginTop: 6,
        letterSpacing: 1,
        textTransform: 'uppercase'
    },
    body: { marginVertical: 15, flexGrow: 1, justifyContent: 'center' },
    text: { 
        fontFamily: 'Times-Roman',
        fontSize: 14, 
        lineHeight: 1.6, 
        textAlign: 'center', 
        marginBottom: 10,
        color: '#1f2937'
    },
    name: { 
        fontFamily: 'Times-Roman',
        fontSize: 32, 
        color: '#D4AF37', // Gold
        textAlign: 'center', 
        marginVertical: 15,
        fontStyle: 'italic'
    },
    category: { 
        fontFamily: 'Helvetica-Bold',
        fontSize: 16, 
        color: '#022c22', 
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginVertical: 10
    },
    footerContainer: {
        marginTop: 'auto',
    },
    footer: { 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 20
    },
    signatureBlock: { 
        alignItems: 'center', 
        width: 180 
    },
    dateText: {
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#475569',
        marginBottom: 4
    },
    signatureTitle: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 10,
        color: '#022c22',
        marginBottom: 10
    },
    signatureLine: { 
        width: 160, 
        borderBottom: '1pt solid #D4AF37', 
        marginBottom: 6 
    },
    signatureName: { 
        fontFamily: 'Helvetica-Bold',
        fontSize: 11, 
        color: '#022c22'
    },
    signatureRole: { 
        fontFamily: 'Helvetica',
        fontSize: 9,
        color: '#475569'
    },
    qrContainer: {
        alignItems: 'center',
        width: 120
    },
    qrCode: {
        width: 70,
        height: 70,
        marginBottom: 6
    },
    qrText: {
        fontFamily: 'Helvetica',
        fontSize: 7,
        color: '#64748b',
        textAlign: 'center'
    }
})

interface Props {
    data: any
    lang: 'id' | 'en'
    logoUrl?: string
}

export function TandaPenghargaanPDF({ data, lang, logoUrl }: Props) {
    const isId = lang === 'id'
    const categoryMap: Record<string, string> = {
        sahabat_bakti: 'Sahabat Bakti',
        sahabat_teladan: 'Sahabat Teladan',
        sahabat_pelayanan: 'Sahabat Pelayanan',
        sahabat_berkat: 'Sahabat Berkat',
        sahabat_kasih: 'Sahabat Kasih',
        anonim: isId ? 'Sahabat Sukacita' : 'Joyful Friend',
    }
    
    let categoryLabel = categoryMap[data.donatur_category] || data.donatur_category
    if (!isId && data.donatur_category !== 'anonim') {
         // Fallback translations if it's English and wasn't manually translated in the map
         categoryLabel = categoryLabel.replace('Sahabat', 'Friend of').replace('Bakti', 'Devotion').replace('Teladan', 'Excellence').replace('Pelayanan', 'Service').replace('Berkat', 'Blessing').replace('Kasih', 'Love')
    }

    const committeeName = data.committees?.name || 'Vrilly Rondonuwu'
    const committeeRole = data.committees?.role || (isId ? 'Ketua Panitia' : 'Committee Chairperson')
    
    // Generate dummy verification URL
    const verifyUrl = `${VERIFY_BASE_URL}${data.id || '0000-0000'}`
    const qrImageUrl = `https://quickchart.io/qr?text=${encodeURIComponent(verifyUrl)}&size=150&margin=1`

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                <View style={styles.outerBorder}>
                    <View style={styles.innerBorder}>
                        
                        {/* Header */}
                        <View style={styles.header}>
                            {logoUrl ? (
                                <Image src={logoUrl} style={styles.logo} />
                            ) : (
                                <Image src="/logo-hut16.png" style={styles.logo} />
                            )}
                            <Text style={styles.title}>
                                {isId ? 'TANDA PENGHARGAAN' : 'TOKEN OF APPRECIATION'}
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
                                ★ {categoryLabel} ★
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
                                {/* QR Code Signature for Verification */}
                                <View style={styles.qrContainer}>
                                    <Image src={qrImageUrl} style={styles.qrCode} />
                                    <Text style={styles.qrText}>
                                        {isId ? 'PINDAI UNTUK VERIFIKASI' : 'SCAN TO VERIFY'}
                                    </Text>
                                    <Text style={styles.qrText}>
                                        {isId ? 'KEASLIAN DOKUMEN' : 'AUTHENTICITY'}
                                    </Text>
                                </View>

                                {/* Committee Signature */}
                                <View style={styles.signatureBlock}>
                                    <Text style={styles.dateText}>
                                        {isId ? 'Bekasi, 12 Oktober 2026' : 'Bekasi, October 12, 2026'}
                                    </Text>
                                    <Text style={styles.signatureTitle}>
                                        {isId ? 'Panitia HUT ke-16 PKLU GPIB' : '16th Anniversary Committee'}
                                    </Text>
                                    <View style={{ height: 40 }} /> {/* Spacing for physical signature if printed */}
                                    <View style={styles.signatureLine} />
                                    <Text style={styles.signatureName}>{committeeName}</Text>
                                    <Text style={styles.signatureRole}>{committeeRole}</Text>
                                </View>
                            </View>
                        </View>

                    </View>
                </View>
            </Page>
        </Document>
    )
}