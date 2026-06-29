const fs = require('fs');
const path = require('path');

const files = [
    'src/components/pdf/ProposalDonaturPDF.tsx',
    'src/components/pdf/ProposalSponsorPDF.tsx'
];

for (const file of files) {
    const fullPath = path.join(process.cwd(), file);
    let content = fs.readFileSync(fullPath, 'utf8');

    // 1. Remove gpibLogoUrl from Props/Props destructuring if needed, but keeping it in interface is fine.
    // 2. Remove gpibLogoUrl image from Header
    content = content.replace(
        `<View style={styles.headerLogos}>\n                    <Image src={gpibLogoUrl} style={styles.headerLogo} />\n                    <Image src={logoUrl} style={styles.headerLogo} />\n                </View>`,
        `<View style={styles.headerLogos}>\n                    <Image src={logoUrl} style={styles.headerLogo} />\n                </View>`
    );

    // 3. Remove gpibLogoUrl image from Cover Page
    content = content.replace(
        `<View style={{ flexDirection: 'row', gap: 20, marginBottom: 30 }}>\n                        <Image src={gpibLogoUrl} style={{ width: 100, height: 100 }} />\n                        <Image src={logoUrl} style={{ width: 100, height: 100 }} />\n                    </View>`,
        `<View style={{ flexDirection: 'row', gap: 20, marginBottom: 30 }}>\n                        <Image src={logoUrl} style={{ width: 100, height: 100 }} />\n                    </View>`
    );

    fs.writeFileSync(fullPath, content);
    console.log(`Removed GPIB logo from ${file}`);
}
