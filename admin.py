from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from models.database import db, User, Patient, Doctor, RecoveryUpdate, WoundImage, Alert
from utils.auth_middleware import token_required
from datetime import datetime

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/api/admin/stats', methods=['GET'])
@token_required(allowed_roles=['admin'])
def get_admin_dashboard_stats(current_user):
    total_users = User.query.count()
    total_patients = Patient.query.count()
    total_doctors = Doctor.query.count()
    total_updates = RecoveryUpdate.query.count()
    total_wounds = WoundImage.query.count()
    patients_needing_attention = Patient.query.filter_by(recovery_status='Needs Attention').count()
    active_alerts = Alert.query.filter_by(status='Active').count()

    return jsonify({
        'stats': {
            'total_users': total_users,
            'total_patients': total_patients,
            'total_doctors': total_doctors,
            'total_recovery_updates': total_updates,
            'total_wound_images': total_wounds,
            'patients_needing_attention': patients_needing_attention,
            'active_alerts': active_alerts
        }
    }), 200

@admin_bp.route('/api/admin/users', methods=['GET'])
@token_required(allowed_roles=['admin'])
def get_all_users(current_user):
    users = User.query.order_by(User.created_at.desc()).all()
    user_list = []
    for u in users:
        u_dict = u.to_dict()
        if u.role == 'patient' and u.patient_profile:
            u_dict['details'] = u.patient_profile.to_dict()
        elif u.role == 'doctor' and u.doctor_profile:
            u_dict['details'] = u.doctor_profile.to_dict()
        user_list.append(u_dict)

    return jsonify({'users': user_list}), 200

@admin_bp.route('/api/admin/users', methods=['POST'])
@token_required(allowed_roles=['admin'])
def create_user(current_user):
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    role = data.get('role', 'patient').lower()

    if not name or not email or not password:
        return jsonify({'error': 'Name, email, and password are required.'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'User with this email already exists.'}), 400

    hashed_pw = generate_password_hash(password)
    new_user = User(name=name, email=email, password=hashed_pw, role=role)
    db.session.add(new_user)
    db.session.flush()

    if role == 'patient':
        p = Patient(
            user_id=new_user.id,
            age=int(data.get('age')) if data.get('age') else 35,
            gender=data.get('gender', 'Other'),
            phone=data.get('phone', ''),
            surgery_type=data.get('surgery_type', 'General Surgery'),
            hospital=data.get('hospital', 'City Hospital')
        )
        db.session.add(p)
    elif role == 'doctor':
        d = Doctor(
            user_id=new_user.id,
            specialization=data.get('specialization', 'General Practice'),
            phone=data.get('phone', ''),
            hospital=data.get('hospital', 'City Hospital')
        )
        db.session.add(d)

    db.session.commit()
    return jsonify({'message': 'User created successfully.', 'user': new_user.to_dict()}), 201

@admin_bp.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@token_required(allowed_roles=['admin'])
def delete_user(current_user, user_id):
    if current_user.id == user_id:
        return jsonify({'error': 'Admin cannot delete their own account.'}), 400

    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted successfully.'}), 200

@admin_bp.route('/api/admin/recovery-records', methods=['GET'])
@token_required(allowed_roles=['admin'])
def get_all_recovery_records(current_user):
    records = RecoveryUpdate.query.order_by(RecoveryUpdate.created_at.desc()).all()
    out = []
    for r in records:
        r_dict = r.to_dict()
        r_dict['patient_name'] = r.patient.user.name if r.patient and r.patient.user else 'Unknown'
        out.append(r_dict)
    return jsonify({'recovery_records': out}), 200

@admin_bp.route('/api/admin/wound-assessments', methods=['GET'])
@token_required(allowed_roles=['admin'])
def get_all_wound_assessments(current_user):
    wounds = WoundImage.query.order_by(WoundImage.upload_date.desc()).all()
    out = []
    for w in wounds:
        w_dict = w.to_dict()
        w_dict['patient_name'] = w.patient.user.name if w.patient and w.patient.user else 'Unknown'
        out.append(w_dict)
    return jsonify({'wound_assessments': out}), 200

@admin_bp.route('/api/admin/activity-logs', methods=['GET'])
@token_required(allowed_roles=['admin'])
def get_system_activity_logs(current_user):
    # Simulated system activity logs based on real records
    logs = []
    alerts = Alert.query.order_by(Alert.created_at.desc()).limit(10).all()
    for a in alerts:
        logs.append({
            'timestamp': a.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'type': a.alert_type,
            'description': a.message,
            'user': a.patient.user.name if a.patient and a.patient.user else 'System'
        })
    return jsonify({'activity_logs': logs}), 200
