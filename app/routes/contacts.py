from flask import Blueprint, request, jsonify
from app import mongo
from bson import ObjectId
import jwt
from datetime import datetime, timedelta
from functools import wraps
from config import Config

contacts_bp = Blueprint('contacts', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        try:
            data = jwt.decode(token.split()[1], Config.JWT_SECRET_KEY, algorithms=['HS256'])
            current_user = mongo.db.users.find_one({'_id': ObjectId(data['user_id'])})
            if not current_user:
                raise Exception('User not found')
        except Exception as e:
            return jsonify({'error': 'Invalid token', 'details': str(e)}), 401
        return f(current_user, *args, **kwargs)
    return decorated

@contacts_bp.route('/api/contacts', methods=['POST'])
@token_required
def create_contact(current_user):
    try:
        data = request.get_json()
        contact = {
            'user_id': current_user['_id'],
            'mobile': data['mobile'],
            'email': data['email'],
            'address': data['address'],
            'registration_number': data['registration_number'],
            'created_at': datetime.utcnow()
        }
        
        mongo.db.contacts.insert_one(contact)
        
        # Create activity log
        activity = {
            'user_id': current_user['_id'],
            'type': 'contact_added',
            'details': f"Added contact with registration number {data['registration_number']}",
            'timestamp': datetime.utcnow()
        }
        mongo.db.activities.insert_one(activity)
        
        return jsonify({'message': 'Contact created successfully'}), 201
    except Exception as e:
        return jsonify({'error': 'Failed to create contact', 'details': str(e)}), 500

@contacts_bp.route('/api/contacts/search', methods=['GET'])
@token_required
def search_contacts(current_user):
    try:
        reg_number = request.args.get('registration_number')
        if not reg_number:
            return jsonify({'error': 'Registration number is required'}), 400
        
        contact = mongo.db.contacts.find_one({
            'user_id': current_user['_id'],
            'registration_number': reg_number
        })
        
        if not contact:
            return jsonify({'error': 'Contact not found'}), 404
        
        # Create activity log for search
        activity = {
            'user_id': current_user['_id'],
            'type': 'contact_searched',
            'details': f"Searched for contact with registration number {reg_number}",
            'timestamp': datetime.utcnow()
        }
        mongo.db.activities.insert_one(activity)
        
        # Convert ObjectId to string for JSON serialization
        contact['_id'] = str(contact['_id'])
        contact['user_id'] = str(contact['user_id'])
        if 'created_at' in contact:
            contact['created_at'] = contact['created_at'].isoformat()
            
        return jsonify({
            'mobile': contact['mobile'],
            'email': contact['email'],
            'address': contact['address'],
            'registration_number': contact['registration_number']
        }), 200
    except Exception as e:
        return jsonify({'error': 'Search failed', 'details': str(e)}), 500

@contacts_bp.route('/api/contacts/stats', methods=['GET'])
@token_required
def get_contact_stats(current_user):
    try:
        # Get total contacts
        total_contacts = mongo.db.contacts.count_documents({'user_id': current_user['_id']})
        
        # Get recently added contacts (last 30 minutes)
        thirty_minutes_ago = datetime.utcnow() - timedelta(minutes=30)
        recent_contacts = mongo.db.contacts.count_documents({
            'user_id': current_user['_id'],
            'created_at': {'$gte': thirty_minutes_ago}
        })
        
        # Get recent activities
        recent_activities = list(mongo.db.activities.find(
            {'user_id': current_user['_id']},
            {'_id': 0, 'type': 1, 'details': 1, 'timestamp': 1}
        ).sort('timestamp', -1).limit(4))
        
        # Convert datetime objects to strings for JSON serialization
        for activity in recent_activities:
            activity['timestamp'] = activity['timestamp'].strftime('%Y-%m-%d %H:%M:%S')
        
        return jsonify({
            'total_contacts': total_contacts,
            'recent_added': recent_contacts,
            'recent_activities': recent_activities
        }), 200
    except Exception as e:
        return jsonify({'error': 'Failed to get stats', 'details': str(e)}), 500

@contacts_bp.route('/api/contacts', methods=['GET'])
@token_required
def get_all_contacts(current_user):
    try:
        contacts = list(mongo.db.contacts.find(
            {'user_id': current_user['_id']},
            {'_id': 0, 'mobile': 1, 'email': 1, 'address': 1, 'registration_number': 1}
        ).sort('created_at', -1))
        
        return jsonify(contacts), 200
    except Exception as e:
        return jsonify({'error': 'Failed to get contacts', 'details': str(e)}), 500