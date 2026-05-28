export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    const { number } = req.query;
    
    if (!number) {
        return res.status(400).json({
            success: false,
            user: "@KINGITACHI18",
            error: "Number parameter required",
            example: "/api/number?number=9693615642"
        });
    }
    
    try {
        // Original API call
        const response = await fetch(`https://all-number-info-rajan-eta.vercel.app/api?number=${number}`);
        const rawData = await response.json();
        
        const allRecords = [];
        const seenAadhaar = new Set();
        const seenMobile = new Set();
        
        const sources = rawData.results || {};
        
        for (const [srcName, srcData] of Object.entries(sources)) {
            if (srcData.status !== 'success') continue;
            
            let records = [];
            const data = srcData.data;
            
            if (data?.response?.data) records = data.response.data;
            else if (Array.isArray(data?.data)) records = data.data;
            else if (data?.data?.data) records = data.data.data;
            else if (Array.isArray(data)) records = data;
            
            records.forEach(record => {
                const name = record.name || record.NAME;
                const mobile = record.num || record.MOBILE;
                const aadhaar = record.aadhar || record.id;
                const altMobile = record.alt;
                const address = record.address || record.ADDRESS;
                const circle = record.circle;
                const fname = record.fname;
                
                const isDuplicate = (aadhaar && seenAadhaar.has(aadhaar)) || 
                                   (mobile && seenMobile.has(mobile));
                
                if (!isDuplicate && name) {
                    if (aadhaar) seenAadhaar.add(aadhaar);
                    if (mobile) seenMobile.add(mobile);
                    
                    allRecords.push({
                        name: name,
                        mobile: mobile || number,
                        alt_mobile: altMobile || null,
                        aadhaar: aadhaar || null,
                        address: address ? address.substring(0, 200) : null,
                        circle: circle || null,
                        father_name: fname || null,
                        source: srcName
                    });
                }
            });
        }
        
        // Source 3 extra info
        const source3 = sources.source_3?.data;
        let extraInfo = {};
        if (source3 && typeof source3 === 'object' && !source3.error) {
            extraInfo = {
                sim_card: source3["SIM card"] || source3["Connection"],
                mobile_state: source3["Mobile State"],
                tower_locations: source3["Tower Locations"]
            };
            Object.keys(extraInfo).forEach(k => extraInfo[k] === undefined && delete extraInfo[k]);
        }
        
        res.json({
            success: true,
            user: "@KINGITACHI18",
            query_number: number,
            total_records_found: allRecords.length,
            records: allRecords,
            network_info: extraInfo,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            user: "@KINGITACHI18",
            error: error.message
        });
    }
}
