from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
from datetime import datetime, timedelta
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

app = Flask(__name__)
CORS(app)

DEVELOPER = "@KINGITACHI18"
VERSION = "1.0.0"

# Main API endpoint (same as original)
TG_API_URL = "https://tg2num.suryahacker.workers.dev/"

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "name": "TG to Number Converter",
        "developer": DEVELOPER,
        "version": VERSION,
        "description": "Get mobile number from Telegram ID",
        "endpoints": {
            "/?query=7778930865": "Get number from Telegram ID",
            "/api/status": "API status"
        },
        "example": "https://yourdomain.vercel.app/?query=7778930865",
        "powered_by": DEVELOPER
    })

@app.route('/', methods=['GET'])
def tg_to_number():
    query = request.args.get('query', '')
    
    if not query:
        return jsonify({
            "success": False,
            "error": "Query parameter required",
            "example": "/?query=7778930865",
            "developer": DEVELOPER
        })
    
    try:
        # Call original API
        response = requests.get(f"{TG_API_URL}?query={query}", timeout=15, verify=False)
        
        if response.status_code == 200:
            data = response.json()
            
            # Extract number from response
            number = None
            country = None
            country_code = None
            
            if "results" in data:
                results = data["results"]
                if "results" in results:
                    number = results["results"].get("n")
                    country = results["results"].get("c")
                    country_code = results["results"].get("cc")
                elif "n" in results:
                    number = results.get("n")
                    country = results.get("c")
                    country_code = results.get("cc")
            
            # Also get limit info if available
            req_left = data.get("req_left", "N/A")
            req_total = data.get("req_total", "N/A")
            expiry = data.get("expiry", "N/A")
            
            if number:
                return jsonify({
                    "success": True,
                    "number": number,
                    "country": country,
                    "country_code": country_code,
                    "telegram_id": query,
                    "req_left": req_left,
                    "req_total": req_total,
                    "expiry": expiry,
                    "developer": DEVELOPER
                })
            else:
                return jsonify({
                    "success": False,
                    "error": "Number not found for this Telegram ID",
                    "telegram_id": query,
                    "developer": DEVELOPER
                })
        else:
            return jsonify({
                "success": False,
                "error": f"API returned status {response.status_code}",
                "developer": DEVELOPER
            })
            
    except requests.exceptions.Timeout:
        return jsonify({
            "success": False,
            "error": "Request timeout. Please try again.",
            "developer": DEVELOPER
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)[:100],
            "developer": DEVELOPER
        })

@app.route('/api/status', methods=['GET'])
def status():
    return jsonify({
        "status": "active",
        "developer": DEVELOPER,
        "version": VERSION,
        "endpoint": "TG to Number Converter",
        "usage": "/?query=TELEGRAM_ID"
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
