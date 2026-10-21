import os
import uuid
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
from models.database import db, WoundImage, Patient, Alert
from utils.auth_middleware import token_required
from services.ai_wound_assessor import analyze_wound_image
from supabase_client import get_supabase

wound_bp = Blueprint('wound', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'bmp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def _upload_to_supabase_storage(file_path, storage_filename, patient_id):
    """
    Upload a wound image to Supabase Storage bucket 'wound-images'.
    Returns (storage_path, signed_url) or (None, None) on failure.
    """
    try:
        sb = get_supabase()
        if not sb:
            return None, None

        storage_path = f"patient_{patient_id}/{storage_filename}"

        with open(file_path, 'rb') as f:
            file_data = f.read()

        # Upload to Supabase Storage
        sb.storage.from_('wound-images').upload(
            path=storage_path,
            file=file_data,
            file_options={"content-type": "image/jpeg", "upsert": "true"}
        )

        # Generate a signed URL (valid for 1 hour)
        signed_url_response = sb.storage.from_('wound-images').create_signed_url(
            path=storage_path,
            expires_in=3600
        )
        signed_url = signed_url_response.get('signedURL') if isinstance(signed_url_response, dict) else None

        current_app.logger.info(f"Successfully uploaded wound image to Supabase Storage: {storage_path}")
        return storage_path, signed_url

    except Exception as e:
        current_app.logger.info(f"Supabase Storage upload skipped: {e}")
        return None, None


@wound_bp.route('/api/wound/upload', methods=['POST'])
@token_required(allowed_roles=['patient', 'doctor', 'admin'])
def upload_wound_image(current_user):
    if 'image' not in request.files:
        return jsonify({'error': 'No wound image file provided.'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No file selected for upload.'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Allowed formats: PNG, JPG, JPEG, WEBP, BMP.'}), 400

    patient_id = request.form.get('patient_id')
    if current_user.role == 'patient':
        if not current_user.patient_profile:
            return jsonify({'error': 'Patient profile not found.'}), 400
        patient_id = current_user.patient_profile.id

    if not patient_id:
        return jsonify({'error': 'Patient ID is required.'}), 400

    patient = Patient.query.get_or_404(int(patient_id))

    # Secure filename & save to uploads folder (needed for AI analysis)
    filename = secure_filename(file.filename)
    unique_filename = f"wound_p{patient_id}_{uuid.uuid4().hex[:8]}_{filename}"
    upload_folder = current_app.config['UPLOAD_FOLDER']
    os.makedirs(upload_folder, exist_ok=True)
    
    file_path = os.path.join(upload_folder, unique_filename)
    file.save(file_path)

    description = request.form.get('description') or request.form.get('notes', '')

    # Run AI Wound Assessment with error handling
    try:
        ai_assessment = analyze_wound_image(file_path)
    except Exception as e:
        current_app.logger.error(f"Error in AI wound assessment: {e}")
        ai_assessment = {
            'result': 'Needs Attention',
            'status': 'Needs Attention',
            'classification': 'Needs Attention',
            'assessment': 'Needs Attention',
            'ai_result': 'Needs Attention',
            'confidence': 50.0,
            'ai_confidence': 50.0,
            'message': 'AI assessment could not be completed. Please try uploading the image again.',
            'ai_message': 'AI assessment could not be completed. Please try uploading the image again.',
            'disclaimer': 'This AI assessment is for academic demonstration only and is not a medical diagnosis.',
            'is_demo_model': True,
            'model_type': 'Prototype AI Assessment',
            'heuristics': {},
            'details': {}
        }

    ai_result = ai_assessment.get('result') or ai_assessment.get('classification', 'Healing Normally')
    ai_confidence = float(ai_assessment.get('confidence', 85.0))
    ai_message = ai_assessment.get('message', 'Prototype assessment completed.')
    disclaimer = ai_assessment.get('disclaimer', 'This AI assessment is for academic demonstration only and is not a medical diagnosis.')

    # Upload to Supabase Storage
    storage_path, signed_url = _upload_to_supabase_storage(file_path, unique_filename, patient_id)

    # Use Supabase storage path if available, otherwise use local filename
    image_path_to_store = storage_path if storage_path else unique_filename

    # Record wound image entry in DB (SQLAlchemy → Supabase PostgreSQL)
    new_wound = WoundImage(
        patient_id=patient.id,
        image_path=image_path_to_store,
        description=description,
        ai_result=ai_result,
        ai_confidence=ai_confidence,
        ai_message=ai_message
    )
    db.session.add(new_wound)

    # If AI flags 'Needs Attention', update patient status and trigger alert
    if ai_result == 'Needs Attention':
        patient.recovery_status = 'Needs Attention'
        alert_msg = f"AI Wound Assessment flagged uploaded image for further review (Confidence: {ai_confidence}%)."
        new_alert = Alert(
            patient_id=patient.id,
            alert_type='AI Flag',
            message=alert_msg,
            status='Active'
        )
        db.session.add(new_alert)

    db.session.commit()

    return jsonify({
        'message': 'Wound image uploaded and AI assessment completed successfully.',
        'result': ai_result,
        'confidence': ai_confidence,
        'status': ai_result,
        'assessment': ai_result,
        'ai_result': ai_result,
        'ai_confidence': ai_confidence,
        'ai_message': ai_message,
        'disclaimer': disclaimer,
        'details': ai_assessment.get('details', ai_assessment.get('heuristics', {})),
        'wound_record': new_wound.to_dict(),
        'ai_assessment': ai_assessment,
        'storage_url': signed_url
    }), 201

@wound_bp.route('/api/wound/<int:patient_id>', methods=['GET'])
@token_required()
def get_patient_wounds(current_user, patient_id):
    if current_user.role == 'patient' and (not current_user.patient_profile or current_user.patient_profile.id != patient_id):
        return jsonify({'error': 'Unauthorized access to wound records.'}), 403

    wounds = WoundImage.query.filter_by(patient_id=patient_id).order_by(WoundImage.upload_date.desc()).all()
    return jsonify({
        'patient_id': patient_id,
        'wound_images': [w.to_dict() for w in wounds]
    }), 200

@wound_bp.route('/api/wound/latest/<int:patient_id>', methods=['GET'])
@token_required()
def get_latest_patient_wound(current_user, patient_id):
    if current_user.role == 'patient' and (not current_user.patient_profile or current_user.patient_profile.id != patient_id):
        return jsonify({'error': 'Unauthorized access to wound records.'}), 403

    wound = WoundImage.query.filter_by(patient_id=patient_id).order_by(WoundImage.upload_date.desc()).first()

    if not wound:
        return jsonify({'message': 'No assessments found for this patient.'}), 404

    conf = int(round(float(wound.ai_confidence))) if wound.ai_confidence is not None else 85
    res_str = wound.ai_result
    msg_str = wound.ai_message or ('Prototype AI assessment: ' + wound.ai_result)

    return jsonify({
        'result': res_str,
        'confidence': conf,
        'message': msg_str,
        'status': res_str,
        'assessment': res_str,
        'ai_result': res_str,
        'ai_confidence': conf,
        'ai_message': msg_str,
        'image_url': wound.image_path,
        'upload_date': wound.upload_date.strftime('%Y-%m-%d %H:%M:%S') if wound.upload_date else None
    }), 200

@wound_bp.route('/uploads/<filename>', methods=['GET'])
def serve_uploaded_file(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)

@wound_bp.route('/api/ai/assess', methods=['POST'])
@token_required()
def standalone_ai_assess(current_user):
    if 'image' not in request.files:
        return jsonify({'error': 'No image file uploaded.'}), 400

    file = request.files['image']
    if not file or file.filename == '':
        return jsonify({'error': 'No file selected for upload.'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Allowed formats: PNG, JPG, JPEG, WEBP, BMP.'}), 400

    filename = secure_filename(file.filename)
    temp_folder = current_app.config['UPLOAD_FOLDER']
    os.makedirs(temp_folder, exist_ok=True)
    temp_path = os.path.join(temp_folder, f"temp_{uuid.uuid4().hex[:6]}_{filename}")
    file.save(temp_path)

    try:
        assessment = analyze_wound_image(temp_path)
    except Exception as e:
        current_app.logger.error(f"Error in standalone AI assessment: {e}")
        assessment = {
            'result': 'Needs Attention',
            'status': 'Needs Attention',
            'classification': 'Needs Attention',
            'assessment': 'Needs Attention',
            'ai_result': 'Needs Attention',
            'confidence': 50.0,
            'ai_confidence': 50.0,
            'message': 'AI assessment could not be completed. Please try uploading the image again.',
            'ai_message': 'AI assessment could not be completed. Please try uploading the image again.',
            'disclaimer': 'This AI assessment is for academic demonstration only and is not a medical diagnosis.',
            'is_demo_model': True,
            'model_type': 'Prototype AI Assessment',
            'heuristics': {},
            'details': {}
        }
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass

    res_val = assessment.get('result') or assessment.get('classification', 'Healing Normally')
    conf_val = float(assessment.get('confidence', 85.0))
    msg_val = assessment.get('message', 'Prototype assessment completed.')
    disc_val = assessment.get('disclaimer', 'This AI assessment is for academic demonstration only and is not a medical diagnosis.')

    return jsonify({
        'result': res_val,
        'confidence': conf_val,
        'message': msg_val,
        'disclaimer': disc_val,
        'status': res_val,
        'assessment': res_val,
        'ai_result': res_val,
        'ai_confidence': conf_val,
        'ai_message': msg_val,
        'details': assessment.get('details', assessment.get('heuristics', {})),
        'ai_assessment': assessment
    }), 200
