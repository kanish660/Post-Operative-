from flask import Blueprint, jsonify
from models.database import Patient
from utils.auth_middleware import token_required
from datetime import datetime

report_bp = Blueprint('report', __name__)

@report_bp.route('/api/report/<int:patient_id>', methods=['GET'])
@token_required()
def generate_recovery_report(current_user, patient_id):
    if current_user.role == 'patient' and (not current_user.patient_profile or current_user.patient_profile.id != patient_id):
        return jsonify({'error': 'Unauthorized access to recovery report.'}), 403

    patient = Patient.query.get_or_404(patient_id)
    
    # Calculate recovery metrics summary
    recovery_updates = [u.to_dict() for u in sorted(patient.recovery_updates, key=lambda x: x.update_date)]
    wound_images = [w.to_dict() for w in sorted(patient.wound_images, key=lambda x: x.upload_date, reverse=True)]
    doctor_notes = [n.to_dict() for n in sorted(patient.doctor_notes, key=lambda x: x.created_at, reverse=True)]
    alerts = [a.to_dict() for a in sorted(patient.alerts, key=lambda x: x.created_at, reverse=True)]

    days_post_op = 0
    if patient.surgery_date:
        days_post_op = max(0, (datetime.now().date() - patient.surgery_date).days)

    avg_pain = round(sum(u['pain_level'] for u in recovery_updates) / len(recovery_updates), 1) if recovery_updates else 0.0
    latest_temp = recovery_updates[-1]['temperature'] if recovery_updates else None
    latest_ai_result = wound_images[0]['ai_result'] if wound_images else 'No Wound Images Uploaded'
    latest_ai_confidence = wound_images[0]['ai_confidence'] if wound_images else None

    report = {
        'report_generated_at': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC'),
        'patient_info': patient.to_dict(),
        'days_post_op': days_post_op,
        'summary': {
            'total_recovery_updates': len(recovery_updates),
            'total_wound_uploads': len(wound_images),
            'average_pain_level': avg_pain,
            'latest_temperature': latest_temp,
            'current_recovery_status': patient.recovery_status,
            'latest_ai_assessment': latest_ai_result,
            'latest_ai_confidence': latest_ai_confidence
        },
        'recovery_history': recovery_updates,
        'wound_history': wound_images,
        'doctor_notes': doctor_notes,
        'active_alerts': [a for a in alerts if a['status'] == 'Active'],
        'resolved_alerts': [a for a in alerts if a['status'] == 'Resolved']
    }

    return jsonify({'report': report}), 200
