from flask import Blueprint, request, jsonify
from app import mongo
from bson import ObjectId
import jwt
from functools import wraps

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
        except:
            return jsonify({'error': 'Invalid token'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

@contacts_bp.route('/api/contacts', methods=['POST'])
@token_required
def create_contact(current_user):
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
    return jsonify({'message': 'Contact created successfully'}), 201

@contacts_bp.route('/api/contacts/search', methods=['GET'])
@token_required
def search_contacts(current_user):
    reg_number = request.args.get('registration_number')
    contact = mongo.db.contacts.find_one({
        'user_id': current_user['_id'],
        'registration_number': reg_number
    })
    
    if not contact:
        return jsonify({'error': 'Contact not found'}), 404
        
    return jsonify({
        'mobile': contact['mobile'],
        'email': contact['email'],
        'address': contact['address'],
        'registration_number': contact['registration_number']
    }), 200