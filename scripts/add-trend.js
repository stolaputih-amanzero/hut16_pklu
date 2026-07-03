const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'app', 'api', 'generate-lpj', 'route.ts');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('trendData')) {
    const replacement = `
        const totalDanaSponsor = sponsorProposals
            .reduce((sum, p) => sum + ((p.payment_status === 'confirmed' ? Number(p.contribution_value) : 0) || 0), 0)
        const totalDana = totalDanaDonatur + totalDanaSponsor

        // 4. Compute Trend Data (Cumulative or per month)
        // Group confirmed proposals by month
        const confirmedProposals = (allProposals || []).filter(p => p.payment_status === 'confirmed').reverse() // ascending order
        const trendMap = {}
        confirmedProposals.forEach(p => {
            const date = new Date(p.created_at || new Date())
            const monthYear = date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
            if (!trendMap[monthYear]) trendMap[monthYear] = 0
            trendMap[monthYear] += (Number(p.contribution_value) || 0)
        })
        
        const trendLabels = Object.keys(trendMap)
        const trendValues = Object.values(trendMap)
        
        // Optional: Make it cumulative
        // let currentSum = 0;
        // const cumulativeValues = trendValues.map(v => { currentSum += v; return currentSum; })

        const trendData = {
            labels: trendLabels.length > 0 ? trendLabels : ['-'],
            data: trendValues.length > 0 ? trendValues : [0]
        }`;

    const oldStr = `
        const totalDanaSponsor = sponsorProposals
            .reduce((sum, p) => sum + ((p.payment_status === 'confirmed' ? Number(p.contribution_value) : 0) || 0), 0)
        const totalDana = totalDanaDonatur + totalDanaSponsor`;

    content = content.replace(oldStr, replacement);

    // add trendData to props
    content = content.replace(
        'stats',
        'stats,\n                trendData'
    );

    fs.writeFileSync(filePath, content);
    console.log("Updated route.ts with trendData");
} else {
    console.log("trendData already present in route.ts");
}
