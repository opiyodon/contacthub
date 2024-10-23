from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app import mongo, mail
from flask_mail import Message
import jwt
from datetime import datetime, timedelta
import secrets

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if mongo.db.users.find_one({'email': data['email']}):
        return jsonify({'error': 'Email already exists'}), 400
        
    user = {
        'email': data['email'],
        'password': generate_password_hash(data['password']),
        'created_at': datetime.utcnow()
    }
    
    mongo.db.users.insert_one(user)
    return jsonify({'message': 'User registered successfully'}), 201

@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = mongo.db.users.find_one({'email': data['email']})
    
    if user and check_password_hash(user['password'], data['password']):
        token = jwt.encode(
            {'user_id': str(user['_id']), 'exp': datetime.utcnow() + timedelta(hours=1)},
            Config.JWT_SECRET_KEY
        )
        return jsonify({'token': token}), 200
        
    return jsonify({'error': 'Invalid credentials'}), 401

@auth_bp.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    user = mongo.db.users.find_one({'email': data['email']})
    
    if not user:
        return jsonify({'error': 'Email not found'}), 404
        
    reset_token = secrets.token_urlsafe(32)
    exp = datetime.utcnow() + timedelta(hours=1)
    
    mongo.db.users.update_one(
        {'_id': user['_id']},
        {'$set': {'reset_token': reset_token, 'reset_token_exp': exp}}
    )
    
    # Send reset email
    msg = Message('Password Reset Request',
                  sender='noreply@contacthub.com',
                  recipients=[user['email']])
    
    reset_url = f"{request.host_url}reset-password?token={reset_token}"
    msg.body = f'To reset your password, visit the following link: {reset_url}'
    
    mail.send(msg)
    return jsonify({'message': 'Password reset email sent'}), 200