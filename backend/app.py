from flask import Flask, jsonify, request
from flask_cors import CORS
import socket
import sys

# Create Flask app
app = Flask(__name__)

# Allow all connections
CORS(app, origins="*")

# Your IP from ipconfig
YOUR_IP = "10.5.5.143"
PORT = 5005  # Changed to 5005

@app.route('/')
def home():
    return jsonify({
        "message": "🇳🇵 AamaBuwa API - TEST MODE",
        "status": "running",
        "server_ip": YOUR_IP,
        "port": PORT,
        "python_version": sys.version,
        "test_urls": {
            "local": f"http://localhost:{PORT}/api/test",
            "network": f"http://{YOUR_IP}:{PORT}/api/test"
        }
    })

@app.route('/api/test')
def test():
    return jsonify({
        "success": True,
        "message": "Backend is working!",
        "from_ip": YOUR_IP,
        "port": PORT
    })

@app.route('/api/health')
def health():
    return jsonify({
        "status": "healthy",
        "server": "running",
        "ip": YOUR_IP,
        "port": PORT
    })

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 AamaBuwa Backend TEST MODE")
    print("=" * 60)
    print(f"📱 Local URL: http://localhost:{PORT}")
    print(f"📱 Network URL: http://{YOUR_IP}:{PORT}")
    print("\n📱 SHARE THIS WITH YOUR TEAM:")
    print(f"   http://{YOUR_IP}:{PORT}")
    print("=" * 60)
    print("\n✅ Testing URLs:")
    print(f"   • http://localhost:{PORT}")
    print(f"   • http://localhost:{PORT}/api/test")
    print(f"   • http://{YOUR_IP}:{PORT}/api/test")
    print("=" * 60)
    
    # Run the app on port 5005
    app.run(debug=True, host='0.0.0.0', port=PORT)