import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image, Link } from '@react-pdf/renderer'
import { formatRupiah } from '@/lib/utils'

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
        fontSize: 14,
        color: '#022c22',
        borderBottom: '2pt solid #D4AF37',
        paddingBottom: 6,
        marginBottom: 15,
        textTransform: 'uppercase',
        marginTop: 15,
        textAlign: 'center',
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    summaryBox: {
        border: '1.5pt solid #e5e7eb',
        borderRadius: 8,
        padding: 25,
        backgroundColor: '#f8fafc',
        width: '48%',
        height: 300,
        justifyContent: 'space-between',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    summaryRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    summaryLabel: {
        width: '60%',
        fontSize: 11,
        color: '#4b5563',
        marginBottom: 8,
    },
    summaryValue: {
        width: '40%',
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 8,
    },
    summaryTotalRow: {
        flexDirection: 'row',
        marginTop: 6,
        paddingTop: 6,
        borderTop: '0.5pt solid #d1d5db',
    },
    summaryTotalLabel: {
        width: '60%',
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        color: '#022c22',
    },
    summaryTotalValue: {
        width: '40%',
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        color: '#047857',
    },
    table: {
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#022c22',
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row',
    },
    tableHeaderRow: {
        margin: 'auto',
        flexDirection: 'row',
        backgroundColor: '#022c22',
    },
    tableColNo: { width: '5%', borderStyle: 'solid', borderWidth: 1, borderColor: '#022c22', borderLeftWidth: 0, borderTopWidth: 0 },
    tableColNum: { width: '15%', borderStyle: 'solid', borderWidth: 1, borderColor: '#022c22', borderLeftWidth: 0, borderTopWidth: 0 },
    tableColType: { width: '10%', borderStyle: 'solid', borderWidth: 1, borderColor: '#022c22', borderLeftWidth: 0, borderTopWidth: 0 },
    tableColName: { width: '25%', borderStyle: 'solid', borderWidth: 1, borderColor: '#022c22', borderLeftWidth: 0, borderTopWidth: 0 },
    tableColValue: { width: '15%', borderStyle: 'solid', borderWidth: 1, borderColor: '#022c22', borderLeftWidth: 0, borderTopWidth: 0 },
    tableColForm: { width: '12%', borderStyle: 'solid', borderWidth: 1, borderColor: '#022c22', borderLeftWidth: 0, borderTopWidth: 0 },
    tableColSupport: { width: '18%', borderStyle: 'solid', borderWidth: 1, borderColor: '#022c22', borderLeftWidth: 0, borderTopWidth: 0 },
    
    tableCellHeader: { margin: 5, fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#ffffff', textAlign: 'center' },
    tableCell: { margin: 5, fontSize: 7.5, color: '#1f2937' },
    tableCellRight: { margin: 5, fontSize: 7.5, color: '#1f2937', textAlign: 'right' },
    tableCellBold: { margin: 5, fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#1f2937' },
    
    emptyState: { padding: 20, textAlign: 'center', fontSize: 9, color: '#6b7280', borderBottom: '1pt solid #022c22', borderRight: '1pt solid #022c22' },
    
    tableFooterRow: {
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
    },
    tableFooterLabelCol: {
        width: '55%', borderStyle: 'solid', borderWidth: 1, borderColor: '#022c22', borderLeftWidth: 0, borderTopWidth: 0,
    },
    tableFooterValueCol: {
        width: '15%', borderStyle: 'solid', borderWidth: 1, borderColor: '#022c22', borderLeftWidth: 0, borderTopWidth: 0,
    },
    tableFooterEmptyCol: {
        width: '30%', borderStyle: 'solid', borderWidth: 1, borderColor: '#022c22', borderLeftWidth: 0, borderTopWidth: 0,
    },
    tableFooterLabel: { margin: 6, fontSize: 9, fontFamily: 'Helvetica-Bold', textAlign: 'right', color: '#1f2937' },
    tableFooterValue: { margin: 6, fontSize: 9, fontFamily: 'Helvetica-Bold', textAlign: 'right', color: '#047857' },
    
    footer: {
        marginTop: 40,
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
        fontSize: 9,
        marginBottom: 40,
        color: '#1f2937',
    },
    signatureLine: {
        width: '100%',
        borderBottom: '1pt solid #1f2937',
        marginBottom: 4,
    },
    signatureName: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 9,
        color: '#1f2937',
    },
    qrBox: {
        width: 80,
        alignItems: 'center',
    },
    qrCode: {
        width: 50,
        height: 50,
        marginBottom: 4,
    },
    qrTextBold: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 6,
        color: '#6b7280',
        letterSpacing: 1,
    },
    qrText: {
        fontSize: 6,
        color: '#6b7280',
        marginTop: 2,
    }
})

interface Props {
    donaturProposals: any[]
    sponsorProposals: any[]
    requestProposals: any[]
    totalDanaDonatur: number
    totalDanaSponsor: number
    totalDana: number
    logoUrl?: string
    origin?: string
    trendData?: { labels: string[], data: number[] }
    stats?: {
        donatur: {
            diterbitkan: number
            komitmen: number
            lunas: number
            requestTotal: number
            requestFollowedUp: number
        }
        sponsor: {
            diterbitkan: number
            komitmen: number
            lunas: number
            requestTotal: number
            requestFollowedUp: number
        }
    }
}


