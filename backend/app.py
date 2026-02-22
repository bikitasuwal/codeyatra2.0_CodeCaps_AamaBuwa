from flask import Flask, jsonify, request
from flask_cors import CORS
import socket
import sys
import sqlite3
import os
from datetime import datetime

# Create Flask app
app = Flask(__name__)

# Allow all connections
CORS(app, origins="*")

# Your IP from ipconfig
YOUR_IP = "10.5.5.143"
PORT = 5005

# Database setup - RECREATE DATABASE
def init_db():
    # Delete existing database if it exists (to ensure fresh schema)
    db_path = 'aamabuwa.db'
    if os.path.exists(db_path):
        os.remove(db_path)
        print("🗑️ Removed existing database")
    
    # Create new database with correct schema
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()
    print("✅ Database created with full_name field")

# Call this when app starts
init_db()

@app.route('/')
def home():
    return jsonify({
        "message": "🇳🇵 AamaBuwa API",
        "status": "running",
        "server_ip": YOUR_IP,
        "port": PORT,
        "python_version": sys.version,
        "endpoints": {
            "register": f"POST http://{YOUR_IP}:{PORT}/api/register",
            "login": f"POST http://{YOUR_IP}:{PORT}/api/login",
            "test": f"GET http://{YOUR_IP}:{PORT}/api/test",
            "health": f"GET http://{YOUR_IP}:{PORT}/api/health",
            "users": f"GET http://{YOUR_IP}:{PORT}/api/users"
        }
    })

# ==================== REGISTER ENDPOINT ====================
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        print("📝 Registration data received:", data)  # Debug print
        
        full_name = data.get('full_name') or data.get('fullName') or data.get('name')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')  # 'caregiver' or 'elderly'
        
        # Validate input
        if not full_name:
            return jsonify({
                "success": False,
                "message": "Full name is required"
            }), 400
            
        if not email or not password or not role:
            return jsonify({
                "success": False,
                "message": "Email, password and role are required"
            }), 400
        
        if role not in ['caregiver', 'elderly']:
            return jsonify({
                "success": False,
                "message": "Role must be 'caregiver' or 'elderly'"
            }), 400
        
        # Save to database
        conn = sqlite3.connect('aamabuwa.db')
        cursor = conn.cursor()
        
        # Check if email exists
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            conn.close()
            return jsonify({
                "success": False,
                "message": "Email already registered"
            }), 409
        
        # Insert new user with full_name
        cursor.execute(
            "INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)",
            (full_name, email, password, role)
        )
        conn.commit()
        user_id = cursor.lastrowid
        
        # Verify the data was saved correctly
        cursor.execute("SELECT full_name, email, role FROM users WHERE id = ?", (user_id,))
        saved_user = cursor.fetchone()
        print(f"✅ Saved to DB: full_name='{saved_user[0]}', email='{saved_user[1]}', role='{saved_user[2]}'")
        
        conn.close()
        
        # Return success
        role_display = 'Child / Caregiver' if role == 'caregiver' else 'Parent / Elderly'
        return jsonify({
            "success": True,
            "message": "Registration successful!",
            "user": {
                "id": user_id,
                "full_name": full_name,
                "email": email,
                "role": role,
                "role_display": role_display
            }
        }), 201
        
    except Exception as e:
        print("❌ Registration error:", str(e))
        return jsonify({
            "success": False,
            "message": f"Registration failed: {str(e)}"
        }), 500

# ==================== LOGIN ENDPOINT ====================
@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({
                "success": False,
                "message": "Email and password required"
            }), 400
        
        # Check database
        conn = sqlite3.connect('aamabuwa.db')
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, full_name, email, password, role FROM users WHERE email = ?",
            (email,)
        )
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            return jsonify({
                "success": False,
                "message": "User not found"
            }), 401
            
        if user[3] != password:  # Simple password check
            return jsonify({
                "success": False,
                "message": "Invalid password"
            }), 401
        
        # Login successful
        role_display = 'Child / Caregiver' if user[4] == 'caregiver' else 'Parent / Elderly'
        return jsonify({
            "success": True,
            "message": "Login successful",
            "user": {
                "id": user[0],
                "full_name": user[1],
                "email": user[2],
                "role": user[4],
                "role_display": role_display
            }
        }), 200
        
    except Exception as e:
        print("❌ Login error:", str(e))
        return jsonify({
            "success": False,
            "message": f"Login failed: {str(e)}"
        }), 500

