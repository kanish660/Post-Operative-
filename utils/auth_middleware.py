import jwt
from functools import wraps
from flask import request, jsonify, current_app
from models.database import User

def generate_token(user):
    payload = {
        'id': user.id,
        'email': user.email,
        'role': user.role,
        'name': user.name
    }
    return jwt.encode(payload, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')

def token_required(allowed_roles=None):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = None
            if 'Authorization' in request.headers:
                auth_header = request.headers['Authorization']
                if auth_header.startswith('Bearer '):
                    token = auth_header.split(' ')[1]
            
            if not token:
                return jsonify({'error': 'Authentication token is missing!'}), 401
            
            try:
                data = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
                current_user = User.query.get(data['id'])
                if not current_user:
                    return jsonify({'error': 'User invalid or no longer exists!'}), 401
                
                if allowed_roles and current_user.role not in allowed_roles:
                    return jsonify({'error': 'Unauthorized: Access restricted for your user role.'}), 403

                # Backend security enforcement for Doctor approval status
                if current_user.role == 'doctor':
                    doc_profile = current_user.doctor_profile
                    if not doc_profile or doc_profile.approval_status != 'approved':
                        status = doc_profile.approval_status if doc_profile else 'pending'
                        if status == 'rejected':
                            return jsonify({'error': 'Your account has not been approved by the administrator.', 'approval_status': 'rejected'}), 403
                        return jsonify({'error': 'Your account is pending administrator approval.', 'approval_status': 'pending'}), 403
                    
            except jwt.ExpiredSignatureError:
                return jsonify({'error': 'Token has expired. Please log in again.'}), 401
            except jwt.InvalidTokenError:
                return jsonify({'error': 'Invalid authentication token.'}), 401
            
            return f(current_user, *args, **kwargs)
        return decorated
    return decorator
