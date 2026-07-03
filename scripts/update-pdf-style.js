const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'components', 'pdf', 'LaporanLpjPDF.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update Styles
content = content.replace(
    /summaryBox: \{[\s\S]*?\},/,
    `summaryBox: {
        border: '1.5pt solid #e5e7eb',
        borderRadius: 8,
        padding: 25,
        backgroundColor: '#f8fafc',
        width: '48%',
        height: 360,
        justifyContent: 'space-between',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },`
);

content = content.replace(
    /summaryLabel: \{[\s\S]*?\},/,
    `summaryLabel: {
        width: '60%',
        fontSize: 11,
        color: '#4b5563',
        marginBottom: 8,
    },`
);

content = content.replace(
    /summaryValue: \{[\s\S]*?\},/,
    `summaryValue: {
        width: '40%',
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 8,
    },`
);

content = content.replace(
    /summaryTotalLabel: \{[\s\S]*?\},/,
    `summaryTotalLabel: {
        width: '60%',
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        color: '#022c22',
    },`
);

content = content.replace(
    /summaryTotalValue: \{[\s\S]*?\},/,
    `summaryTotalValue: {
        width: '40%',
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        color: '#047857',
    },`
);

// Update sectionTitle to make "Ringkasan Laporan" look better
content = content.replace(
    /sectionTitle: \{[\s\S]*?\},/,
    `sectionTitle: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 14,
        color: '#022c22',
        borderBottom: '2pt solid #D4AF37',
        paddingBottom: 6,
        marginBottom: 15,
        textTransform: 'uppercase',
        marginTop: 15,
        textAlign: 'center',
    },`
);

// 2. Wrap Tables in a View with break
const tablesRegex = /\{renderTable\('Daftar Proposal Donatur'[\s\S]*?origin\)\}/;
const newTables = `
                {/* Page Break for Details Section */}
                <View break>
                    {renderTable('Daftar Proposal Donatur', donaturProposals, true, totalDanaDonatur, origin)}
                    {renderTable('Daftar Proposal Sponsorship', sponsorProposals, true, totalDanaSponsor, origin)}
                    {renderTable('Daftar Proposal Request / Calon Dukungan', requestProposals, false, 0, origin)}
                </View>
`;
content = content.replace(tablesRegex, newTables);

// 3. Update Inline Font Sizes in the Summary Box
// Replace fontSize: 9 and fontSize: 8 with fontSize: 13 and fontSize: 11 for headers
content = content.replace(/fontSize: 9/g, "fontSize: 13");
content = content.replace(/fontSize: 8/g, "fontSize: 11");

// The table header cell had fontSize: 8, which is now 11, which might be too big for tables!
// We only want to replace it inside the summary container, or just fix the tableCellHeader back to 8.
// Let's manually fix tableCellHeader:
content = content.replace(
    /tableCellHeader: \{ margin: 5, fontSize: 11,/,
    `tableCellHeader: { margin: 5, fontSize: 8,`
);

// And table footer label:
content = content.replace(
    /tableFooterLabel: \{ margin: 6, fontSize: 13,/,
    `tableFooterLabel: { margin: 6, fontSize: 9,`
);
content = content.replace(
    /tableFooterValue: \{ margin: 6, fontSize: 13,/,
    `tableFooterValue: { margin: 6, fontSize: 9,`
);

// emptyState:
content = content.replace(
    /emptyState: \{ padding: 20, textAlign: 'center', fontSize: 13,/,
    `emptyState: { padding: 20, textAlign: 'center', fontSize: 9,`
);

// signatureName, Title, etc:
content = content.replace(
    /signatureTitle: \{\s*fontSize: 13,/g,
    `signatureTitle: {\n        fontSize: 9,`
);
content = content.replace(
    /signatureName: \{\s*fontFamily: 'Helvetica-Bold',\s*fontSize: 13,/g,
    `signatureName: {\n        fontFamily: 'Helvetica-Bold',\n        fontSize: 9,`
);

// Increase the height of the chart image slightly
content = content.replace(/height: 40/g, "height: 50");

fs.writeFileSync(filePath, content);
console.log("Updated LaporanLpjPDF.tsx styles and page break");
