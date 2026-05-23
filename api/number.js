module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const { number } = req.query;
    
    if (!number) {
        return res.status(400).json({
            success: false,
            developer: "@KINGITACHI18",
            error: "Number parameter required",
            example: "/api/number?number=9876543210"
        });
    }
    
    if (!/^\d{10}$/.test(number)) {
        return res.status(400).json({
            success: false,
            developer: "@KINGITACHI18",
            error: "Invalid 10-digit mobile number"
        });
    }
    
    try {
        const apiUrl = `https://all-number-info-rajan-eta.vercel.app/api?number=${number}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        let records = [];
        if (data.results?.source_2?.data?.data) {
            records = data.results.source_2.data.data;
        }
        
        const unique = [];
        const seen = new Set();
        
        for (const rec of records) {
            const mobile = rec.MOBILE;
            if (!seen.has(mobile) && unique.length < 5) {
                seen.add(mobile);
                unique.push({
                    name: rec.NAME || "N/A",
                    mobile: rec.MOBILE || number,
                    father: rec.fname || "N/A",
                    address: (rec.ADDRESS || "N/A").substring(0, 100),
                    operator: rec.circle || "N/A",
                    alt: rec.alt || "N/A"
                });
            }
        }
        
        return res.status(200).json({
            success: true,
            developer: "@KINGITACHI18",
            number: number,
            total: unique.length,
            data: unique
        });
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            developer: "@KINGITACHI18",
            error: error.message
        });
    }
};
