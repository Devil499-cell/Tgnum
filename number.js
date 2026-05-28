export default async function handler(req, res) {
    // CORS enable
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    // URL se number parameter lelo
    const { number } = req.query;
    
    // Agar number nahi diya
    if (!number) {
        return res.status(200).json({
            success: false,
            user: "@KINGITACHI18",
            message: "Number chahiye bhai!",
            example: "https://patel-number-api.vercel.app/number?number=9693615642"
        });
    }
    
    try {
        console.log(`Searching for: ${number}`);
        
        // Original API call
        const originalUrl = `https://all-number-info-rajan-eta.vercel.app/api?number=${number}`;
        const response = await fetch(originalUrl);
        const data = await response.json();
        
        // Unique records store karne ke liye
        const records = [];
        const seenIds = new Set();
        
        // Source 1 se data lo
        if (data.results?.source_1?.data?.response?.data) {
            for (const item of data.results.source_1.data.response.data) {
                const uniqueId = item.aadhar || item.num;
                if (!seenIds.has(uniqueId) && item.name) {
                    seenIds.add(uniqueId);
                    records.push({
                        name: item.name,
                        mobile: item.num,
                        alt_mobile: item.alt || null,
                        aadhaar: item.aadhar || null,
                        address: item.address ? item.address.substring(0, 150) : null,
                        circle: item.circle || null,
                        father_name: item.fname || null
                    });
                }
            }
        }
        
        // Source 2 se data lo
        if (data.results?.source_2?.data?.data) {
            for (const item of data.results.source_2.data.data) {
                const uniqueId = item.id || item.MOBILE;
                if (!seenIds.has(uniqueId) && item.NAME) {
                    seenIds.add(uniqueId);
                    records.push({
                        name: item.NAME,
                        mobile: item.MOBILE,
                        alt_mobile: item.alt || null,
                        aadhaar: item.id || null,
                        address: item.ADDRESS ? item.ADDRESS.substring(0, 150) : null,
                        circle: item.circle || null,
                        father_name: item.fname || null
                    });
                }
            }
        }
        
        // Source 5 se data lo
        if (data.results?.source_5?.data?.data?.data) {
            for (const item of data.results.source_5.data.data.data) {
                const uniqueId = item.id || item.MOBILE;
                if (!seenIds.has(uniqueId) && item.NAME) {
                    seenIds.add(uniqueId);
                    records.push({
                        name: item.NAME,
                        mobile: item.MOBILE,
                        alt_mobile: item.alt || null,
                        aadhaar: item.id || null,
                        address: item.ADDRESS ? item.ADDRESS.substring(0, 150) : null,
                        circle: item.circle || null,
                        father_name: item.fname || null
                    });
                }
            }
        }
        
        // Final response
        return res.status(200).json({
            success: true,
            user: "@KINGITACHI18",
            developer: "KINGITACHI18",
            number: number,
            total_records: records.length,
            records: records,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        return res.status(200).json({
            success: false,
            user: "@KINGITACHI18",
            error: "Something went wrong",
            message: error.message
        });
    }
}
