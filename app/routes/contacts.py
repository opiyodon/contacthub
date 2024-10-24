from flask import Blueprint, request, jsonify
from app import mongo
from bson import ObjectId
import jwt
from datetime import datetime, timedelta, timezone
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

@contacts_bp.route('/api/contacts/stats', methods=['GET'])
@token_required
def get_stats(current_user):
    try:
        # Get total contacts count
        total_contacts = mongo.db.contacts.count_documents({'user_id': current_user['_id']})
        
        # Get contacts added in the last 20 minutes
        twenty_mins_ago = datetime.now(timezone.utc) - timedelta(minutes=20)
        recent_added = mongo.db.contacts.count_documents({
            'user_id': current_user['_id'],
            'created_at': {'$gte': twenty_mins_ago}
        })
        
        # Get recent activities with proper timestamp handling
        recent_activities = list(mongo.db.activities.find(
            {'user_id': current_user['_id']}
        ).sort('timestamp', -1).limit(4))
        
        # Process activities to make them JSON serializable
        processed_activities = []
        for activity in recent_activities:
            # Convert ObjectId to string
            activity['_id'] = str(activity['_id'])
            activity['user_id'] = str(activity['user_id'])
            
            # Process contact information if it exists
            if 'contact' in activity and activity['contact']:
                activity['contact']['_id'] = str(activity['contact']['_id'])
                activity['contact']['user_id'] = str(activity['contact']['user_id'])
            
            # Ensure timestamp is in UTC and convert to ISO format
            if isinstance(activity['timestamp'], datetime):
                # Ensure the timestamp is timezone-aware
                if activity['timestamp'].tzinfo is None:
                    activity['timestamp'] = activity['timestamp'].replace(tzinfo=timezone.utc)
                activity['timestamp'] = activity['timestamp'].isoformat()
            
            # Convert activity type
            activity['type'] = activity['type'].replace('contact_', '')
            
            processed_activities.append(activity)
        
        return jsonify({
            'total_contacts': total_contacts,
            'recent_added': recent_added,
            'recent_activities': processed_activities
        }), 200
    except Exception as e:
        print(f"Error in get_stats: {str(e)}")
        return jsonify({'error': 'Failed to get stats', 'details': str(e)}), 500

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
            'created_at': datetime.now(timezone.utc)
        }
        
        result = mongo.db.contacts.insert_one(contact)
        
        # Create activity log
        activity = {
            'user_id': current_user['_id'],
            'type': 'contact_added',
            'details': f"Added contact with registration number {data['registration_number']}",
            'timestamp': datetime.now(timezone.utc),
            'contact': {
                '_id': str(result.inserted_id),
                'user_id': str(current_user['_id']),
                **data
            }
        }
        mongo.db.activities.insert_one(activity)
        
        return jsonify({'message': 'Contact created successfully', 'contact_id': str(result.inserted_id)}), 201
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
            'timestamp': datetime.now(timezone.utc),
            'contact': {
                '_id': str(contact['_id']),
                'user_id': str(contact['user_id']),
                'mobile': contact['mobile'],
                'email': contact['email'],
                'address': contact['address'],
                'registration_number': contact['registration_number']
            }
        }
        mongo.db.activities.insert_one(activity)
        
        # Convert ObjectId to string for JSON serialization
        contact['_id'] = str(contact['_id'])
        contact['user_id'] = str(contact['user_id'])
        
        return jsonify(contact), 200
    except Exception as e:
        return jsonify({'error': 'Search failed', 'details': str(e)}), 500
