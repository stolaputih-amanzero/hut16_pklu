import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
    page: {
        padding: 30,
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
        color: '#1a1a1a',
    },
    backgroundLogo: {
        position: 'absolute',
        top: 150,
        left: 270,
        width: 300,
        height: 300,
        opacity: 0.03,
        zIndex: -1,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        width: 50,
        height: 50,
        marginBottom: 10,
    },
    title: {
        fontFamily: 'Times-Bold',
        fontSize: 14,
        color: '#022c22',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    subtitle: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 11,
        color: '#022c22',
        textAlign: 'center',
        marginBottom: 4,
    },
    organization: {
        fontFamily: 'Helvetica',
        fontSize: 9,
        color: '#4b5563',
        textAlign: 'center',
    },
    sectionTitle: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 12,
        color: '#022c22',
        borderBottom: '2pt solid #D4AF37',
        paddingBottom: 4,
        marginBottom: 12,
        textTransform: 'uppercase',
        marginTop: 15,
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    summaryBox: {
        border: '1pt solid #cbd5e1',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#f8fafc',
        width: '48%',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
        borderBottom: '0.5pt solid #e2e8f0',
        paddingBottom: 4,
    },
    summaryLabel: {
        fontSize: 9,
        color: '#475569',
    },
    summaryValue: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: '#0f172a',
    },
    table: {
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#022c22',
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    tableRow: {
        flexDirection: 'row',
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: '#022c22',
    },
    tableColNo: { width: '5%', borderStyle: 'solid', borderWidth: 1, borderColor: '#022c22', borderLeftWidth: 0, borderTopWidth: 0 },
    tableColCode: { width: '12%', borderStyle: 'solid', borderWidth: 1, borderColor: '#022c22', borderLeftWidth: 0, borderTopWidth: 0 },
    tableColMode: { width: '10%', borderStyle: 'solid', borderWidth: 1, borderColor: '#022c22', borderLeftWidth: 0, borderTopWidth: 0 },
    tableColName: { width: '22%', borderStyle: 'solid', borderWidth: 1, borderColor: '#022c22', borderLeftWidth: 0, borderTopWidth: 0 },
    tableColChurch: { width: '23%', borderStyle: 'solid', borderWidth: 1, borderColor: '#022c22', borderLeftWidth: 0, borderTopWidth: 0 },
    tableColContact: { width: '12%', borderStyle: 'solid', borderWidth: 1, borderColor: '#022c22', borderLeftWidth: 0, borderTopWidth: 0 },
    tableColQty: { width: '10%', borderStyle: 'solid', borderWidth: 1, borderColor: '#022c22', borderLeftWidth: 0, borderTopWidth: 0 },
    tableColTime: { width: '6%', borderStyle: 'solid', borderWidth: 1, borderColor: '#022c22', borderLeftWidth: 0, borderTopWidth: 0 },
    
    tableCellHeader: { margin: 4, fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#ffffff', textAlign: 'center' },
    tableCell: { margin: 4, fontSize: 7, color: '#1f2937' },
    tableCellCenter: { margin: 4, fontSize: 7, color: '#1f2937', textAlign: 'center' },
    tableCellBold: { margin: 4, fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#022c22' },
    
    emptyState: { padding: 15, textAlign: 'center', fontSize: 8, color: '#6b7280', borderBottom: '1pt solid #022c22', borderRight: '1pt solid #022c22' },
    
    footer: {
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 20,
    },
    signatureBox: {
        width: 120,
        alignItems: 'center',
    },
    signatureTitle: {
        fontSize: 8,
        marginBottom: 35,
        color: '#1f2937',
    },
    signatureLine: {
        width: '100%',
        borderBottom: '1pt solid #1f2937',
        marginBottom: 4,
    },
    signatureName: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 8.5,
        color: '#1f2937',
    },
    qrBox: {
        width: 80,
        alignItems: 'center',
    },
    qrCode: {
        width: 45,
        height: 45,
        marginBottom: 4,
    },
    qrTextBold: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 5.5,
        color: '#6b7280',
        letterSpacing: 1,
    },
    qrText: {
        fontSize: 5.5,
        color: '#6b7280',
        marginTop: 2,
    }
})

interface Props {
    registrations: any[]
    logoUrl?: string
    origin?: string
    stats: {
        totalRegistrations: number
        totalHeadcount: number
        totalPeserta: number
        totalPendamping: number
        umum: number
        tuanRumah: number
    }
}

