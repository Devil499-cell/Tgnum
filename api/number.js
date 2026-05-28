const express = require('express');
const app = express();

// Enable CORS (so browser se bhi use kar sako)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Main API endpoint
app.get('/api', async (req, res) => {
    const { number } = req.query;
    
    // Agar number nahi diya toh error
    if (!number) {
        return res.status(400).json({ 
            success: false,
            user: "@KINGITACHI18",
            error: "Number parameter required", 
            example: "/api?number=9693615642" 
        });
    }
    
    try {
        console.log(`🔍 Fetching data for: ${number}`);
        
        // Original API call (jo aapne diya tha)
        const response = await fetch(`https://all-number-info-rajan-eta.vercel.app/api?number=${number}`);
        const rawData = await response.json();
        
        // Sab records store karne ke liye
        const allRecords = [];
        const seenAadhaar = new Set();
        const seenMobile = new Set();
        
        const sources = rawData.results || {};
        
        // Saare sources se data extract karo
        for (const [srcName, srcData] of Object.entries(sources)) {
            if (srcData.status !== 'success') continue;
            
            let records = [];
            const data = srcData.data;
            
            // Different data structures handle karo
            if (data?.response?.data) records = data.response.data;
            else if (Array.isArray(data?.data)) records = data.data;
            else if (data?.data?.data) records = data.data.data;
            else if (Array.isArray(data)) records = data;
            
            // Har record se useful fields nikal lo
            records.forEach(record => {
                const name = record.name || record.NAME;
                const mobile = record.num || record.MOBILE;
                const aadhaar = record.aadhar || record.id;
                const altMobile = record.alt;
                const address = record.address || record.ADDRESS;
                const circle = record.circle;
                const fname = record.fname;
                
                // Duplicate check (same aadhaar ya mobile)
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
        
        // Source 3 se extra network info
        const source3 = sources.source_3?.data;
        let extraInfo = {};
        if (source3 && typeof source3 === 'object' && !source3.error) {
            extraInfo = {
                sim_card: source3["SIM card"] || source3["Connection"] || null,
                mobile_state: source3["Mobile State"] || null,
                tower_locations: source3["Tower Locations"] || null,
                tracking_history: source3["Tracking History"] || null
            };
            // Remove null values
            Object.keys(extraInfo).forEach(k => extraInfo[k] === null && delete extraInfo[k]);
        }
        
        // Final response with ALL records (5+)
        res.json({
            success: true,
            user: "@KINGITACHI18",
            developer: "KINGITACHI18",
            query_number: number,
            total_records_found: allRecords.length,
            records: allRecords,  // ✅ Sare records bhej raha
            network_info: extraInfo,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        res.status(500).json({
            success: false,
            user: "@KINGITACHI18",
            error: "Failed to fetch data",
            message: error.message
        });
    }
});

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: "✅ Master API is running",
        user: "@KINGITACHI18",
        endpoints: {
            master_api: "/api?number=9693615642",
            health: "/"
        },
        features: {
            unique_records: "All duplicates removed",
            max_records: "No limit - returns all found",
            sources_parsed: 9
        }
    });
});

// Agar koi aur route ho toh 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: "Route not found",
        available_endpoints: ["/", "/api?number=YOUR_NUMBER"]
    });
});

module.exports = app;
