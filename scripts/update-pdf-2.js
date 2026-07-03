const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'components', 'pdf', 'LaporanLpjPDF.tsx');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('Link')) {
    content = content.replace('Image } from', 'Image, Link } from');
}

// 1. Add Target and Capaian to Summary Box
const oldSummaryBox = /<View style=\{styles\.summaryBox\}>[\s\S]*?\(A\) Realisasi Penerimaan Dana<\/Text>[\s\S]*?<\/View>\s*<\/View>/;

const newSummaryBox = `
                    <View style={styles.summaryBox}>
                        <Text style={[styles.summaryTotalLabel, { marginBottom: 6, fontSize: 9 }]}>(A) Realisasi Penerimaan Dana</Text>
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
                            src={\`https://quickchart.io/chart?w=350&h=80&c={type:'progressBar',data:{datasets:[{data:[Math.min(100, Math.round((totalDana/537785000)*100))],backgroundColor:'#047857'}]}}\`} 
                            style={{ width: '100%', height: 40, marginTop: 10, objectFit: 'contain' }}
                        />
                    </View>

                    <View style={styles.summaryBox}>
                        <Text style={[styles.summaryTotalLabel, { marginBottom: 6, fontSize: 9 }]}>(B) Status Distribusi Proposal</Text>
                        
                        <Text style={[styles.summaryTotalLabel, { fontSize: 8, marginTop: 4 }]}>Total Proposal Keseluruhan:</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>- Donatur / Sponsor / Request</Text>
                            <Text style={styles.summaryValue}>: {donaturProposals.length} / {sponsorProposals.length} / {requestProposals.length}</Text>
                        </View>

                        <Text style={[styles.summaryTotalLabel, { fontSize: 8, marginTop: 4 }]}>Rincian Donatur:</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>- Diterbitkan / Komitmen / Lunas</Text>
                            <Text style={styles.summaryValue}>: {stats.donatur.diterbitkan} / {stats.donatur.komitmen} / {stats.donatur.lunas}</Text>
                        </View>
                        
                        <Text style={[styles.summaryTotalLabel, { fontSize: 8, marginTop: 4 }]}>Rincian Sponsorship:</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>- Diterbitkan / Komitmen / Lunas</Text>
                            <Text style={styles.summaryValue}>: {stats.sponsor.diterbitkan} / {stats.sponsor.komitmen} / {stats.sponsor.lunas}</Text>
                        </View>

                        <Text style={[styles.summaryTotalLabel, { fontSize: 8, marginTop: 4 }]}>Rincian Request (Follow Up / Total):</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>- Keseluruhan Request</Text>
                            <Text style={styles.summaryValue}>: {stats.donatur.requestFollowedUp + stats.sponsor.requestFollowedUp} / {stats.donatur.requestTotal + stats.sponsor.requestTotal}</Text>
                        </View>
                    </View>
                </View>`;

content = content.replace(oldSummaryBox, newSummaryBox);

// 2. Make renderTable interactive by using Links for names and adding anchor properties
const oldRenderTableStr = `const renderTable = (title: string, data: any[], showTotalDana: boolean, totalAmount: number = 0) => (`;
content = content.replace(oldRenderTableStr, `const renderTable = (title: string, data: any[], showTotalDana: boolean, totalAmount: number = 0, origin: string = '') => (`);

content = content.replace(
    `<View style={styles.tableColNum}><Text style={styles.tableCellBold}>{p.number}</Text></View>`,
    `<View style={styles.tableColNum}>
                            <Link src={\`\${origin}/daftar-proposal?q=\${encodeURIComponent(p.number)}\`} style={{ textDecoration: 'none' }}>
                                <Text style={[styles.tableCellBold, { color: '#047857' }]}>{p.number}</Text>
                            </Link>
                        </View>`
);

content = content.replace(
    `<View style={styles.tableColName}>
                            <Text style={styles.tableCellBold}>{p.name}</Text>`,
    `<View style={styles.tableColName}>
                            <Link src={\`\${origin}/daftar-proposal?q=\${encodeURIComponent(p.name)}\`} style={{ textDecoration: 'none' }}>
                                <Text style={[styles.tableCellBold, { color: '#047857' }]}>{p.name}</Text>
                            </Link>`
);

// 3. Update the renderTable calls to pass origin
content = content.replace(
    `{renderTable('Daftar Proposal Donatur', donaturProposals, true, totalDanaDonatur)}`,
    `{renderTable('Daftar Proposal Donatur', donaturProposals, true, totalDanaDonatur, origin)}`
);
content = content.replace(
    `{renderTable('Daftar Proposal Sponsorship', sponsorProposals, true, totalDanaSponsor)}`,
    `{renderTable('Daftar Proposal Sponsorship', sponsorProposals, true, totalDanaSponsor, origin)}`
);
content = content.replace(
    `{renderTable('Daftar Proposal Request / Calon Dukungan', requestProposals, false, 0)}`,
    `{renderTable('Daftar Proposal Request / Calon Dukungan', requestProposals, false, 0, origin)}`
);

fs.writeFileSync(filePath, content);
