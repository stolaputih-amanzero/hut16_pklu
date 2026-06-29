const React = require('react');
const { renderToBuffer } = require('@react-pdf/renderer');
const { ProposalDonaturPDF } = require('./src/components/pdf/ProposalDonaturPDF');

async function test() {
    try {
        const dummyData = {
            id: '123',
            number: 'DON-2026-0001',
            name: 'John Doe',
            display_name: 'Mr. John Doe',
            phone: '6281234567890',
            congregation: 'GPIB',
            contribution_value: 500000,
            message: 'God bless',
            donatur_category: 'sahabat_bakti',
            committees: { name: 'Admin', role: 'Ketua' }
        };
        const element = React.createElement(ProposalDonaturPDF, { data: dummyData, lang: 'id' });
        console.log('Rendering...');
        const buffer = await renderToBuffer(element);
        console.log('Success! Buffer size:', buffer.length);
    } catch (e) {
        console.error('Error rendering PDF:', e);
    }
}
test();
