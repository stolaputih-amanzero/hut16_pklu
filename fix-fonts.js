const fs = require('fs');
const path = require('path');

const files = [
    'src/components/pdf/ProposalDonaturPDF.tsx',
    'src/components/pdf/ProposalSponsorPDF.tsx'
];

for (const file of files) {
    const fullPath = path.join(process.cwd(), file);
    let content = fs.readFileSync(fullPath, 'utf8');

    // Remove Font.register blocks
    content = content.replace(/Font\.register\(\{[\s\S]*?\}\)/g, '');

    // Replace Playfair with Times-Roman
    content = content.replace(/'Playfair'/g, "'Times-Roman'");

    // Replace Montserrat with Helvetica
    content = content.replace(/'Montserrat'/g, "'Helvetica'");

    // Remove empty lines left by Font.register removal
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    fs.writeFileSync(fullPath, content);
    console.log(`Updated ${file}`);
}
