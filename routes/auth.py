from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from models.database import db, User, Patient, Doctor
from utils.auth_middleware import generate_token, token_required
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    
    # Required base fields
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    role = data.get('role', 'patient').lower()

    if not name or not email or not password:
        return jsonify({'error': 'Name, email, and password are required fields.'}), 400

    if role not in ['patient', 'doctor', 'admin']:
        return jsonify({'error': 'Invalid role selected.'}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'error': 'An account with this email already exists.'}), 400

    # Doctor-specific field validation
    if role == 'doctor':
        specialization = data.get('specialization', '').strip()
        hospital = data.get('hospital', '').strip()
        registration_number = data.get('registration_number', '').strip()
        phone = data.get('phone', '').strip()
        years_exp = data.get('years_of_experience')

        if not phone or not specialization or not hospital or not registration_number or years_exp is None or str(years_exp).strip() == '':
            return jsonify({'error': 'Full Name, Email, Password, Phone Number, Specialization, Hospital, Registration Number, and Years of Experience are required for Doctor registration.'}), 400

        try:
            years_exp_int = int(years_exp)
        except ValueError:
            return jsonify({'error': 'Years of experience must be a valid number.'}), 400

    # Create User
    hashed_pw = generate_password_hash(password)
    new_user = User(
        name=name,
        email=email,
        password=hashed_pw,
        role=role
    )
    db.session.add(new_user)
    db.session.flush() # Populate user ID

    # Role specific creation
    if role == 'patient':
        surgery_date_str = data.get('surgery_date')
        surgery_date_val = None
        if surgery_date_str:
            try:
                surgery_date_val = datetime.strptime(surgery_date_str, '%Y-%m-%d').date()
            except ValueError:
                pass

        patient_profile = Patient(
            user_id=new_user.id,
            age=int(data.get('age')) if data.get('age') and str(data.get('age')).isdigit() else None,
            gender=data.get('gender'),
            phone=data.get('phone'),
            address=data.get('address'),
            surgery_type=data.get('surgery_type', 'General Surgery'),
            surgery_date=surgery_date_val,
            hospital=data.get('hospital', 'City Memorial Hospital'),
            doctor_name=data.get('doctor_name', 'Dr. Sarah Jenkins'),
            emergency_contact=data.get('emergency_contact'),
            recovery_status='Healing Normally'
        )
        db.session.add(patient_profile)
        db.session.commit()

        token = generate_token(new_user)
        return jsonify({
            'message': 'Registration successful!',
            'token': token,
            'user': new_user.to_dict()
        }), 201
        
    elif role == 'doctor':
        doctor_profile = Doctor(
            user_id=new_user.id,
            specialization=data.get('specialization', '').strip(),
            phone=data.get('phone', '').strip(),
            hospital=data.get('hospital', '').strip(),
            registration_number=data.get('registration_number', '').strip(),
            years_of_experience=int(data.get('years_of_experience', 0)),
            address=data.get('address', '').strip(),
            approval_status='pending'
        )
        db.session.add(doctor_profile)
        db.session.commit()

        return jsonify({
            'message': 'Registration submitted successfully. Your account is waiting for administrator approval. You will be able to log in after your account is approved.',
            'approval_status': 'pending',
            'user': new_user.to_dict()
        }), 201

    db.session.commit()

    token = generate_token(new_user)
    return jsonify({
        'message': 'Registration successful!',
        'token': token,
        'user': new_user.to_dict()
    }), 201

@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Please provide email and password.'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid email or password.'}), 401

    # Check Doctor Approval Status
    if user.role == 'doctor':
        status = user.doctor_profile.approval_status if user.doctor_profile else 'pending'
        if status == 'pending':
            return jsonify({
                'error': 'Your account is pending administrator approval.',
                'approval_status': 'pending'
            }), 403
        elif status == 'rejected':
            return jsonify({
                'error': 'Your account has not been approved by the administrator.',
                'approval_status': 'rejected'
            }), 403

    token = generate_token(user)

    # Return user details along with profile ID if patient/doctor
    user_dict = user.to_dict()
    if user.role == 'patient' and user.patient_profile:
        user_dict['patient_id'] = user.patient_profile.id
    elif user.role == 'doctor' and user.doctor_profile:
        user_dict['doctor_id'] = user.doctor_profile.id
        user_dict['doctor_details'] = user.doctor_profile.to_dict()

    return jsonify({
        'message': 'Login successful!',
        'token': token,
        'user': user_dict
    }), 200

@auth_bp.route('/api/me', methods=['GET'])
@token_required()
def get_current_user(current_user):
    user_dict = current_user.to_dict()
    if current_user.role == 'patient' and current_user.patient_profile:
        user_dict['patient_id'] = current_user.patient_profile.id
        user_dict['patient_details'] = current_user.patient_profile.to_dict()
    elif current_user.role == 'doctor' and current_user.doctor_profile:
        user_dict['doctor_id'] = current_user.doctor_profile.id
        user_dict['doctor_details'] = current_user.doctor_profile.to_dict()
        
    return jsonify({'user': user_dict}), 200
