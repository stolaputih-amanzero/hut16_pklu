import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
        color: '#1a1a1a',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2pt solid #022c22',
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
    companyName: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 10,
        color: '#022c22',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    companySub: {
        fontSize: 7.5,
        color: '#4b5563',
        marginTop: 2,
    },
    invoiceTitleContainer: {
        alignItems: 'flex-end',
    },
    invoiceTitle: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 18,
        color: '#022c22',
        textTransform: 'uppercase',
    },
    invoiceNumber: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 9,
        color: '#D4AF37',
        marginTop: 4,
    },
    detailsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    detailsBox: {
        width: '48%',
    },
    detailsTitle: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 9,
        color: '#022c22',
        textTransform: 'uppercase',
        borderBottom: '1pt solid #e2e8f0',
        paddingBottom: 3,
        marginBottom: 6,
    },
    detailsRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    detailsLabel: {
        width: '35%',
        fontSize: 8,
        color: '#4b5563',
    },
    detailsValue: {
        width: '65%',
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: '#1f2937',
    },
    table: {
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRightWidth: 0,
        borderBottomWidth: 0,
        marginBottom: 20,
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: '#022c22',
    },
    tableRow: {
        flexDirection: 'row',
    },
    tableColNo: { width: '8%', borderStyle: 'solid', borderWidth: 1, borderColor: '#e2e8f0', borderLeftWidth: 0, borderTopWidth: 0 },
    tableColName: { width: '42%', borderStyle: 'solid', borderWidth: 1, borderColor: '#e2e8f0', borderLeftWidth: 0, borderTopWidth: 0 },
    tableColSize: { width: '15%', borderStyle: 'solid', borderWidth: 1, borderColor: '#e2e8f0', borderLeftWidth: 0, borderTopWidth: 0 },
    tableColQty: { width: '10%', borderStyle: 'solid', borderWidth: 1, borderColor: '#e2e8f0', borderLeftWidth: 0, borderTopWidth: 0 },
    tableColPrice: { width: '12%', borderStyle: 'solid', borderWidth: 1, borderColor: '#e2e8f0', borderLeftWidth: 0, borderTopWidth: 0 },
    tableColSubtotal: { width: '13%', borderStyle: 'solid', borderWidth: 1, borderColor: '#e2e8f0', borderLeftWidth: 0, borderTopWidth: 0 },
    tableCellHeader: { margin: 5, fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#ffffff', textAlign: 'center' },
    tableCell: { margin: 5, fontSize: 8, color: '#1f2937' },
    tableCellCenter: { margin: 5, fontSize: 8, color: '#1f2937', textAlign: 'center' },
    tableCellRight: { margin: 5, fontSize: 8, color: '#1f2937', textAlign: 'right' },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 25,
    },
    summaryBox: {
        width: '40%',
        borderTop: '1pt solid #022c22',
        paddingTop: 8,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 8,
        color: '#4b5563',
    },
    summaryValue: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: '#1f2937',
    },
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
        paddingTop: 6,
        borderTop: '1.5pt solid #022c22',
    },
    grandTotalLabel: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        color: '#022c22',
    },
    grandTotalValue: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        color: '#D4AF37',
    },
    paymentSeal: {
        position: 'absolute',
        top: 150,
        right: 80,
        border: '3pt double #059669',
        borderRadius: 10,
        padding: '8 15',
        transform: 'rotate(-12deg)',
        opacity: 0.8,
    },
    sealText: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 14,
        color: '#059669',
        letterSpacing: 2,
        textAlign: 'center',
    },
    sealDate: {
        fontSize: 7,
        color: '#059669',
        textAlign: 'center',
        marginTop: 3,
        textTransform: 'uppercase',
    },
    notesBox: {
        border: '1pt solid #e2e8f0',
        borderRadius: 6,
        padding: 10,
        backgroundColor: '#f9fafb',
        marginBottom: 25,
    },
    notesTitle: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 8,
        color: '#4b5563',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    notesText: {
        fontSize: 8,
        color: '#4b5563',
        lineHeight: 1.3,
    },
    footer: {
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        borderTop: '1pt solid #e2e8f0',
        paddingTop: 15,
    },
    footerText: {
        fontSize: 7.5,
        color: '#9ca3af',
        width: '60%',
    },
    signatureBox: {
        width: '30%',
        alignItems: 'center',
    },
    signatureTitle: {
        fontSize: 8,
        color: '#4b5563',
        marginBottom: 35,
    },
    signatureLine: {
        width: '100%',
        borderBottom: '1pt solid #1f2937',
        marginBottom: 3,
    },
    signatureName: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 8,
        color: '#1f2937',
    },
    organization: {
        fontSize: 7,
        color: '#4b5563',
    }
})

interface Props {
    order: any
    items: any[]
    logoUrl?: string
}

