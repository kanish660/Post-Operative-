import os
from dotenv import load_dotenv

# Load environment variables from .env before anything else
load_dotenv()

from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from models.database import db

# Import Blueprints
from routes.auth import auth_bp
from routes.patient import patient_bp
from routes.doctor import doctor_bp
from routes.recovery import recovery_bp
from routes.wound import wound_bp
from routes.alert import alert_bp
from routes.admin import admin_bp
from routes.report import report_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}, r"/uploads/*": {"origins": "*"}})

    # Initialize Database
    db.init_app(app)

    # Ensure Upload Folder Exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(patient_bp)
    app.register_blueprint(doctor_bp)
    app.register_blueprint(recovery_bp)
    app.register_blueprint(wound_bp)
    app.register_blueprint(alert_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(report_bp)

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'app': 'Post-Operative Patient Remote Recovery Tracker API',
            'version': '1.0.0'
        }), 200

    @app.route('/api/supabase-health', methods=['GET'])
    def supabase_health():
        """Test Supabase connection without exposing credentials."""
        try:
            from supabase_client import get_supabase, SUPABASE_URL
            sb = get_supabase()
            if not sb:
                return jsonify({
                    'supabase': 'not configured',
                    'note': 'Supabase credentials not set. App is using local database.'
                }), 200
            # Lightweight query to verify connectivity
            sb.table('_health_check_ping').select('*').limit(1).execute()
            return jsonify({
                'supabase': 'connected',
                'project_url': SUPABASE_URL.split('//')[1] if SUPABASE_URL else 'unknown'
            }), 200
        except Exception as e:
            error_msg = str(e)
            # If the table doesn't exist, the connection itself still worked
            if 'relation' in error_msg and 'does not exist' in error_msg:
                return jsonify({
                    'supabase': 'connected',
                    'note': 'Connection successful (test table does not exist, which is expected)'
                }), 200
            return jsonify({
                'supabase': 'disconnected',
                'error': error_msg
            }), 500

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500


    return app

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
    print("Starting Post-Operative Remote Recovery API Server on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)
