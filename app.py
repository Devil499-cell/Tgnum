from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import urllib3

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

app = Flask(__name__)
CORS(app)

DEVELOPER = "@KINGITACHI18"
TG_API_URL = "https://tg2num.suryahacker.workers.dev/"

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "name": "TG to Number Converter",
        "developer": DEVELOPER,
        "status": "✅ API IS WORKING",
        "usage": "https://tgnum-patel.vercel.app/api?query=7778930865",
        "example": "https://tgnum-patel.vercel.app/api?query=7778930865"
    })

@app.route('/api', methods=['GET'])
def tg_to_number():
    query = request.args.get('query', '')
    
    if not query:
        return jsonify({
            "success": False,
            "error": "Query parameter required",
            "usage": "/api?query=7778930865"
        })
    
    try:
        response = requests.get(f"{TG_API_URL}?query={query}", timeout=15, verify=False)
        
        if response.status_code == 200:
            data = response.json()
            
            # Extract number
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
            
            if number:
                return jsonify({
                    "success": True,
                    "number": number,
                    "country": country,
                    "country_code": country_code,
                    "telegram_id": query,
                    "developer": DEVELOPER
                })
            else:
                return jsonify({
                    "success": False,
                    "error": "Number not found",
                    "telegram_id": query
                })
        else:
            return jsonify({
                "success": False,
                "error": f"API error: {response.status_code}"
            })
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)[:100]
        })

@app.route('/api/status', methods=['GET'])
def status():
    return jsonify({
        "status": "active",
        "developer": DEVELOPER,
        "endpoint": "/api?query=TG_ID"
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