# ==================== CHECK EMAIL ENDPOINT ====================
@app.route('/api/check-email', methods=['POST'])
def check_email():
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({"success": False, "message": "Email required"}), 400
        
        conn = sqlite3.connect('aamabuwa.db')
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        exists = cursor.fetchone() is not None
        conn.close()
        
        return jsonify({
            "success": True,
            "exists": exists
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# ==================== GET ALL USERS ====================
@app.route('/api/users', methods=['GET'])
def get_users():
    try:
        conn = sqlite3.connect('aamabuwa.db')
        cursor = conn.cursor()
        cursor.execute("SELECT id, full_name, email, role, created_at FROM users")
        users = cursor.fetchall()
        conn.close()
        
        user_list = []
        for user in users:
            role_display = 'Child / Caregiver' if user[3] == 'caregiver' else 'Parent / Elderly'
            user_list.append({
                "id": user[0],
                "full_name": user[1],
                "email": user[2],
                "role": user[3],
                "role_display": role_display,
                "created_at": user[4]
            })
        
        return jsonify({
            "success": True,
            "count": len(user_list),
            "users": user_list
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# ==================== GET USER BY ID ====================
@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    try:
        conn = sqlite3.connect('aamabuwa.db')
        cursor = conn.cursor()
        cursor.execute("SELECT id, full_name, email, role, created_at FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            return jsonify({"success": False, "message": "User not found"}), 404
        
        role_display = 'Child / Caregiver' if user[3] == 'caregiver' else 'Parent / Elderly'
        return jsonify({
            "success": True,
            "user": {
                "id": user[0],
                "full_name": user[1],
                "email": user[2],
                "role": user[3],
                "role_display": role_display,
                "created_at": user[4]
            }
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# ==================== TEST ENDPOINT ====================
@app.route('/api/test')
def test():
    return jsonify({
        "success": True,
        "message": "Backend is working!",
        "from_ip": YOUR_IP,
        "port": PORT
    })

# ==================== HEALTH ENDPOINT ====================
@app.route('/api/health')
def health():
    # Check database connection and schema
    db_status = "connected"
    schema_status = "unknown"
    try:
        conn = sqlite3.connect('aamabuwa.db')
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(users)")
        columns = cursor.fetchall()
        column_names = [col[1] for col in columns]
        schema_status = f"columns: {column_names}"
        conn.close()
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return jsonify({
        "status": "healthy",
        "server": "running",
        "ip": YOUR_IP,
        "port": PORT,
        "database": db_status,
        "schema": schema_status,
        "timestamp": datetime.now().isoformat()
    })

# ==================== DEBUG ENDPOINT ====================
@app.route('/api/debug/db', methods=['GET'])
def debug_db():
    """Debug endpoint to check database structure"""
    try:
        conn = sqlite3.connect('aamabuwa.db')
        cursor = conn.cursor()
        
        # Get table info
        cursor.execute("PRAGMA table_info(users)")
        columns = cursor.fetchall()
        
        # Get count
        cursor.execute("SELECT COUNT(*) FROM users")
        count = cursor.fetchone()[0]
        
        # Get sample data
        cursor.execute("SELECT * FROM users LIMIT 5")
        sample = cursor.fetchall()
        
        conn.close()
        
        return jsonify({
            "success": True,
            "table_exists": True,
            "column_count": len(columns),
            "columns": [{"name": col[1], "type": col[2]} for col in columns],
            "user_count": count,
            "sample_data": sample
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 AamaBuwa Backend with Full Name")
    print("=" * 60)
    print(f"📱 Local URL: http://localhost:{PORT}")
    print(f"📱 Network URL: http://{YOUR_IP}:{PORT}")
    print("\n📱 SHARE THIS WITH YOUR TEAM:")
    print(f"   http://{YOUR_IP}:{PORT}")
    print("=" * 60)
    print("\n📝 ENDPOINTS:")
    print(f"   POST  /api/register   - Register new user (with full_name)")
    print(f"   POST  /api/login      - Login user")
    print(f"   POST  /api/check-email - Check if email exists")
    print(f"   GET   /api/users      - List all users")
    print(f"   GET   /api/users/<id> - Get user by ID")
    print(f"   GET   /api/test       - Test connection")
    print(f"   GET   /api/health     - Health check")
    print(f"   GET   /api/debug/db   - Debug database schema")
    print("=" * 60)
    
    # Run the app
    app.run(debug=True, host='0.0.0.0', port=PORT)