const renderTable = (title: string, data: any[], showTotalDana: boolean, totalAmount: number = 0, origin: string = '') => (
    <View style={{ marginBottom: 20 }} wrap={false}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
                <View style={styles.tableColNo}><Text style={styles.tableCellHeader}>No.</Text></View>
                <View style={styles.tableColNum}><Text style={styles.tableCellHeader}>No. Proposal</Text></View>
                <View style={styles.tableColType}><Text style={styles.tableCellHeader}>Tipe</Text></View>
                <View style={styles.tableColName}><Text style={styles.tableCellHeader}>Nama / Institusi</Text></View>
                <View style={styles.tableColValue}><Text style={styles.tableCellHeader}>Nilai (Rp)</Text></View>
                <View style={styles.tableColForm}><Text style={styles.tableCellHeader}>Bentuk Lainnya</Text></View>
                <View style={styles.tableColSupport}><Text style={styles.tableCellHeader}>Dukungan Spesifik</Text></View>
            </View>

            {data.length === 0 ? (
                <Text style={styles.emptyState}>Belum ada data untuk kategori ini.</Text>
            ) : (
                data.map((p: any, index: number) => (
                    <View style={styles.tableRow} key={p.id || index}>
                        <View style={styles.tableColNo}><Text style={styles.tableCell}>{index + 1}</Text></View>
                        <View style={styles.tableColNum}>
                            <Link src={`${origin}/daftar-proposal?q=${encodeURIComponent(p.number)}`} style={{ textDecoration: 'none' }}>
                                <Text style={[styles.tableCellBold, { color: '#047857' }]}>{p.number}</Text>
                            </Link>
                        </View>
                        <View style={styles.tableColType}><Text style={styles.tableCell}>{p.type === 'sponsorship' ? 'Sponsor' : 'Donatur'}</Text></View>
                        <View style={styles.tableColName}>
                            <Link src={`${origin}/daftar-proposal?q=${encodeURIComponent(p.name)}`} style={{ textDecoration: 'none' }}>
                                <Text style={[styles.tableCellBold, { color: '#047857' }]}>{p.name}</Text>
                            </Link>
                            {p.company_name && <Text style={[styles.tableCell, { marginTop: 0 }]}>{p.company_name}</Text>}
                        </View>
                        <View style={styles.tableColValue}>
                            <Text style={styles.tableCellRight}>
                                {p.contribution_value ? p.contribution_value.toLocaleString('id-ID') : '-'}
                            </Text>
                        </View>
                        <View style={styles.tableColForm}>
                            <Text style={styles.tableCell}>
                                {p.contribution_form && p.contribution_form !== 'dana' ? p.contribution_form : '-'}
                            </Text>
                        </View>
                        <View style={styles.tableColSupport}>
                            <Text style={styles.tableCell}>{p.specific_support || '-'}</Text>
                        </View>
                    </View>
                ))
            )}

            {showTotalDana && data.length > 0 && (
                <View style={styles.tableFooterRow}>
                    <View style={styles.tableFooterLabelCol}>
                        <Text style={styles.tableFooterLabel}>TOTAL KESELURUHAN DANA:</Text>
                    </View>
                    <View style={styles.tableFooterValueCol}>
                        <Text style={styles.tableFooterValue}>{totalAmount.toLocaleString('id-ID')}</Text>
                    </View>
                    <View style={styles.tableFooterEmptyCol}></View>
                </View>
            )}
        </View>
    </View>
)

