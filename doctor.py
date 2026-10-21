from flask import Blueprint, request, jsonify
from models.database import db, Doctor, DoctorNote, Patient, Alert
from utils.auth_middleware import token_required

doctor_bp = Blueprint('doctor', __name__)

@doctor_bp.route('/api/doctors', methods=['GET'])
@token_required()
def get_doctors(current_user):
    doctors = Doctor.query.all()
    return jsonify({'doctors': [d.to_dict() for d in doctors]}), 200

@doctor_bp.route('/api/doctor/note', methods=['POST'])
@token_required(allowed_roles=['doctor', 'admin'])
def add_doctor_note(current_user):
    data = request.get_json() or {}
    
    patient_id = data.get('patient_id')
    note_text = data.get('note', '').strip()
    mark_follow_up = data.get('mark_follow_up', False)
    updated_status = data.get('recovery_status')

    if not patient_id or not note_text:
        return jsonify({'error': 'Patient ID and note text are required.'}), 400

    patient = Patient.query.get_or_404(int(patient_id))
    doctor_id = current_user.doctor_profile.id if current_user.doctor_profile else 1

    # Save doctor note
    new_note = DoctorNote(
        patient_id=patient.id,
        doctor_id=doctor_id,
        note=note_text
    )
    db.session.add(new_note)

    # Handle status & follow-up updates
    if updated_status:
        patient.recovery_status = updated_status

    if mark_follow_up:
        alert_msg = f"Doctor marked patient for clinical follow-up: {note_text[:60]}..."
        new_alert = Alert(
            patient_id=patient.id,
            alert_type='Doctor Follow-up',
            message=alert_msg,
            status='Active'
        )
        db.session.add(new_alert)

    db.session.commit()

    return jsonify({
        'message': 'Clinical note saved successfully.',
        'doctor_note': new_note.to_dict(),
        'patient_status': patient.recovery_status
    }), 201

@doctor_bp.route('/api/doctor/patient-status', methods=['PUT'])
@token_required(allowed_roles=['doctor', 'admin'])
def update_patient_recovery_status(current_user):
    data = request.get_json() or {}
    patient_id = data.get('patient_id')
    status = data.get('recovery_status')

    if not patient_id or not status:
        return jsonify({'error': 'patient_id and recovery_status are required.'}), 400

    patient = Patient.query.get_or_404(int(patient_id))
    patient.recovery_status = status
    db.session.commit()

    return jsonify({'message': f'Patient status updated to {status}.', 'patient': patient.to_dict()}), 200
