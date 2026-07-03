const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'components', 'pdf', 'LaporanLpjPDF.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update the Summary Box
const oldSummaryBox = `<View style={styles.summaryBox}>
                        <Text style={[styles.summaryTotalLabel, { marginBottom: 6, fontSize: 9 }]}>(B) Status Distribusi Proposal</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Proposal Donatur (Keluar / Lunas)</Text>
                            <Text style={styles.summaryValue}>: {stats.donaturKeluar} / {stats.donaturIsi}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Proposal Sponsor (Keluar / Lunas)</Text>
                            <Text style={styles.summaryValue}>: {stats.sponsorKeluar} / {stats.sponsorIsi}</Text>
                        </View>
                        <View style={styles.summaryTotalRow}>
                            <Text style={styles.summaryTotalLabel}>Total Proposal (Keluar / Lunas)</Text>
                            <Text style={styles.summaryTotalValue}>: {stats.donaturKeluar + stats.sponsorKeluar} / {stats.donaturIsi + stats.sponsorIsi}</Text>
                        </View>
                    </View>`;

const newSummaryBox = `<View style={styles.summaryBox}>
                        <Text style={[styles.summaryTotalLabel, { marginBottom: 6, fontSize: 9 }]}>(B) Status Distribusi Proposal</Text>
                        
                        <Text style={[styles.summaryTotalLabel, { fontSize: 8, marginTop: 4 }]}>Donatur:</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>- Diterbitkan / Komitmen / Lunas</Text>
                            <Text style={styles.summaryValue}>: {stats.donatur.diterbitkan} / {stats.donatur.komitmen} / {stats.donatur.lunas}</Text>
                        </View>
                        
                        <Text style={[styles.summaryTotalLabel, { fontSize: 8, marginTop: 4 }]}>Sponsorship:</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>- Diterbitkan / Komitmen / Lunas</Text>
                            <Text style={styles.summaryValue}>: {stats.sponsor.diterbitkan} / {stats.sponsor.komitmen} / {stats.sponsor.lunas}</Text>
                        </View>

                        <Text style={[styles.summaryTotalLabel, { fontSize: 8, marginTop: 4 }]}>Request (Follow Up / Total):</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>- Keseluruhan</Text>
                            <Text style={styles.summaryValue}>: {stats.donatur.requestFollowedUp + stats.sponsor.requestFollowedUp} / {stats.donatur.requestTotal + stats.sponsor.requestTotal}</Text>
                        </View>
                    </View>`;

content = content.replace(oldSummaryBox, newSummaryBox);

// 2. Add renderTable function outside the component
const renderTableStr = `
const renderTable = (title: string, data: any[], showTotalDana: boolean, totalAmount: number = 0) => (
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
                        <View style={styles.tableColNum}><Text style={styles.tableCellBold}>{p.number}</Text></View>
                        <View style={styles.tableColType}><Text style={styles.tableCell}>{p.type === 'sponsorship' ? 'Sponsor' : 'Donatur'}</Text></View>
                        <View style={styles.tableColName}>
                            <Text style={styles.tableCellBold}>{p.name}</Text>
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

export function LaporanLpjPDF`;

content = content.replace('export function LaporanLpjPDF', renderTableStr);

// 3. Replace the old table with renderTable calls
const oldDetailsSectionRegex = /<Text style=\{styles\.sectionTitle\}>Rincian Penerimaan Terkonfirmasi<\/Text>[\s\S]*?<\/View>[\s\S]*?\{\/\* Footer Signatures \*\/\}/;

const newDetailsSection = `{/* Details */}
                {renderTable('Daftar Proposal Donatur', donaturProposals, true, totalDanaDonatur)}
                {renderTable('Daftar Proposal Sponsorship', sponsorProposals, true, totalDanaSponsor)}
                {renderTable('Daftar Proposal Request / Calon Dukungan', requestProposals, false, 0)}

                {/* Footer Signatures */}`;

content = content.replace(oldDetailsSectionRegex, newDetailsSection);

fs.writeFileSync(filePath, content);
console.log("Updated LaporanLpjPDF.tsx successfully.");