export function MerchInvoicePDF({ order, items, logoUrl = "/logo_hut16_pklu.png" }: Props) {
    const invCode = `INV/MB/${order.id.slice(0, 6).toUpperCase()}`
    const orderDate = new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })
    const paymentDateStr = order.payment_date 
        ? new Date(order.payment_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }) 
        : orderDate

    const totalQty = items.reduce((sum, i) => sum + i.quantity, 0)
    const grandTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        {logoUrl && <Image src={logoUrl} style={styles.logo} />}
                        <View>
                            <Text style={styles.companyName}>Panitia HUT 16 PKLU GPIB</Text>
                            <Text style={styles.companySub}>Pelayanan Kategorial Lanjut Usia - GPIB Bekasi</Text>
                            <Text style={styles.companySub}>Bekasi Convention Center, 12 Oktober 2026</Text>
                        </View>
                    </View>
                    <View style={styles.invoiceTitleContainer}>
                        <Text style={styles.invoiceTitle}>Invoice</Text>
                        <Text style={styles.invoiceNumber}>#{invCode}</Text>
                    </View>
                </View>

                {/* Details Section */}
                <View style={styles.detailsContainer}>
                    <View style={styles.detailsBox}>
                        <Text style={styles.detailsTitle}>Ditagih Kepada</Text>
                        <View style={styles.detailsRow}>
                            <Text style={styles.detailsLabel}>Nama:</Text>
                            <Text style={styles.detailsValue}>{order.buyer_name}</Text>
                        </View>
                        <View style={styles.detailsRow}>
                            <Text style={styles.detailsLabel}>WhatsApp:</Text>
                            <Text style={styles.detailsValue}>{order.whatsapp}</Text>
                        </View>
                        <View style={styles.detailsRow}>
                            <Text style={styles.detailsLabel}>Asal Jemaat:</Text>
                            <Text style={styles.detailsValue}>{order.church_city}</Text>
                        </View>
                    </View>

                    <View style={styles.detailsBox}>
                        <Text style={styles.detailsTitle}>Informasi Transaksi</Text>
                        <View style={styles.detailsRow}>
                            <Text style={styles.detailsLabel}>No Invoice:</Text>
                            <Text style={styles.detailsValue}>{invCode}</Text>
                        </View>
                        <View style={styles.detailsRow}>
                            <Text style={styles.detailsLabel}>Tgl Pesan:</Text>
                            <Text style={styles.detailsValue}>{orderDate}</Text>
                        </View>
                        <View style={styles.detailsRow}>
                            <Text style={styles.detailsLabel}>Tgl Bayar:</Text>
                            <Text style={styles.detailsValue}>{paymentDateStr}</Text>
                        </View>
                        <View style={styles.detailsRow}>
                            <Text style={styles.detailsLabel}>Metode:</Text>
                            <Text style={styles.detailsValue}>Transfer Bank BTN</Text>
                        </View>
                    </View>
                </View>

                {/* Paid Seal */}
                <View style={styles.paymentSeal}>
                    <Text style={styles.sealText}>PAID</Text>
                    <Text style={styles.sealDate}>{paymentDateStr}</Text>
                </View>

                {/* Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeaderRow}>
                        <View style={styles.tableColNo}><Text style={styles.tableCellHeader}>No.</Text></View>
                        <View style={styles.tableColName}><Text style={styles.tableCellHeader}>Nama Souvenir / Item</Text></View>
                        <View style={styles.tableColSize}><Text style={styles.tableCellHeader}>Ukuran</Text></View>
                        <View style={styles.tableColQty}><Text style={styles.tableCellHeader}>Qty</Text></View>
                        <View style={styles.tableColPrice}><Text style={styles.tableCellHeader}>Harga (Rp)</Text></View>
                        <View style={styles.tableColSubtotal}><Text style={styles.tableCellHeader}>Subtotal</Text></View>
                    </View>

                    {items.map((item, idx) => (
                        <View style={styles.tableRow} key={idx}>
                            <View style={styles.tableColNo}><Text style={styles.tableCellCenter}>{idx + 1}</Text></View>
                            <View style={styles.tableColName}><Text style={styles.tableCell}>{item.name}</Text></View>
                            <View style={styles.tableColSize}><Text style={styles.tableCellCenter}>{item.size || '-'}</Text></View>
                            <View style={styles.tableColQty}><Text style={styles.tableCellCenter}>{item.quantity}</Text></View>
                            <View style={styles.tableColPrice}><Text style={styles.tableCellRight}>{item.price.toLocaleString('id-ID')}</Text></View>
                            <View style={styles.tableColSubtotal}><Text style={styles.tableCellRight}>{(item.price * item.quantity).toLocaleString('id-ID')}</Text></View>
                        </View>
                    ))}
                </View>

                {/* Summary */}
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryBox}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total Kuantitas:</Text>
                            <Text style={styles.summaryValue}>{totalQty} Pcs</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal:</Text>
                            <Text style={styles.summaryValue}>Rp {grandTotal.toLocaleString('id-ID')}</Text>
                        </View>
                        <View style={styles.grandTotalRow}>
                            <Text style={styles.grandTotalLabel}>Grand Total:</Text>
                            <Text style={styles.grandTotalValue}>Rp {grandTotal.toLocaleString('id-ID')}</Text>
                        </View>
                    </View>
                </View>

                {/* Notes */}
                <View style={styles.notesBox}>
                    <Text style={styles.notesTitle}>Catatan Pengambilan:</Text>
                    <Text style={styles.notesText}>
                        1. Tunjukkan invoice digital ini atau sebutkan Nama Pembeli / Kode Pembelian di Meja Pengambilan Merchandise pada hari-H acara (Senin, 12 Oktober 2026 di Bekasi Convention Center).{"\n"}
                        2. Pastikan status verifikasi adalah PAID (Lunas). Jika status belum lunas, merchandise belum dapat diserahkan.{"\n"}
                        3. Hubungi Marsya Theresia (Seksi Dana) di WA 081219964142 jika ada pertanyaan lebih lanjut.
                    </Text>
                </View>

                {/* Footer */}
                <View style={styles.footer} wrap={false}>
                    <Text style={styles.footerText}>
                        Terima kasih atas partisipasi dan dukungan Anda dalam menyukseskan perayaan HUT ke-16 Pelayanan Kategorial Lanjut Usia (PKLU) GPIB. Dokumen ini sah dan diterbitkan secara elektronik oleh sistem.
                    </Text>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureTitle}>Menyetujui,</Text>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureName}>Paul Simanjuntak</Text>
                        <Text style={styles.organization}>Bendahara Panitia</Text>
                    </View>
                </View>
            </Page>
        </Document>
    )
}
