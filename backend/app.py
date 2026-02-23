from flask import Flask, jsonify, request
from flask_cors import CORS
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

# Database setup
def init_db():
    db_path = 'aamabuwa.db'
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create family_links table to connect caregivers with parents
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS family_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            caregiver_id INTEGER NOT NULL,
            parent_id INTEGER NOT NULL,
            relationship TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (caregiver_id) REFERENCES users (id),
            FOREIGN KEY (parent_id) REFERENCES users (id),
            UNIQUE(caregiver_id, parent_id)
        )
    ''')
    
    # Create health_status table for parent health data
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS health_status (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            parent_id INTEGER NOT NULL,
            morning_meds_taken BOOLEAN DEFAULT 0,
            evening_meds_taken BOOLEAN DEFAULT 0,
            blood_pressure TEXT,
            blood_sugar TEXT,
            notes TEXT,
            date DATE DEFAULT CURRENT_DATE,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (parent_id) REFERENCES users (id)
        )
    ''')
    
    # Create tasks table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            caregiver_id INTEGER NOT NULL,
            parent_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            completed BOOLEAN DEFAULT 0,
            due_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (caregiver_id) REFERENCES users (id),
            FOREIGN KEY (parent_id) REFERENCES users (id)
        )
    ''')
    
    # Create child_contacts table for emergency contact info
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS child_contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            full_name TEXT,
            contact_number TEXT,
            address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ Database initialized with all tables")

# Initialize database
init_db()

@app.route('/')
def home():
    return jsonify({
        "message": "🇳🇵 AamaBuwa API",
        "status": "running",
        "server_ip": YOUR_IP,
        "port": PORT,
        "endpoints": {
            "register": f"POST http://{YOUR_IP}:{PORT}/api/register",
            "login": f"POST http://{YOUR_IP}:{PORT}/api/login",
            "my-parents": f"GET http://{YOUR_IP}:{PORT}/api/my-parents?user_id=YOUR_ID",
            "parent-health": f"GET http://{YOUR_IP}:{PORT}/api/parent-health/PARENT_ID",
            "parent-tasks": f"GET http://{YOUR_IP}:{PORT}/api/parent-tasks/PARENT_ID?caregiver_id=YOUR_ID",
            "add-family": f"POST http://{YOUR_IP}:{PORT}/api/add-family-link",
            "create-sample": f"POST http://{YOUR_IP}:{PORT}/api/create-sample-family",
            "test": f"GET http://{YOUR_IP}:{PORT}/api/test",
            "users": f"GET http://{YOUR_IP}:{PORT}/api/users"
        }
    })

# ==================== REGISTER ENDPOINT ====================
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        print("📝 Registration data received:", data)
        
        full_name = data.get('full_name')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')
        
        # Validate input
        if not full_name:
            return jsonify({"success": False, "message": "Full name is required"}), 400
        if not email or not password or not role:
            return jsonify({"success": False, "message": "Email, password and role are required"}), 400
        if role not in ['caregiver', 'elderly']:
            return jsonify({"success": False, "message": "Role must be 'caregiver' or 'elderly'"}), 400
        
        conn = sqlite3.connect('aamabuwa.db')
        cursor = conn.cursor()
        
        # Check if email exists
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            conn.close()
            return jsonify({"success": False, "message": "Email already registered"}), 409
        
        # Insert new user
        cursor.execute(
            "INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)",
            (full_name, email, password, role)
        )
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        
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
        return jsonify({"success": False, "message": f"Registration failed: {str(e)}"}), 500

# ==================== LOGIN ENDPOINT ====================
@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({"success": False, "message": "Email and password required"}), 400
        
        conn = sqlite3.connect('aamabuwa.db')
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, full_name, email, password, role FROM users WHERE email = ?",
            (email,)
        )
        user = cursor.fetchone()
        conn.close()
        
        if not user or user[3] != password:
            return jsonify({"success": False, "message": "Invalid email or password"}), 401
        
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
        return jsonify({"success": False, "message": f"Login failed: {str(e)}"}), 500

# ==================== GET CHILD'S PARENTS ====================
@app.route('/api/my-parents', methods=['GET'])
def get_my_parents():
    try:
        caregiver_id = request.args.get('user_id')
        
        if not caregiver_id:
            return jsonify({"success": False, "message": "User ID required"}), 400
        
        conn = sqlite3.connect('aamabuwa.db')
        cursor = conn.cursor()
        
        # Get all parents linked to this caregiver
        cursor.execute('''
            SELECT u.id, u.full_name, u.email, fl.relationship 
            FROM users u
            JOIN family_links fl ON u.id = fl.parent_id
            WHERE fl.caregiver_id = ?
        ''', (caregiver_id,))
        
        parents = cursor.fetchall()
        conn.close()
        
        parent_list = []
        for parent in parents:
            parent_list.append({
                "id": parent[0],
                "full_name": parent[1],
                "email": parent[2],
                "relationship": parent[3] or "Parent"
            })
        
        return jsonify({
            "success": True,
            "parents": parent_list
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# ==================== GET PARENT HEALTH STATUS ====================
@app.route('/api/parent-health/<int:parent_id>', methods=['GET'])
def get_parent_health(parent_id):
    try:
        conn = sqlite3.connect('aamabuwa.db')
        cursor = conn.cursor()
        
        # Get today's health status
        cursor.execute('''
            SELECT morning_meds_taken, evening_meds_taken, 
                   blood_pressure, blood_sugar, notes, date
            FROM health_status 
            WHERE parent_id = ? AND date = CURRENT_DATE
        ''', (parent_id,))
        
        health = cursor.fetchone()
        conn.close()
        
        if health:
            return jsonify({
                "success": True,
                "health": {
                    "morning_meds_taken": bool(health[0]),
                    "evening_meds_taken": bool(health[1]),
                    "blood_pressure": health[2] or "Not recorded",
                    "blood_sugar": health[3] or "Not recorded",
                    "notes": health[4] or "",
                    "date": health[5]
                }
            })
        else:
            # Return default values if no data for today
            return jsonify({
                "success": True,
                "health": {
                    "morning_meds_taken": False,
                    "evening_meds_taken": False,
                    "blood_pressure": "Not recorded",
                    "blood_sugar": "Not recorded",
                    "notes": "",
                    "date": datetime.now().strftime("%Y-%m-%d")
                }
            })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# ==================== GET PARENT TASKS ====================
@app.route('/api/parent-tasks/<int:parent_id>', methods=['GET'])
def get_parent_tasks(parent_id):
    try:
        caregiver_id = request.args.get('caregiver_id')
        
        if not caregiver_id:
            return jsonify({"success": False, "message": "Caregiver ID required"}), 400
        
        conn = sqlite3.connect('aamabuwa.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, title, description, completed, due_date
            FROM tasks 
            WHERE parent_id = ? AND caregiver_id = ?
            ORDER BY created_at DESC
        ''', (parent_id, caregiver_id))
        
        tasks = cursor.fetchall()
        conn.close()
        
        task_list = []
        for task in tasks:
            task_list.append({
                "id": task[0],
                "title": task[1],
                "description": task[2],
                "completed": bool(task[3]),
                "due_date": task[4]
            })
        
        return jsonify({
            "success": True,
            "tasks": task_list
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# ==================== DELETE TASK ====================
@app.route('/api/delete-task/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    try:
        conn = sqlite3.connect('aamabuwa.db')
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        
        conn.commit()
        conn.close()
        
        return jsonify({"success": True, "message": "Task deleted successfully"})
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# ==================== ADD FAMILY LINK ====================
@app.route('/api/add-family-link', methods=['POST'])
def add_family_link():
    try:
        data = request.get_json()
        
        caregiver_id = data.get('caregiver_id')
        parent_id = data.get('parent_id')
        relationship = data.get('relationship', 'Parent')
        
        if not caregiver_id or not parent_id:
            return jsonify({"success": False, "message": "Caregiver ID and Parent ID required"}), 400
        
        conn = sqlite3.connect('aamabuwa.db')
        cursor = conn.cursor()

        # Prevent multiple parents per caregiver: check existing link
        cursor.execute('SELECT parent_id FROM family_links WHERE caregiver_id = ?', (caregiver_id,))
        existing = cursor.fetchone()
        if existing:
            conn.close()
            return jsonify({"success": False, "message": "Caregiver already linked to a parent"}), 409

        # Create family link
        cursor.execute('''
            INSERT INTO family_links (caregiver_id, parent_id, relationship)
            VALUES (?, ?, ?)
        ''', (caregiver_id, parent_id, relationship))

        conn.commit()
        conn.close()

        return jsonify({"success": True, "message": "Family link added successfully"})
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    
# ==================== REMOVE FAMILY LINK ====================
@app.route('/api/remove-family-link', methods=['POST'])
def remove_family_link():
    try:
        data = request.get_json()
        caregiver_id = data.get('caregiver_id')
        
        conn = sqlite3.connect('aamabuwa.db')
        cursor = conn.cursor()
        
        # Delete family link
        cursor.execute("DELETE FROM family_links WHERE caregiver_id = ?", (caregiver_id,))
        
        # Delete tasks for this caregiver
        cursor.execute("DELETE FROM tasks WHERE caregiver_id = ?", (caregiver_id,))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Family link removed successfully"
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    
    

# ==================== ADD HEALTH DATA ====================
@app.route('/api/add-health-data', methods=['POST'])
def add_health_data():
    try:
        data = request.get_json()
        
        parent_id = data.get('parent_id')
        morning_meds = data.get('morning_meds_taken', 1)
        evening_meds = data.get('evening_meds_taken', 0)
        bp = data.get('blood_pressure', '120/80')
        sugar = data.get('blood_sugar', '100')
        
        conn = sqlite3.connect('aamabuwa.db')
        cursor = conn.cursor()
        
        # Insert or replace today's health data
        cursor.execute('''
            INSERT OR REPLACE INTO health_status 
            (parent_id, morning_meds_taken, evening_meds_taken, blood_pressure, blood_sugar, date)
            VALUES (?, ?, ?, ?, ?, CURRENT_DATE)
        ''', (parent_id, morning_meds, evening_meds, bp, sugar))
        
        conn.commit()
        conn.close()
        
        return jsonify({"success": True, "message": "Health data added"})
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# ==================== ADD TASK ====================
@app.route('/api/add-task', methods=['POST'])
def add_task():
    try:
        data = request.get_json()
        
        caregiver_id = data.get('caregiver_id')
        parent_id = data.get('parent_id')
        title = data.get('title')
        description = data.get('description', '')
        
        if not caregiver_id or not parent_id or not title:
            return jsonify({"success": False, "message": "Missing required fields"}), 400
        
        conn = sqlite3.connect('aamabuwa.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO tasks (caregiver_id, parent_id, title, description)
            VALUES (?, ?, ?, ?)
        ''', (caregiver_id, parent_id, title, description))
        
        conn.commit()
        task_id = cursor.lastrowid
        conn.close()
        
        return jsonify({
            "success": True, 
            "message": "Task added",
            "task_id": task_id
        }), 201
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# ==================== UPDATE TASK ====================
@app.route('/api/update-task/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    try:
        data = request.get_json()
        completed = data.get('completed', False)
        
        conn = sqlite3.connect('aamabuwa.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE tasks SET completed = ? WHERE id = ?
        ''', (1 if completed else 0, task_id))
        
        conn.commit()
        conn.close()
        
        return jsonify({"success": True, "message": "Task updated"})
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# ==================== CREATE SAMPLE FAMILY (IMPROVED) ====================
@app.route('/api/create-sample-family', methods=['POST'])
def create_sample_family():
    """Improved endpoint to create sample family with proper validation"""
    try:
        data = request.get_json()
        caregiver_email = data.get('caregiver_email')
        parent_email = data.get('parent_email')
        relationship = data.get('relationship', 'Mother')
        
        # Validate emails
        if not caregiver_email or not parent_email:
            return jsonify({
                "success": False, 
                "message": "Both caregiver_email and parent_email are required"
            }), 400
        
        conn = sqlite3.connect('aamabuwa.db')
        cursor = conn.cursor()
        
        # Get caregiver ID
        cursor.execute("SELECT id, full_name FROM users WHERE email = ?", (caregiver_email,))
        caregiver = cursor.fetchone()
        
        # Get parent ID
        cursor.execute("SELECT id, full_name FROM users WHERE email = ?", (parent_email,))
        parent = cursor.fetchone()
        
        # Check if both users exist
        if not caregiver:
            conn.close()
            return jsonify({
                "success": False, 
                "message": f"Caregiver with email '{caregiver_email}' not found. Please register first."
            }), 404
        
        if not parent:
            conn.close()
            return jsonify({
                "success": False, 
                "message": f"Parent with email '{parent_email}' not found. Please register first."
            }), 404
        
        # Check if caregiver is actually a caregiver
        cursor.execute("SELECT role FROM users WHERE id = ?", (caregiver[0],))
        caregiver_role = cursor.fetchone()[0]
        if caregiver_role != 'caregiver':
            conn.close()
            return jsonify({
                "success": False,
                "message": f"User '{caregiver_email}' is registered as {caregiver_role}, not as a caregiver."
            }), 400
        
        # Check if parent is actually elderly
        cursor.execute("SELECT role FROM users WHERE id = ?", (parent[0],))
        parent_role = cursor.fetchone()[0]
        if parent_role != 'elderly':
            conn.close()
            return jsonify({
                "success": False,
                "message": f"User '{parent_email}' is registered as {parent_role}, not as an elderly parent."
            }), 400
        
        # Check if link already exists
        cursor.execute('''
            SELECT id FROM family_links 
            WHERE caregiver_id = ? AND parent_id = ?
        ''', (caregiver[0], parent[0]))
        
        if cursor.fetchone():
            conn.close()
            return jsonify({
                "success": False,
                "message": f"Family link already exists between {caregiver[1]} and {parent[1]}"
            }), 409

        # Prevent linking a caregiver to multiple parents
        cursor.execute('SELECT id FROM family_links WHERE caregiver_id = ?', (caregiver[0],))
        if cursor.fetchone():
            conn.close()
            return jsonify({
                "success": False,
                "message": f"Caregiver '{caregiver[1]}' is already linked to a parent"
            }), 409
        
        # Create family link
        cursor.execute('''
            INSERT INTO family_links (caregiver_id, parent_id, relationship)
            VALUES (?, ?, ?)
        ''', (caregiver[0], parent[0], relationship))
        
        # Add sample health data for today
        cursor.execute('''
            INSERT OR REPLACE INTO health_status 
            (parent_id, morning_meds_taken, evening_meds_taken, blood_pressure, blood_sugar, date)
            VALUES (?, 0, 0, '120/80', '100', CURRENT_DATE)
        ''', (parent[0],))
        
        # Add sample tasks
        sample_tasks = [
            (f"Call {parent[1]} this evening", "Evening video call", caregiver[0], parent[0]),
            ("Refill prescription", "Metformin - due in 3 days", caregiver[0], parent[0]),
            ("Check BP readings", "Record morning and evening", caregiver[0], parent[0])
        ]
        
        for task in sample_tasks:
            cursor.execute('''
                INSERT INTO tasks (title, description, caregiver_id, parent_id)
                VALUES (?, ?, ?, ?)
            ''', task)
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True, 
            "message": f"✅ Family created! {caregiver[1]} (caregiver) linked to {parent[1]} ({relationship})"
        }), 201
        
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

# ==================== GET ALL USERS ====================
@app.route('/api/users', methods=['GET'])
def get_users():
    try:
        # Optional: restrict returned users based on requester (to avoid exposing all parent profiles)
        requester_id = request.args.get('requester_id')

        conn = sqlite3.connect('aamabuwa.db')
        cursor = conn.cursor()

        if requester_id:
            # If requester is a caregiver, return only their linked parent (if any)
            cursor.execute("SELECT role FROM users WHERE id = ?", (requester_id,))
            row = cursor.fetchone()
            if row and row[0] == 'caregiver':
                cursor.execute('''
                    SELECT u.id, u.full_name, u.email, u.role, u.created_at
                    FROM users u
                    JOIN family_links fl ON u.id = fl.parent_id
                    WHERE fl.caregiver_id = ?
                ''', (requester_id,))
            else:
                # Non-caregiver requester: fall back to full list
                cursor.execute("SELECT id, full_name, email, role, created_at FROM users")
        else:
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

# ==================== DELETE USER (for testing) ====================
@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        conn = sqlite3.connect('aamabuwa.db')
        cursor = conn.cursor()
        
        # Delete family links first
        cursor.execute("DELETE FROM family_links WHERE caregiver_id = ? OR parent_id = ?", (user_id, user_id))
        cursor.execute("DELETE FROM health_status WHERE parent_id = ?", (user_id,))
        cursor.execute("DELETE FROM tasks WHERE caregiver_id = ? OR parent_id = ?", (user_id, user_id))
        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
        
        conn.commit()
        conn.close()
        
        return jsonify({"success": True, "message": "User deleted"})
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# @app.route('/api/save-child-contact', methods=['POST'])
# def save_child_contact():
#     try:
#         data = request.get_json()
#         user_id = data.get('user_id')
#         full_name = data.get('full_name')
#         contact_number = data.get('contact_number')
#         address = data.get('address')
        
#         if not all([user_id, full_name, contact_number, address]):
#             return jsonify({"success": False, "message": "All fields are required"}), 400
        
#         conn = sqlite3.connect('aamabuwa.db')
#         cursor = conn.cursor()
        
#         # Check if contact already exists
#         cursor.execute('SELECT id FROM child_contacts WHERE user_id = ?', (user_id,))
#         existing = cursor.fetchone()
        
#         if existing:
#             # Update existing contact
#             cursor.execute('''
#                 UPDATE child_contacts 
#                 SET full_name = ?, contact_number = ?, address = ?, updated_at = CURRENT_TIMESTAMP
#                 WHERE user_id = ?
#             ''', (full_name, contact_number, address, user_id))
#         else:
#             # Insert new contact
#             cursor.execute('''
#                 INSERT INTO child_contacts (user_id, full_name, contact_number, address)
#                 VALUES (?, ?, ?, ?)
#             ''', (user_id, full_name, contact_number, address))
        
#         conn.commit()
#         conn.close()
        
#         return jsonify({"success": True, "message": "Contact information saved successfully"})
        
#     except Exception as e:
#         return jsonify({"success": False, "message": str(e)}), 500

# ==================== MULTIPLE CONTACTS ENDPOINTS ====================

# ==================== GET ALL CONTACTS FOR A USER ====================
@app.route('/api/child-contacts/<int:user_id>', methods=['GET'])
def get_child_contacts(user_id):
    try:
        print(f"📥 Fetching contacts for user_id: {user_id}")
        
        conn = sqlite3.connect('aamabuwa.db')
        cursor = conn.cursor()
        
        # First check if table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='child_contacts'")
        table_exists = cursor.fetchone()
        
        if not table_exists:
            print("❌ child_contacts table does not exist")
            conn.close()
            return jsonify({
                "success": False,
                "message": "Contacts table not found"
            }), 500
        
        # Check what columns exist
        cursor.execute("PRAGMA table_info(child_contacts)")
        columns = cursor.fetchall()
        column_names = [col[1] for col in columns]
        print(f"📊 Table columns: {column_names}")
        
        # Build query based on existing columns
        if 'relationship' in column_names:
            cursor.execute('''
                SELECT id, full_name, contact_number, address, relationship, created_at
                FROM child_contacts 
                WHERE user_id = ?
                ORDER BY created_at DESC
            ''', (user_id,))
        else:
            cursor.execute('''
                SELECT id, full_name, contact_number, address, created_at
                FROM child_contacts 
                WHERE user_id = ?
                ORDER BY created_at DESC
            ''', (user_id,))
        
        contacts = cursor.fetchall()
        print(f"✅ Found {len(contacts)} contacts")
        
        contact_list = []
        for contact in contacts:
            if len(contact) == 6:  # Has relationship column
                contact_list.append({
                    "id": contact[0],
                    "full_name": contact[1],
                    "contact_number": contact[2],
                    "address": contact[3],
                    "relationship": contact[4],
                    "created_at": contact[5]
                })
            else:  # No relationship column
                contact_list.append({
                    "id": contact[0],
                    "full_name": contact[1],
                    "contact_number": contact[2],
                    "address": contact[3],
                    "relationship": "",
                    "created_at": contact[4]
                })
        
        conn.close()
        
        return jsonify({
            "success": True,
            "contacts": contact_list
        })
        
    except Exception as e:
        print(f"❌ Error in get_child_contacts: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

# ==================== ADD NEW CONTACT ====================
@app.route('/api/add-child-contact', methods=['POST'])
def add_child_contact():
    try:
        data = request.get_json()
        print(f"📥 Adding contact with data: {data}")
        
        user_id = data.get('user_id')
        full_name = data.get('full_name')
        contact_number = data.get('contact_number')
        address = data.get('address')
        relationship = data.get('relationship', '')
        
        if not all([user_id, full_name, contact_number, address]):
            missing = []
            if not user_id: missing.append('user_id')
            if not full_name: missing.append('full_name')
            if not contact_number: missing.append('contact_number')
            if not address: missing.append('address')
            return jsonify({
                "success": False,
                "message": f"Missing required fields: {', '.join(missing)}"
            }), 400
        
        conn = sqlite3.connect('aamabuwa.db')
        cursor = conn.cursor()
        
        # Check what columns exist
        cursor.execute("PRAGMA table_info(child_contacts)")
        columns = cursor.fetchall()
        column_names = [col[1] for col in columns]
        print(f"📊 Table columns: {column_names}")
        
        # Insert based on existing columns
        if 'relationship' in column_names:
            cursor.execute('''
                INSERT INTO child_contacts (user_id, full_name, contact_number, address, relationship)
                VALUES (?, ?, ?, ?, ?)
            ''', (user_id, full_name, contact_number, address, relationship))
        else:
            cursor.execute('''
                INSERT INTO child_contacts (user_id, full_name, contact_number, address)
                VALUES (?, ?, ?, ?)
            ''', (user_id, full_name, contact_number, address))
        
        conn.commit()
        contact_id = cursor.lastrowid
        conn.close()
        
        print(f"✅ Contact added with ID: {contact_id}")
        
        return jsonify({
            "success": True,
            "message": "Contact added successfully",
            "contact_id": contact_id
        }), 201
        
    except Exception as e:
        print(f"❌ Error in add_child_contact: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

# ==================== DELETE CONTACT ====================
@app.route('/api/delete-child-contact/<int:contact_id>', methods=['DELETE'])
def delete_child_contact(contact_id):
    try:
        print(f"📥 Deleting contact ID: {contact_id}")
        
        conn = sqlite3.connect('aamabuwa.db')
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM child_contacts WHERE id = ?", (contact_id,))
        
        conn.commit()
        conn.close()
        
        print(f"✅ Contact deleted successfully")
        
        return jsonify({
            "success": True,
            "message": "Contact deleted successfully"
        })
        
    except Exception as e:
        print(f"❌ Error in delete_child_contact: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500
    
# ==================== UPDATE DATABASE SCHEMA ====================
@app.route('/api/update-db-schema', methods=['GET'])
def update_db_schema():
    try:
        print("📥 Updating database schema...")
        
        conn = sqlite3.connect('aamabuwa.db')
        cursor = conn.cursor()
        
        # Check if child_contacts table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='child_contacts'")
        table_exists = cursor.fetchone()
        
        if not table_exists:
            # Create the table if it doesn't exist
            cursor.execute('''
                CREATE TABLE child_contacts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    full_name TEXT NOT NULL,
                    contact_number TEXT NOT NULL,
                    address TEXT NOT NULL,
                    relationship TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            ''')
            print("✅ Created child_contacts table")
        else:
            # Check if relationship column exists
            cursor.execute("PRAGMA table_info(child_contacts)")
            columns = cursor.fetchall()
            column_names = [column[1] for column in columns]
            print(f"📊 Existing columns: {column_names}")
            
            if 'relationship' not in column_names:
                # Add relationship column
                cursor.execute('''
                    ALTER TABLE child_contacts 
                    ADD COLUMN relationship TEXT
                ''')
                print("✅ Added relationship column to child_contacts table")
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "Database schema updated successfully"
        })
        
    except Exception as e:
        print(f"❌ Error in update_db_schema: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

# ==================== FIX CONTACTS TABLE COMPLETELY ====================
@app.route('/api/fix-contacts-final', methods=['GET'])
def fix_contacts_final():
    try:
        print("🔧 Starting complete contacts table fix...")
        
        conn = sqlite3.connect('aamabuwa.db')
        cursor = conn.cursor()
        
        # Step 1: Backup existing contacts
        cursor.execute("SELECT COUNT(*) FROM child_contacts")
        contact_count = cursor.fetchone()[0]
        print(f"📊 Found {contact_count} existing contacts")
        
        if contact_count > 0:
            cursor.execute("CREATE TABLE IF NOT EXISTS child_contacts_backup AS SELECT * FROM child_contacts")
            print("✅ Backed up existing contacts")
        
        # Step 2: Drop the old table
        cursor.execute("DROP TABLE IF EXISTS child_contacts")
        print("✅ Dropped old table")
        
        # Step 3: Create new table with correct structure (NO UNIQUE CONSTRAINTS)
        cursor.execute('''
            CREATE TABLE child_contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                full_name TEXT NOT NULL,
                contact_number TEXT NOT NULL,
                address TEXT NOT NULL,
                relationship TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        print("✅ Created new table with relationship column")
        
        # Step 4: Restore data if any existed
        if contact_count > 0:
            try:
                cursor.execute('''
                    INSERT INTO child_contacts (id, user_id, full_name, contact_number, address, created_at)
                    SELECT id, user_id, full_name, contact_number, address, created_at
                    FROM child_contacts_backup
                ''')
                print(f"✅ Restored {contact_count} contacts")
            except Exception as e:
                print(f"⚠️ Could not restore data: {e}")
        
        # Step 5: Clean up
        cursor.execute("DROP TABLE IF EXISTS child_contacts_backup")
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": f"Table fixed! {contact_count} contacts preserved. You can now add multiple contacts with relationship."
        })
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500
        
# ==================== GET EMERGENCY CONTACTS FOR PARENT ====================
@app.route('/api/parent-emergency-contacts/<int:parent_id>', methods=['GET'])
def get_parent_emergency_contacts(parent_id):
    try:
        print(f"📥 Fetching emergency contacts for parent_id: {parent_id}")
        
        conn = sqlite3.connect('aamabuwa.db')
        cursor = conn.cursor()
        
        # First find the caregiver (child) linked to this parent
        cursor.execute('''
            SELECT caregiver_id FROM family_links 
            WHERE parent_id = ?
        ''', (parent_id,))
        
        result = cursor.fetchone()
        print(f"🔍 Caregiver result: {result}")
        
        if not result:
            print("❌ No caregiver found for this parent")
            conn.close()
            return jsonify({
                "success": True,
                "contacts": []
            })
        
        caregiver_id = result[0]
        print(f"✅ Found caregiver_id: {caregiver_id}")
        
        # Then get all contacts for that caregiver
        cursor.execute('''
            SELECT id, full_name, contact_number, address, relationship, created_at
            FROM child_contacts 
            WHERE user_id = ?
            ORDER BY created_at DESC
        ''', (caregiver_id,))
        
        contacts = cursor.fetchall()
        print(f"📊 Found {len(contacts)} contacts")
        
        contact_list = []
        for contact in contacts:
            contact_list.append({
                "id": contact[0],
                "full_name": contact[1],
                "contact_number": contact[2],
                "address": contact[3],
                "relationship": contact[4] or "",
                "created_at": contact[5]
            })
        
        conn.close()
        
        return jsonify({
            "success": True,
            "contacts": contact_list
        })
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

# ==================== GET PARENT'S CHILDREN ====================
@app.route('/api/my-children', methods=['GET'])
def get_my_children():
    try:
        parent_id = request.args.get('user_id')
        
        if not parent_id:
            return jsonify({"success": False, "message": "User ID required"}), 400
        
        conn = sqlite3.connect('aamabuwa.db')
        cursor = conn.cursor()
        
        # Get all children linked to this parent
        cursor.execute('''
            SELECT u.id, u.full_name, u.email, fl.relationship 
            FROM users u
            JOIN family_links fl ON u.id = fl.caregiver_id
            WHERE fl.parent_id = ?
        ''', (parent_id,))
        
        children = cursor.fetchall()
        conn.close()
        
        child_list = []
        for child in children:
            child_list.append({
                "id": child[0],
                "full_name": child[1],
                "email": child[2],
                "relationship": child[3] or "Child"
            })
        
        return jsonify({
            "success": True,
            "children": child_list
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    
if __name__ == '__main__':
    print("=" * 60)
    print("🚀 AamaBuwa Backend with Family Relationships")
    print("=" * 60)
    print(f"📱 Local URL: http://localhost:{PORT}")
    print(f"📱 Network URL: http://{YOUR_IP}:{PORT}")
    print("\n📱 SHARE THIS WITH YOUR TEAM:")
    print(f"   http://{YOUR_IP}:{PORT}")
    print("=" * 60)
    print("\n📝 ENDPOINTS:")
    print(f"   POST  /api/register              - Register new user")
    print(f"   POST  /api/login                 - Login user")
    print(f"   GET   /api/my-parents?user_id=ID - Get child's parents")
    print(f"   GET   /api/parent-health/ID      - Get parent health")
    print(f"   GET   /api/parent-tasks/ID       - Get parent tasks")
    print(f"   POST  /api/add-family-link       - Link parent and child")
    print(f"   POST  /api/add-task              - Add new task")
    print(f"   POST  /api/create-sample-family  - Create test family")
    print(f"   GET   /api/test                   - Test connection")
    print(f"   GET   /api/users                  - List all users")
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=PORT)