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
            example: "https://patel-number-api.vercel.app/number?number=9693615642",
            help: "API usage guide ke liye ?help use karo"
        });
    }
    
    // Help option
    if (number === "help" || number === "?help") {
        return res.status(200).json({
            success: true,
            user: "@KINGITACHI18",
            message: "API Usage Guide",
            commands: {
                basic: "/number?number=YOUR_NUMBER",
                example: "/number?number=9876543210",
                features: [
                    "Get caller name",
                    "Alternative mobile numbers",
                    "Address information",
                    "Aadhaar details",
                    "Circle/Operator info",
                    "Father's name"
                ]
            },
            sources: ["Truecaller", "Google", "Internal Database", "Telegram Logs", "WhatsApp Groups"],
            total_sources: 5
        });
    }
    
    try {
        console.log(`Searching for: ${number}`);
        
        // Validate phone number (Indian)
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(number)) {
            return res.status(200).json({
                success: false,
                user: "@KINGITACHI18",
                message: "Invalid Indian mobile number!",
                error: "Number must start with 6,7,8,9 and be 10 digits long"
            });
        }
        
        // Original API call
        const originalUrl = `https://all-number-info-rajan-eta.vercel.app/api?number=${number}`;
        const response = await fetch(originalUrl);
        const data = await response.json();
        
        // Unique records store karne ke liye
        const records = [];
        const seenIds = new Set();
        
        // Stats for different sources
        const sourceStats = {
            source_1: 0,
            source_2: 0,
            source_5: 0,
            total_processed: 0
        };
        
        // Source 1 se data lo
        const source1Data = data?.results?.source_1?.data?.response?.data;
        if (source1Data && Array.isArray(source1Data)) {
            for (const item of source1Data) {
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
                        father_name: item.fname || null,
                        source: "Truecaller Database",
                        confidence: "High"
                    });
                    sourceStats.source_1++;
                }
            }
        }
        
        // Source 2 se data lo
        const source2Data = data?.results?.source_2?.data?.data;
        if (source2Data && Array.isArray(source2Data)) {
            for (const item of source2Data) {
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
                        father_name: item.fname || null,
                        source: "Google Search",
                        confidence: "Medium"
                    });
                    sourceStats.source_2++;
                }
            }
        }
        
        // Source 5 se data lo - FIXED
        const source5Data = data?.results?.source_5?.data?.data?.data;
        if (source5Data && Array.isArray(source5Data)) {
            for (const item of source5Data) {
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
                        father_name: item.fname || null,
                        source: "Internal Database",
                        confidence: "High"
                    });
                    sourceStats.source_5++;
                }
            }
        }
        
        sourceStats.total_processed = records.length;
        
        // Generate summary
        const summary = {
            unique_names: [...new Set(records.map(r => r.name))].length,
            have_address: records.filter(r => r.address).length,
            have_alt_mobile: records.filter(r => r.alt_mobile).length,
            have_aadhaar: records.filter(r => r.aadhaar).length,
            have_father_name: records.filter(r => r.father_name).length
        };
        
        // Find best match (most complete info)
        const bestMatch = records.length > 0 ? records.reduce((best, current) => {
            const bestScore = Object.values(best).filter(v => v && v !== null).length;
            const currentScore = Object.values(current).filter(v => v && v !== null).length;
            return currentScore > bestScore ? current : best;
        }) : null;
        
        // Final response with more data
        return res.status(200).json({
            success: true,
            user: "@KINGITACHI18",
            developer: "KINGITACHI18",
            api_version: "2.0",
            number: number,
            carrier_info: {
                operator: bestMatch?.circle || "Unknown",
                possible_circle: bestMatch?.circle || "Not available"
            },
            total_records: records.length,
            source_stats: sourceStats,
            summary: summary,
            best_match: bestMatch ? {
                name: bestMatch.name,
                mobile: bestMatch.mobile,
                confidence: bestMatch.confidence,
                source: bestMatch.source
            } : null,
            records: records,
            timestamp: new Date().toISOString(),
            rate_limit: {
                remaining: 995,
                total: 1000,
                reset_at: new Date(Date.now() + 3600000).toISOString()
            }
        });
        
    } catch (error) {
        console.error('Full error:', error);
        return res.status(200).json({
            success: false,
            user: "@KINGITACHI18",
            error: "Something went wrong",
            message: error.message,
            error_code: "API_001",
            support: "Contact @KINGITACHI18 on Telegram",
            timestamp: new Date().toISOString()
        });
    }
}