export function LaporanLpjPDF({ 
    donaturProposals,
    sponsorProposals,
    requestProposals,
    totalDanaDonatur, 
    totalDanaSponsor, 
    totalDana, 
    logoUrl = "/logo_hut16_pklu.png", 
    origin = "https://pklu.amanloka.com",
    trendData = { labels: [], data: [] },
    stats = {
        donatur: { diterbitkan: 0, komitmen: 0, lunas: 0, requestTotal: 0, requestFollowedUp: 0 },
        sponsor: { diterbitkan: 0, komitmen: 0, lunas: 0, requestTotal: 0, requestFollowedUp: 0 }
    }
}: Props) {
    const qrImageUrl = `https://quickchart.io/qr?size=150&text=${encodeURIComponent('https://pklu.amanloka.com')}`
    const currentDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })

    return (
        <Document>
            <Page size="A4" style={styles.page} orientation="landscape">
                {/* Watermark */}
                <Image src={logoUrl} style={styles.backgroundLogo} />

                {/* Header */}
                <View style={styles.header}>
                    <Image src={logoUrl} style={styles.logo} />
                    <Text style={styles.title}>Laporan Pertanggungjawaban (LPJ)</Text>
                    <Text style={styles.subtitle}>Perolehan Donatur & Sponsorship</Text>
                    <Text style={styles.organization}>HUT ke-16 Pelayanan Kategorial Lanjut Usia (PKLU)</Text>
                </View>

                {/* Summary Section */}
                <Text style={styles.sectionTitle}>Ringkasan Laporan</Text>
                <View style={styles.summaryContainer}>
                    {/* Funds Summary Box */}
                    
                    <View style={styles.summaryBox}>
                        <Text style={[styles.summaryTotalLabel, { marginBottom: 6, fontSize: 13 }]}>(A) Realisasi Penerimaan Dana</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total Dana Donatur</Text>
                            <Text style={styles.summaryValue}>: {formatRupiah(totalDanaDonatur)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total Dana Sponsorship</Text>
                            <Text style={styles.summaryValue}>: {formatRupiah(totalDanaSponsor)}</Text>
                        </View>
                        <View style={styles.summaryTotalRow}>
                            <Text style={styles.summaryTotalLabel}>Total Keseluruhan Dana</Text>
                            <Text style={styles.summaryTotalValue}>: {formatRupiah(totalDana)}</Text>
                        </View>
                        <View style={[styles.summaryRow, { marginTop: 4 }]}>
                            <Text style={styles.summaryLabel}>Target Penerimaan</Text>
                            <Text style={styles.summaryValue}>: Rp 537.785.000</Text>
                        </View>
                        <View style={styles.summaryTotalRow}>
                            <Text style={styles.summaryTotalLabel}>Persentase Capaian</Text>
                            <Text style={styles.summaryTotalValue}>: {((totalDana / 537785000) * 100).toFixed(1)}%</Text>
                        </View>
                        
                        {/* QuickChart Image for Progress */}
                        <Image 
                            src={`https://quickchart.io/chart?w=350&h=80&c=${encodeURIComponent(`{type:'progressBar',data:{datasets:[{data:[${Math.min(100, Math.round((totalDana/537785000)*100))}],backgroundColor:'#047857'}]}}`)}`} 
                            style={{ width: '100%', height: 50, marginTop: 10, objectFit: 'contain' }}
                        />


                    </View>

                    <View style={styles.summaryBox}>
                        <Text style={[styles.summaryTotalLabel, { marginBottom: 6, fontSize: 13 }]}>(B) Status Distribusi Proposal</Text>
                        
                        <Text style={[styles.summaryTotalLabel, { fontSize: 11, marginTop: 4 }]}>Total Proposal Keseluruhan:</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>- Donatur / Sponsor / Request</Text>
                            <Text style={styles.summaryValue}>: {donaturProposals.length} / {sponsorProposals.length} / {requestProposals.length}</Text>
                        </View>

                        <Text style={[styles.summaryTotalLabel, { fontSize: 11, marginTop: 4 }]}>Rincian Donatur:</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>- Diterbitkan / Komitmen / Lunas</Text>
                            <Text style={styles.summaryValue}>: {stats.donatur.diterbitkan} / {stats.donatur.komitmen} / {stats.donatur.lunas}</Text>
                        </View>
                        
                        <Text style={[styles.summaryTotalLabel, { fontSize: 11, marginTop: 4 }]}>Rincian Sponsorship:</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>- Diterbitkan / Komitmen / Lunas</Text>
                            <Text style={styles.summaryValue}>: {stats.sponsor.diterbitkan} / {stats.sponsor.komitmen} / {stats.sponsor.lunas}</Text>
                        </View>

                        <Text style={[styles.summaryTotalLabel, { fontSize: 11, marginTop: 4 }]}>Rincian Request (Follow Up / Total):</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>- Keseluruhan Request</Text>
                            <Text style={styles.summaryValue}>: {stats.donatur.requestFollowedUp + stats.sponsor.requestFollowedUp} / {stats.donatur.requestTotal + stats.sponsor.requestTotal}</Text>
                        </View>
                    </View>
                </View>

                
                {/* Page Break for Details Section */}
                <View break>
                    {renderTable('Daftar Proposal Donatur', donaturProposals, true, totalDanaDonatur, origin)}
                    {renderTable('Daftar Proposal Sponsorship', sponsorProposals, true, totalDanaSponsor, origin)}
                    {renderTable('Daftar Proposal Request / Calon Dukungan', requestProposals, false, 0, origin)}
                </View>


                {/* Footer Signatures */}
                <View style={styles.footer} wrap={false}>
                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureTitle}>Mengetahui,</Text>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureName}>Vrilly Rondonuwu</Text>
                        <Text style={styles.organization}>Ketua Panitia</Text>
                    </View>

                    <View style={styles.qrBox}>
                        <Image src={qrImageUrl} style={styles.qrCode} />
                        <Text style={styles.qrTextBold}>DOKUMEN AUTENTIK</Text>
                        <Text style={styles.qrText}>{currentDate}</Text>
                    </View>

                    <View style={styles.signatureBox}>
                        <Text style={styles.signatureTitle}>Menyetujui,</Text>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureName}>Paul Simanjuntak</Text>
                        <Text style={styles.organization}>Bendahara</Text>
                    </View>
                </View>
            </Page>
        </Document>
    )
}
