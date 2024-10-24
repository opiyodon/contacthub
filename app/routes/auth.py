from flask import Blueprint, request, jsonify, url_for, render_template_string
from werkzeug.security import generate_password_hash, check_password_hash
from app import mongo, mail
from flask_mail import Message
import jwt
from datetime import datetime, timedelta
from bson import ObjectId
import secrets
from config import Config

auth_bp = Blueprint('auth', __name__)

# HTML email template
EMAIL_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Orbitron', sans-serif;
            background: #1e1e1e;
            margin: 0;
            padding: 16px;
            color: white;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #222222;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
        }
        
        .header {
            background: #1a1a1a;
            padding: 24px;
            border-bottom: 1px solid #333;
        }
        
        .logo-container {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .logo-circle {
            width: 32px;
            height: 32px;
            background: #f97316;
            border-radius: 50%;
            flex-shrink: 0;
        }
        
        .logo-text {
            font-size: 24px;
            font-weight: 600;
            color: white;
            letter-spacing: 0.5px;
        }
        
        .content {
            padding: 32px 24px;
        }
        
        .title {
            font-size: 36px;
            font-weight: 600;
            color: white;
            margin-bottom: 16px;
            line-height: 1.2;
            letter-spacing: -0.5px;
        }
        
        .description {
            color: #e0e0e0;
            margin-bottom: 32px;
            font-size: 16px;
            line-height: 1.5;
        }
        
        .button-container {
            padding: 0 12px;
            margin-bottom: 32px;
        }
        
        .button {
            display: block;
            width: 100%;
            background: #f97316;
            color: white;
            padding: 16px 24px;
            text-align: center;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
            font-size: 16px;
            transition: background-color 0.2s ease;
            box-shadow: 0 2px 8px rgba(249, 115, 22, 0.2);
        }
        
        .button:hover {
            background: #ea580c;
        }
        
        .footer {
            border-top: 1px solid #333;
            padding: 24px;
            background: #1a1a1a;
        }
        
        .footer p {
            color: #888;
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 8px;
        }
        
        .footer p:last-child {
            margin-bottom: 0;
        }
        
        .footer a {
            color: #f97316;
            text-decoration: none;
            transition: color 0.2s ease;
        }
        
        .footer a:hover {
            color: #ea580c;
        }
        
        @media (max-width: 600px) {
            body {
                padding: 8px;
            }
            
            .container {
                border-radius: 8px;
            }
            
            .header {
                padding: 20px 16px;
            }
            
            .content {
                padding: 24px 16px;
            }
            
            .title {
                font-size: 28px;
                margin-bottom: 12px;
            }
            
            .description {
                font-size: 15px;
                margin-bottom: 24px;
            }
            
            .button-container {
                padding: 0 8px;
                margin-bottom: 24px;
            }
            
            .footer {
                padding: 20px 16px;
            }
            
            .logo-text {
                font-size: 20px;
            }
            
            .logo-circle {
                width: 28px;
                height: 28px;
            }
        }
        
        @media (max-width: 400px) {
            .title {
                font-size: 24px;
            }
            
            .button {
                padding: 14px 20px;
                font-size: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-container">
                <div class="logo-circle"></div>
                <div class="logo-text">ContactHub X50</div>
            </div>
        </div>
        
        <div class="content">
            <h1 class="title">Password Reset Request</h1>
            <p class="description">We received a request to reset your password. Click the button below to create a new password for your ContactHub X50 account.</p>
            
            <div class="button-container">
                <a href="{{ reset_link }}" class="button">
                    Reset Your Password
                </a>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Important:</strong> If you didn't request a password reset, please ignore this email and ensure your account is secure by logging in to change your password.</p>
            <p>If you're experiencing issues, please contact <a href="#">Support</a>.</p>
            <p>This password reset link will expire in 20 minutes for security purposes.</p>
        </div>
    </div>
</body>
</html>
"""

@auth_bp.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        required_fields = ['name', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if email already exists
        if mongo.db.users.find_one({'email': data['email']}):
            return jsonify({'error': 'Email already exists'}), 400
        
        # Create new user document
        user = {
            'name': data['name'],
            'email': data['email'],
            'password': generate_password_hash(data['password']),
            'created_at': datetime.utcnow()
        }
        
        # Insert user into database
        result = mongo.db.users.insert_one(user)
        
        # Generate JWT token
        token = jwt.encode(
            {
                'user_id': str(result.inserted_id),
                'exp': datetime.utcnow() + timedelta(days=1)
            },
            Config.JWT_SECRET_KEY,
            algorithm='HS256'
        )
        
        return jsonify({
            'message': 'User registered successfully',
            'token': token,
            'user': {
                'email': user['email'],
                'name': user['name']
            }
        }), 200
        
    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 500

@auth_bp.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()

        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400

        user = mongo.db.users.find_one({'email': data['email']})
        
        if not user or not check_password_hash(user['password'], data['password']):
            return jsonify({'error': 'Invalid credentials'}), 401

        token = jwt.encode(
            {
                'user_id': str(user['_id']),
                'exp': datetime.utcnow() + timedelta(days=1)
            },
            Config.JWT_SECRET_KEY,
            algorithm='HS256'
        )

        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'email': user['email'],
                'name': user['name']
            }
        }), 200

    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'error': 'Login failed', 'details': str(e)}), 500

@auth_bp.route('/api/verify-token', methods=['GET'])
def verify_token():
    auth_header = request.headers.get('Authorization')
    if not auth_header or 'Bearer' not in auth_header:
        return jsonify({'error': 'Invalid token format'}), 401
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
        user = mongo.db.users.find_one({'_id': ObjectId(payload['user_id'])})
        if not user:
            raise Exception('User not found')
        
        return jsonify({
            'user': {
                'email': user['email'],
                'name': user['name']
            }
        }), 200
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token has expired'}), 401
    except (jwt.InvalidTokenError, Exception) as e:
        return jsonify({'error': 'Invalid token'}), 401

@auth_bp.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
            
        user = mongo.db.users.find_one({'email': email})
        if not user:
            return jsonify({'error': 'Email not found'}), 404
            
        # Generate reset token
        reset_token = jwt.encode(
            {
                'user_id': str(user['_id']),
                'exp': datetime.utcnow() + timedelta(minutes=20)
            },
            Config.JWT_SECRET_KEY,
            algorithm='HS256'
        )
        
        # Store reset token in database
        mongo.db.users.update_one(
            {'_id': user['_id']},
            {'$set': {'reset_token': reset_token}}
        )
        
        # Create reset password link
        reset_link = f"{Config.FRONTEND_URL}/reset_password?token={reset_token}"
        
        # Send email with HTML template
        msg = Message(
            'ContactHub X50 Password Reset Request',
            sender=Config.MAIL_USERNAME,
            recipients=[email]
        )
        msg.html = render_template_string(EMAIL_TEMPLATE, reset_link=reset_link)
        msg.body = f'''
ContactHub X50 Password Reset Request

All you have to do is click this link and we'll sign you in securely:
{reset_link}

If you didn't request this email, you can safely ignore it.
If you're experiencing issues, please contact support.

This link will expire in 20 minutes.
'''
        mail.send(msg)
        
        return jsonify({'message': 'Password reset email sent successfully'}), 200
        
    except Exception as e:
        print(f"Forgot password error: {str(e)}")
        return jsonify({'error': 'Failed to send reset email', 'details': str(e)}), 500

@auth_bp.route('/api/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('password')
        
        if not token or not new_password:
            return jsonify({'error': 'Token and new password are required'}), 400
            
        try:
            # Verify token
            payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
            user_id = payload['user_id']
            
            # Find user and verify token
            user = mongo.db.users.find_one({
                '_id': ObjectId(user_id),
                'reset_token': token
            })
            
            if not user:
                return jsonify({'error': 'Invalid or expired reset token'}), 401
                
            # Update password and remove reset token
            mongo.db.users.update_one(
                {'_id': ObjectId(user_id)},
                {
                    '$set': {'password': generate_password_hash(new_password)},
                    '$unset': {'reset_token': ''}
                }
            )
            
            return jsonify({'message': 'Password reset successful'}), 200
            
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Reset token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid reset token'}), 401
            
    except Exception as e:
        print(f"Reset password error: {str(e)}")
        return jsonify({'error': 'Password reset failed', 'details': str(e)}), 500
    
@auth_bp.route('/api/logout', methods=['POST'])
def logout():
    try:
        # Get the token from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or 'Bearer' not in auth_header:
            return jsonify({'error': 'Invalid token format'}), 401
        
        token = auth_header.split(' ')[1]
        
        try:
            # Verify token
            payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
            user_id = payload['user_id']
            
            # Optional: You could maintain a blacklist of invalidated tokens
            # or update user's last_logout timestamp
            mongo.db.users.update_one(
                {'_id': ObjectId(user_id)},
                {'$set': {'last_logout': datetime.utcnow()}}
            )
            
            return jsonify({'message': 'Logged out successfully'}), 200
            
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
            
    except Exception as e:
        print(f"Logout error: {str(e)}")
        return jsonify({'error': 'Logout failed', 'details': str(e)}), 500

@auth_bp.route('/api/delete-account', methods=['DELETE'])
def delete_account():
    try:
        # Get the token from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or 'Bearer' not in auth_header:
            return jsonify({'error': 'Invalid token format'}), 401
        
        token = auth_header.split(' ')[1]
        data = request.get_json()
        password = data.get('password')
        
        if not password:
            return jsonify({'error': 'Password is required'}), 400
        
        try:
            # Verify token
            payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
            user_id = ObjectId(payload['user_id'])
            
            # Find user
            user = mongo.db.users.find_one({'_id': user_id})
            if not user:
                return jsonify({'error': 'User not found'}), 404
                
            # Verify password
            if not check_password_hash(user['password'], password):
                return jsonify({'error': 'Invalid password'}), 401
            
            # Create a deletion activity log before deleting activities
            deletion_activity = {
                'user_id': user_id,
                'type': 'account_deletion',
                'details': f"Account deletion initiated for user {user['email']}",
                'timestamp': datetime.utcnow()
            }
            mongo.db.activities.insert_one(deletion_activity)
            
            # Delete all user data in the following order:
            
            # 1. Delete all user's contacts
            contacts_result = mongo.db.contacts.delete_many({'user_id': user_id})
            
            # 2. Delete all user's activity logs
            activities_result = mongo.db.activities.delete_many({'user_id': user_id})
            
            # 3. Delete any reset tokens or other user-related documents
            # Add more collections here if needed for future features
            
            # 4. Finally, delete the user account itself
            user_result = mongo.db.users.delete_one({'_id': user_id})
            
            # Prepare deletion statistics
            deletion_stats = {
                'contacts_deleted': contacts_result.deleted_count,
                'activities_deleted': activities_result.deleted_count,
                'account_deleted': user_result.deleted_count == 1
            }
            
            # Log the deletion for audit purposes (optional)
            print(f"Account deletion completed: {deletion_stats}")
            
            return jsonify({
                'message': 'Account and all associated data deleted successfully',
                'deletion_stats': deletion_stats
            }), 200
            
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
            
    except Exception as e:
        print(f"Delete account error: {str(e)}")
        return jsonify({'error': 'Account deletion failed', 'details': str(e)}), 500