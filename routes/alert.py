from flask import Blueprint, request, jsonify
from models.database import db, Alert, Patient
from utils.auth_middleware import token_required

alert_bp = Blueprint('alert', __name__)

@alert_bp.route('/api/alerts/<int:patient_id>', methods=['GET'])
@token_required()
def get_alerts_by_patient(current_user, patient_id):
    if current_user.role == 'patient' and (not current_user.patient_profile or current_user.patient_profile.id != patient_id):
        return jsonify({'error': 'Unauthorized access to alerts.'}), 403

    alerts = Alert.query.filter_by(patient_id=patient_id).order_by(Alert.created_at.desc()).all()
    return jsonify({
        'patient_id': patient_id,
        'alerts': [a.to_dict() for a in alerts]
    }), 200

@alert_bp.route('/api/alerts', methods=['GET'])
@token_required(allowed_roles=['doctor', 'admin'])
def get_all_alerts(current_user):
    alerts = Alert.query.order_by(Alert.created_at.desc()).all()
    return jsonify({'alerts': [a.to_dict() for a in alerts]}), 200

@alert_bp.route('/api/alerts/<int:alert_id>', methods=['PUT'])
@token_required(allowed_roles=['doctor', 'admin'])
def update_alert_status(current_user, alert_id):
    alert = Alert.query.get_or_404(alert_id)
    data = request.get_json() or {}
    status = data.get('status', 'Resolved')

    alert.status = status
    db.session.commit()

    return jsonify({'message': f'Alert status updated to {status}.', 'alert': alert.to_dict()}), 200
