from flask import Blueprint, request, jsonify
from models.database import db, Patient, User
from utils.auth_middleware import token_required
from datetime import datetime

patient_bp = Blueprint('patient', __name__)

@patient_bp.route('/api/patients', methods=['GET'])
@token_required(allowed_roles=['doctor', 'admin'])
def get_all_patients(current_user):
    patients = Patient.query.order_by(Patient.created_at.desc()).all()
    patient_list = []
    for p in patients:
        p_data = p.to_dict()
        # include latest update & wound status
        latest_update = p.recovery_updates[-1].to_dict() if p.recovery_updates else None
        latest_wound = p.wound_images[-1].to_dict() if p.wound_images else None
        p_data['latest_update'] = latest_update
        p_data['latest_wound'] = latest_wound
        patient_list.append(p_data)
        
    return jsonify({'patients': patient_list}), 200

@patient_bp.route('/api/patients/<int:patient_id>', methods=['GET'])
@token_required()
def get_patient_details(current_user, patient_id):
    patient = Patient.query.get_or_404(patient_id)
    
    # Restrict patient from viewing another patient's data
    if current_user.role == 'patient' and (not current_user.patient_profile or current_user.patient_profile.id != patient_id):
        return jsonify({'error': 'Unauthorized: Access denied to other patient records.'}), 403

    p_dict = patient.to_dict()
    p_dict['recovery_updates'] = [u.to_dict() for u in sorted(patient.recovery_updates, key=lambda x: x.update_date)]
    p_dict['wound_images'] = [w.to_dict() for w in sorted(patient.wound_images, key=lambda x: x.upload_date, reverse=True)]
    p_dict['doctor_notes'] = [n.to_dict() for n in sorted(patient.doctor_notes, key=lambda x: x.created_at, reverse=True)]
    p_dict['alerts'] = [a.to_dict() for a in sorted(patient.alerts, key=lambda x: x.created_at, reverse=True)]

    # Calculate days post-surgery
    days_post_op = None
    if patient.surgery_date:
        days_post_op = (datetime.now().date() - patient.surgery_date).days
        if days_post_op < 0:
            days_post_op = 0
    p_dict['days_post_op'] = days_post_op

    return jsonify({'patient': p_dict}), 200

@patient_bp.route('/api/patients/<int:patient_id>', methods=['PUT'])
@token_required()
def update_patient(current_user, patient_id):
    patient = Patient.query.get_or_404(patient_id)
    
    if current_user.role == 'patient' and (not current_user.patient_profile or current_user.patient_profile.id != patient_id):
        return jsonify({'error': 'Unauthorized: Cannot update other patient records.'}), 403

    data = request.get_json() or {}
    
    if 'age' in data:
        patient.age = int(data['age'])
    if 'gender' in data:
        patient.gender = data['gender']
    if 'phone' in data:
        patient.phone = data['phone']
    if 'address' in data:
        patient.address = data['address']
    if 'surgery_type' in data:
        patient.surgery_type = data['surgery_type']
    if 'hospital' in data:
        patient.hospital = data['hospital']
    if 'doctor_name' in data:
        patient.doctor_name = data['doctor_name']
    if 'emergency_contact' in data:
        patient.emergency_contact = data['emergency_contact']
    if 'recovery_status' in data and current_user.role in ['doctor', 'admin']:
        patient.recovery_status = data['recovery_status']

    if 'name' in data and patient.user:
        patient.user.name = data['name'].strip()

    if 'email' in data and patient.user:
        new_email = data['email'].strip().lower()
        if new_email and new_email != patient.user.email:
            existing = User.query.filter_by(email=new_email).first()
            if existing and existing.id != patient.user.id:
                return jsonify({'error': 'Email is already in use by another account.'}), 400
            patient.user.email = new_email

    db.session.commit()
    return jsonify({
        'message': 'Patient details updated successfully.',
        'patient': patient.to_dict(),
        'user': patient.user.to_dict() if patient.user else None
    }), 200