export function CheckInReportPDF({ registrations, logoUrl = "/logo_hut16_pklu.png", origin = "https://pklu.amanloka.com", stats }: Props) {
    const qrImageUrl = `https://quickchart.io/qr?size=150&text=${encodeURIComponent(origin + '/admin/checkin')}`
    const currentDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })

    return (
        <Document>
            <Page size="A4" style={styles.page} orientation="landscape">
                {/* Watermark Logo */}
                <Image src={logoUrl} style={styles.backgroundLogo} />

                {/* Header */}
                <View style={styles.header}>
                    <Image src={logoUrl} style={styles.logo} />
                    <Text style={styles.title}>Laporan Kehadiran Peserta (Cek In)</Text>
                    <Text style={styles.subtitle}>Temu Pelayanan Kategorial Lanjut Usia (PKLU) GPIB 2026</Text>
                    <Text style={styles.organization}>HUT ke-16 Pelayanan Kategorial Lanjut Usia (PKLU) • Bekasi Convention Center</Text>
                </View>

                {/* Summary Section */}
                <Text style={styles.sectionTitle}>Ringkasan Kehadiran</Text>
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryBox}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total Transaksi Cek In</Text>
                            <Text style={styles.summaryValue}>{stats.totalRegistrations} Form</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total Hadir Aktual (Headcount)</Text>
                            <Text style={[styles.summaryValue, { color: '#047857' }]}>{stats.totalHeadcount} Jiwa</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Peserta Hadir</Text>
                            <Text style={styles.summaryValue}>{stats.totalPeserta} Orang</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Pendamping Hadir</Text>
                            <Text style={styles.summaryValue}>{stats.totalPendamping} Orang</Text>
                        </View>
                    </View>

                    <View style={styles.summaryBox}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Hadir Kategori Umum (Luar Bekasi)</Text>
                            <Text style={styles.summaryValue}>{stats.umum} Orang</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Hadir Kategori Tuan Rumah (Bekasi)</Text>
                            <Text style={styles.summaryValue}>{stats.tuanRumah} Orang</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Waktu Unduh Laporan</Text>
                            <Text style={styles.summaryValue}>{currentDate}</Text>
                        </View>
                    </View>
                </View>

                {/* Table Section */}
                <View break>
                    <Text style={styles.sectionTitle}>Daftar Hadir Terverifikasi</Text>
                    <View style={styles.table}>
                        <View style={styles.tableHeaderRow} fixed>
                            <View style={styles.tableColNo}><Text style={styles.tableCellHeader}>No.</Text></View>
                            <View style={styles.tableColCode}><Text style={styles.tableCellHeader}>Kode</Text></View>
                            <View style={styles.tableColMode}><Text style={styles.tableCellHeader}>Mode</Text></View>
                            <View style={styles.tableColName}><Text style={styles.tableCellHeader}>Nama / PIC</Text></View>
                            <View style={styles.tableColChurch}><Text style={styles.tableCellHeader}>Asal Jemaat (Mupel)</Text></View>
                            <View style={styles.tableColContact}><Text style={styles.tableCellHeader}>WhatsApp</Text></View>
                            <View style={styles.tableColQty}><Text style={styles.tableCellHeader}>Kehadiran</Text></View>
                            <View style={styles.tableColTime}><Text style={styles.tableCellHeader}>Cek In</Text></View>
                        </View>

                        {registrations.length === 0 ? (
                            <Text style={styles.emptyState}>Belum ada data check-in.</Text>
                        ) : (
                            registrations.map((r: any, idx: number) => {
                                const name = r.registration_mode === "Mandiri" ? r.full_name : r.pic_name
                                const church = r.church_name ? `${r.church_name} (${r.mupel || ''})` : '-'
                                
                                const timeStr = r.checked_in_at 
                                    ? new Date(r.checked_in_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }) + ' WIB'
                                    : '-'

                                const qtyStr = r.registration_mode === "Mandiri" 
                                    ? (r.type === "Peserta" ? "1 Peserta" : "1 Pendamping") 
                                    : `${r.checked_in_participants || 0}P / ${r.checked_in_companions || 0}D`
                                
                                return (
                                    <View style={styles.tableRow} key={r.id || idx} wrap={false}>
                                        <View style={styles.tableColNo}><Text style={styles.tableCellCenter}>{idx + 1}</Text></View>
                                        <View style={styles.tableColCode}><Text style={styles.tableCellBold}>{r.registration_code}</Text></View>
                                        <View style={styles.tableColMode}><Text style={styles.tableCell}>{r.registration_mode}</Text></View>
                                        <View style={styles.tableColName}><Text style={styles.tableCellBold}>{name}</Text></View>
                                        <View style={styles.tableColChurch}><Text style={styles.tableCell}>{church}</Text></View>
                                        <View style={styles.tableColContact}><Text style={styles.tableCellCenter}>{r.whatsapp_number || '-'}</Text></View>
                                        <View style={styles.tableColQty}><Text style={styles.tableCellCenter}>{qtyStr}</Text></View>
                                        <View style={styles.tableColTime}><Text style={styles.tableCellCenter}>{timeStr}</Text></View>
                                    </View>
                                )
                            })
                        )}
                    </View>
                </View>

                {/* Signatures */}
                <View style={styles.footer} wrap={false}>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureTitle}>Diverifikasi oleh,</Text>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureName}>Sekretariat Panitia</Text>
                        <Text style={styles.organization}>HUT 16 PKLU</Text>
                    </View>

                    <View style={styles.qrBox}>
                        <Image src={qrImageUrl} style={styles.qrCode} />
                        <Text style={styles.qrTextBold}>DAFTAR HADIR</Text>
                        <Text style={styles.qrText}>HUT PKLU 16</Text>
                    </View>

                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureTitle}>Mengetahui,</Text>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureName}>Vrilly Rondonuwu</Text>
                        <Text style={styles.organization}>Ketua Panitia</Text>
                    </View>
                </View>
            </Page>
        </Document>
    )
}
