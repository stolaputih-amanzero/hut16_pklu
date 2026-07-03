const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'components', 'pdf', 'LaporanLpjPDF.tsx');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes('trendData?:')) {
    // 1. Update Props interface
    content = content.replace(
        'stats?: {',
        `trendData?: { labels: string[], data: number[] }
    stats?: {`
    );

    // 2. Add trendData to destructured props
    content = content.replace(
        'stats = {',
        `trendData = { labels: [], data: [] },
    stats = {`
    );

    // 3. Add trend chart to SummaryBox (A)
    const oldChartStr = `{/* QuickChart Image for Progress */}
                        <Image 
                            src={\`https://quickchart.io/chart?w=350&h=80&c=\${encodeURIComponent(\`{type:'progressBar',data:{datasets:[{data:[\${Math.min(100, Math.round((totalDana/537785000)*100))}],backgroundColor:'#047857'}]}}\`)}\`} 
                            style={{ width: '100%', height: 40, marginTop: 10, objectFit: 'contain' }}
                        />`;
                        
    // We will keep the progress bar but also add a line chart below it for the trend
    const newChartStr = `{/* QuickChart Image for Progress */}
                        <Image 
                            src={\`https://quickchart.io/chart?w=350&h=80&c=\${encodeURIComponent(\`{type:'progressBar',data:{datasets:[{data:[\${Math.min(100, Math.round((totalDana/537785000)*100))}],backgroundColor:'#047857'}]}}\`)}\`} 
                            style={{ width: '100%', height: 40, marginTop: 10, objectFit: 'contain' }}
                        />

                        {/* QuickChart Image for Trend */}
                        {trendData.labels.length > 0 && (
                            <View style={{ marginTop: 10 }}>
                                <Text style={[styles.summaryTotalLabel, { fontSize: 8, marginBottom: 4 }]}>Trend Perolehan Dana Lunas</Text>
                                <Image 
                                    src={\`https://quickchart.io/chart?w=350&h=120&c=\${encodeURIComponent(\`{type:'line',data:{labels:\${JSON.stringify(trendData.labels)},datasets:[{label:'Dana (Rp)',data:\${JSON.stringify(trendData.data)},borderColor:'#047857',backgroundColor:'rgba(4, 120, 87, 0.1)',fill:true,tension:0.4}]},options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{callback:(val)=>{return val/1000000+'Jt'}}}},layout:{padding:10}}}\`)}\`} 
                                    style={{ width: '100%', height: 60, objectFit: 'contain' }}
                                />
                            </View>
                        )}`;

    content = content.replace(oldChartStr, newChartStr);

    fs.writeFileSync(filePath, content);
    console.log("Updated LaporanLpjPDF.tsx with trend chart");
} else {
    console.log("trendData already in LaporanLpjPDF.tsx");
}
