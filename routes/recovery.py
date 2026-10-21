from flask import Blueprint, request, jsonify
from models.database import db, RecoveryUpdate, Patient, Alert
from utils.auth_middleware import token_required
from datetime import datetime

recovery_bp = Blueprint('recovery', __name__)

@recovery_bp.route('/api/recovery', methods=['POST'])
@token_required(allowed_roles=['patient', 'doctor', 'admin'])
def submit_recovery_update(current_user):
    data = request.get_json() or {}
    
    patient_id = data.get('patient_id')
    if current_user.role == 'patient':
        if not current_user.patient_profile:
            return jsonify({'error': 'Patient profile not found.'}), 400
        patient_id = current_user.patient_profile.id

    if not patient_id:
        return jsonify({'error': 'Patient ID is required.'}), 400

    patient = Patient.query.get_or_404(patient_id)

    update_date_str = data.get('update_date')
    try:
        update_date = datetime.strptime(update_date_str, '%Y-%m-%d').date() if update_date_str else datetime.now().date()
    except ValueError:
        update_date = datetime.now().date()

    pain_level = int(data.get('pain_level', 5))
    temperature = float(data.get('temperature', 98.6))
    swelling = data.get('swelling', 'None')
    redness = data.get('redness', 'None')
    discharge = data.get('discharge', 'None')
    bleeding = data.get('bleeding', 'None')
    mobility = data.get('mobility', 'Good')
    appetite = data.get('appetite', 'Normal')
    sleep_quality = data.get('sleep_quality', 'Good')
    comments = data.get('comments', '')

    # Determine recovery status heuristic based on symptoms
    recovery_status = 'Healing Normally'
    concerning_factors = []

    if pain_level >= 7:
        concerning_factors.append(f"High pain score ({pain_level}/10)")
    if temperature >= 100.4:
        concerning_factors.append(f"Fever detected ({temperature}°F)")
    if swelling in ['Moderate', 'Severe'] or redness in ['Moderate', 'Severe']:
        concerning_factors.append(f"Elevated tissue inflammation ({swelling} swelling, {redness} redness)")
    if discharge in ['Purulent', 'Bloody'] or bleeding == 'Active':
        concerning_factors.append(f"Incision discharge/bleeding ({discharge} discharge, {bleeding} bleeding)")

    if concerning_factors:
        recovery_status = 'Needs Attention'
        patient.recovery_status = 'Needs Attention'
        
        # Create system alert
        alert_msg = f"Patient submitted concerning recovery update: {', '.join(concerning_factors)}."
        new_alert = Alert(
            patient_id=patient.id,
            alert_type='Symptom Alert',
            message=alert_msg,
            status='Active'
        )
        db.session.add(new_alert)

    new_update = RecoveryUpdate(
        patient_id=patient.id,
        update_date=update_date,
        pain_level=pain_level,
        temperature=temperature,
        swelling=swelling,
        redness=redness,
        discharge=discharge,
        bleeding=bleeding,
        mobility=mobility,
        appetite=appetite,
        sleep_quality=sleep_quality,
        recovery_status=recovery_status,
        comments=comments
    )

    db.session.add(new_update)
    db.session.commit()

    return jsonify({
        'message': 'Daily recovery update submitted successfully.',
        'recovery_update': new_update.to_dict(),
        'patient_status': patient.recovery_status
    }), 201

@recovery_bp.route('/api/recovery/<int:patient_id>', methods=['GET'])
@token_required()
def get_patient_recovery_history(current_user, patient_id):
    if current_user.role == 'patient' and (not current_user.patient_profile or current_user.patient_profile.id != patient_id):
        return jsonify({'error': 'Unauthorized access to recovery records.'}), 403

    updates = RecoveryUpdate.query.filter_by(patient_id=patient_id).order_by(RecoveryUpdate.update_date.asc()).all()
    return jsonify({
        'patient_id': patient_id,
        'recovery_updates': [u.to_dict() for u in updates]
    }), 200
